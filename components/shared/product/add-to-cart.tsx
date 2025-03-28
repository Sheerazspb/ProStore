"use client";
import { Cart, CartItem } from "@/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Plus, Minus, Loader } from "lucide-react";
import { toast } from "sonner";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { useTransition } from "react";

const AddToCart = ({ cart, item }: { cart?: Cart; item: CartItem }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Handle add to cart
  const handleAddToCart = async () => {
    startTransition(async () => {
      const res = await addItemToCart(item);
      if (!res.success) {
        toast.error(res.message);
        return;
      }

      toast.success(res.message, {
        action: {
          label: "View Cart",
          onClick: () => router.push("/cart"),
        },
      });
    });
  };
  // Handle remove from cart
  const handleRemoveFromCart = async () => {
    startTransition(async () => {
      const res = await removeItemFromCart(item.productId!);
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message, {
        action: {
          label: "View Cart",
          onClick: () => router.push("/cart"),
        },
      });
    });
  };
  // Check if item in the cart
  const existItem =
    cart && cart.items.find((x) => x.productId === item.productId!);

  return existItem ? (
    <div>
      <Button type="button" variant="outline" onClick={handleRemoveFromCart}>
        {isPending && <Loader className="h-4 w-4 mr-2 animate-spin" />}
        <Minus />
      </Button>
      <span className="px-2">{existItem.qty}</span>
      <Button type="button" variant="outline" onClick={handleAddToCart}>
        {isPending && <Loader className="h-4 w-4 mr-2 animate-spin" />}
        <Plus />
      </Button>
    </div>
  ) : (
    <Button
      className="w-full md:w-5/4"
      variant="default"
      type="button"
      onClick={handleAddToCart}
    >
      {isPending && <Loader className="h-4 w-4 mr-2 animate-spin" />}
      <Plus /> Add to Cart
    </Button>
  );
};

export default AddToCart;
