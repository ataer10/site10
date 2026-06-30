"use server";

import { revalidatePath } from "next/cache";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from "@/lib/data/admin-categories";

function revalidateAll() {
  // Kategoriler header mega menüsünde + ürün filtrelerinde + admin'de görünür
  revalidatePath("/", "layout");
  revalidatePath("/urunler");
  revalidatePath("/admin/kategoriler");
}

export async function createCategoryAction(name: string) {
  const res = await createCategory(name);
  if (res.ok) revalidateAll();
  return res;
}

export async function updateCategoryAction(id: string, name: string) {
  const res = await updateCategory(id, name);
  if (res.ok) revalidateAll();
  return res;
}

export async function deleteCategoryAction(id: string) {
  const res = await deleteCategory(id);
  if (res.ok) revalidateAll();
  return res;
}

export async function createSubcategoryAction(categoryId: string, name: string) {
  const res = await createSubcategory(categoryId, name);
  if (res.ok) revalidateAll();
  return res;
}

export async function updateSubcategoryAction(id: string, name: string) {
  const res = await updateSubcategory(id, name);
  if (res.ok) revalidateAll();
  return res;
}

export async function deleteSubcategoryAction(id: string) {
  const res = await deleteSubcategory(id);
  if (res.ok) revalidateAll();
  return res;
}
