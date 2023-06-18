import { z } from "zod";

export const DataSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  unit: z.string(),
  brand: z.string(),
  caption: z.string(),
  category: z.string(),
  cmpDescription: z.string().optional(),
  availability: z.string(),
  pricePerUnit: z.string(),
  promotion: z.unknown(),
  promotionTo: z.string().optional(),
  promotionFrom: z.string().optional(),
  price: z.number(),
  oldPrice: z.number().optional(),
  lastLowestPrice: z.number().optional(),
  pictures: z
    .object({
      small: z.string(),
    })
    .array(),
});

export const ItemSchema = z.object({
  id: z.number(),
  item: z.string(),
  data: DataSchema,
  created: z.string(),
  checked: z.string().nullable(),
});
