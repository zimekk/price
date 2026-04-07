import { z } from "zod";

export const MARKS = [
  "CashBack",
  "ForTeacher",
  "Installment0Percent",
  "LastItems",
  "New",
  "PlusGratis",
  "Presale",
  "Promotion",
  "RecommendedProduct",
] as const;

export const DataSchema = z.object({
  brand: z.string(),
  description: z.string(),
  gtin: z.string().optional(),
  gtin13: z.string().optional(),
  image: z.string().optional(),
  name: z.string(),
  productID: z.string().optional(),
  sku: z.string(),
  url: z.string().optional(),
  offers: z
    .object({
      availability: z.string().optional(),
      price: z.number(),
      priceCurrency: z.string(),
      // priceValidUntil: z.string().optional(),
      url: z.string(),
    })
    .optional(),
});

export const ItemSchema = z.object({
  id: z.number().optional(),
  type: z.string().default(""),
  item: z.string(),
  data: DataSchema,
  created: z.string(),
  // checked: z.string().nullable(),
  updated: z.string().nullable(),
});

export type Data = z.infer<typeof DataSchema>;

export type Item = z.infer<typeof ItemSchema>;
