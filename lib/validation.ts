import { z } from "zod";

/* ----------------------------- Teklif ----------------------------- */

/** Müşteri iletişim alanları (teklif formu). */
export const quoteCustomerSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Ad soyad gerekli")
    .max(120, "Çok uzun"),
  company: z.string().trim().max(160, "Çok uzun").optional().or(z.literal("")),
  email: z.string().trim().min(1, "E-posta gerekli").email("Geçerli bir e-posta girin"),
  phone: z
    .string()
    .trim()
    .min(7, "Geçerli bir telefon girin")
    .max(30, "Çok uzun")
    .optional()
    .or(z.literal("")),
  note: z.string().trim().max(2000, "Çok uzun").optional().or(z.literal("")),
});

export type QuoteCustomerInput = z.infer<typeof quoteCustomerSchema>;

/** Sepetten gelen kalem (yalnızca slug + adet sunucuya gönderilir; fiyat sunucuda dondurulur). */
export const quoteItemInputSchema = z.object({
  slug: z.string().min(1),
  qty: z.number().int().min(1).max(9999),
});

export type QuoteItemInput = z.infer<typeof quoteItemInputSchema>;

/** Server Action payload'u: müşteri + kalemler. */
export const createQuoteSchema = quoteCustomerSchema.extend({
  items: z.array(quoteItemInputSchema).min(1, "Sepet boş"),
});

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;

/* ---------------------------- İletişim ---------------------------- */

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Ad soyad gerekli").max(120),
  email: z.string().trim().min(1, "E-posta gerekli").email("Geçerli bir e-posta girin"),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  subject: z.string().trim().max(160).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Mesaj en az 10 karakter olmalı").max(3000),
});

export type ContactInput = z.infer<typeof contactSchema>;
