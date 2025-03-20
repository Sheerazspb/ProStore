"use server";
import { convertToPlainObj } from "@/lib/utils";
import { LATEST_PRODUCTS_LIMIT } from "@/lib/constants";
import { prisma } from "@/db/prisma";

// Get latest products
export const getLatestProducts = async () => {
  const data = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: LATEST_PRODUCTS_LIMIT,
  });
  return convertToPlainObj(data);
}

// Get product details by slug
export const getProductBySlug = async (slug: string) => {
  return await prisma.product.findFirst({
    where: { slug },
  });
}

