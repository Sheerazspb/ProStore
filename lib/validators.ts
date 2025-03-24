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