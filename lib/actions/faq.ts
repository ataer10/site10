"use server";

import { revalidatePath } from "next/cache";
import { updateFaq } from "@/lib/data/faq";
import type { FaqItem } from "@/lib/content";

export async function saveFaqAction(items: FaqItem[]) {
  const res = await updateFaq(items);
  if (res.ok) {
    revalidatePath("/", "layout"); // anasayfa SSS yeniden üretilsin
    revalidatePath("/admin/sss");
  }
  return res;
}
