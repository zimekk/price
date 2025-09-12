import { z } from "zod";

export const DataSchema = z.object({
  productSKU: z.string(),
  bvProductSku: z.string().optional(),
  productName: z.string(),
  stockStatus: z.string(),
  productId: z.string(),
  fullPrice: z.string().transform((price) => Number(price.replace(",", ""))),
  saleprice: z.string().transform((price) => Number(price.replace(",", ""))),
  primaryImageUrl: z.string(),
  badge: z.object({
    theme: z.string().or(z.boolean()),
    text: z.string().or(z.boolean().transform((v) => String(v))),
  }),
  review: z.object({ number: z.number(), stars: z.coerce.string() }),
  promotionalPriceCopy: z.string().optional(),
  parents: z.string().array().optional(),
});

export const ItemSchema = z.object({
  id: z.number(),
  item: z.string(),
  data: DataSchema,
  created: z.string(),
  checked: z.string().nullable(),
});

export type Data = z.infer<typeof DataSchema>;

export type Item = z.infer<typeof ItemSchema>;
