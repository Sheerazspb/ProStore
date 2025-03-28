"use server";

import { cookies } from "next/headers";
import { CartItem } from "@/types";
import { convertToPlainObj, formatError, round2 } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema, insertCartSchema } from "../validators";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

// Calculate cart prices
const calcPrice = (items: CartItem[]) => {
  const itemsPrice = round2(
      items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
    ),
    shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
    taxPrice = round2(itemsPrice * 0.15),
    totalPrice = round2(itemsPrice + shippingPrice + taxPrice);
  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

export async function addItemToCart(data: CartItem) {
  try {
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) {
      return { success: false, message: "Session cart id not found" };
    }
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    return await prisma.$transaction(async (tx) => {
      // Get Cart
      const cart = await tx.cart.findFirst({
        where: userId ? { userId } : { sessionCartId },
      });

      // parse and validate data
      const item = cartItemSchema.parse(data);

      // find the product in the database with a lock
      const product = await tx.product.findFirst({
        where: { id: item.productId },
      });
      if (!product) throw new Error("Product not found");

      if (!cart) {
        if (product.stock < item.qty) {
          throw new Error("Product is out of stock");
        }

        // create a new cart object
        const newCart = insertCartSchema.parse({
          userId,
          sessionCartId,
          items: [item],
          ...calcPrice([item]),
        });

        await tx.cart.create({ data: newCart });
        revalidatePath(`/products/${product.slug}`);
        return {
          success: true,
          message: `${item.name} added to cart`,
        };
      } else {
        // update the cart object
        const items = cart.items as CartItem[];
        const existItem = items.find((x) => x.productId === product.id);

        if (existItem) {
          const newQty = existItem.qty + 1;
          if (newQty > product.stock) {
            throw new Error("Product is out of stock");
          }
          existItem.qty = newQty;
        } else {
          if (product.stock < item.qty) {
            throw new Error("Product is out of stock");
          }
          items.push(item);
        }

        await tx.cart.update({
          where: { id: cart.id },
          data: {
            items: items as Prisma.CartUpdateitemsInput[],
            ...calcPrice(items),
          },
        });

        revalidatePath(`/products/${product.slug}`);
        return {
          success: true,
          message: `${product.name} ${
            existItem ? "updated in" : "added to"
          } cart`,
        };
      }
    });
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function getMyCart() {
  // get session cart id
  const sessionCartId = (await cookies()).get("sessionCartId")?.value;
  if (!sessionCartId) throw new Error("Session cart id not found");
  // get user id
  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;
  // get cart
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
  });
  if (!cart) return undefined;
  return convertToPlainObj({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
  });
}

export async function removeItemFromCart(productId: string) {
  try {
    // get session cart id
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Session cart id not found");
    // Get Product
    const product = await prisma.product.findFirst({
      where: { id: productId },
    });
    if (!product) throw new Error("Product not found");
    // Get user cart
    const cart = await getMyCart();
    if (!cart) throw new Error("Cart not found");
    // Check if product exists in cart
    const exist = (cart.items as CartItem[]).find(
      (x) => x.productId === productId
    );
    if (!exist) throw new Error("Product not found in cart");
    // Check if product is the last or only item in cart
    if (exist.qty === 1) {
      // Remove product from cart
      cart.items = (cart.items as CartItem[]).filter(
        (x) => x.productId !== exist.productId
      );
    } else {
      // Decrease product quantity in cart
      (cart.items as CartItem[]).find((x) => x.productId === productId)!.qty =
        exist.qty - 1;
    }
    // Update cart
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items as Prisma.CartUpdateitemsInput[],
        ...calcPrice(cart.items as CartItem[]),
      },
    });
    revalidatePath(`/products/${product.slug}`);
    return {
      success: true,
      message: `${product.name} removed from cart`,
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
