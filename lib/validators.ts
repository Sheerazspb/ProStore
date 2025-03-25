import { z } from "zod";
import { formatNumber } from "./utils";

const currency = z.string().refine((value) => /^\d+(\.\d{2})?$/.test(formatNumber(Number(value))),"Price must have two decimal places")
// Schema for Product
export const insertProductSchema = z.object({
  name: z.string().min(3,"Name must be at least 3 characters").trim(),
  slug: z.string().min(3,"Slug must be at least 3 characters").trim(),
  category: z.string().min(3,"Category must be at least 3 characters").trim(),
  brand: z.string().min(3,"Brand must be at least 3 characters").trim(),
  description: z.string().min(10,"Description must be at least 10 characters").trim(),
  stock: z.coerce.number().min(0,"Stock must be greater than 0"),
  images: z.array(z.string()).min(1,"Product must have at least one image"),
  isFeatured: z.boolean(),
  banner: z.string().nullable(),
  price: currency,
});
// Schema for Signin
export const signInFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6,"Password must be at least 6 characters"),
});

// Schema for SignUp
export const signUpFormSchema = z.object({
  name: z.string().min(3,"Name must be at least 3 characters").trim(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6,"Password must be at least 6 characters"),
  confirmPassword: z.string().min(6,"Confirm password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

//  cart schemas
export const cartItemSchema = z.object({
  productId: z.string().min(1,"Product is required"),
  name: z.string().min(1,"Product name is required"),
  slug: z.string().min(1,"Product slug is required"),
  qty:z.number().int().nonnegative("Quantity must be a positive integer"),
  image: z.string().min(1,"Product image is required"),
  price: currency,
})

export const insertCartSchema = z.object({
  items: z.array(cartItemSchema),
  itemsPrice: currency,
  totalPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  sessionCartId: z.string().min(1,"Session cart id is required"),
  userId: z.string().optional().nullable(),
})