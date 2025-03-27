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
  const sessionCartId = (await cookies()).get("sessionCartId")?.value;
  if (!sessionCartId) {
    return { success: false, message: "Session cart id not found" };
  }
  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;

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
