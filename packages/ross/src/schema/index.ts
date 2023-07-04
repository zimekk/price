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
  navigateUrl: z.string(),
  lastLowestPrice: z.number().optional(),
  oldPrice: z.number().optional(),
  price: z.number(),
  pricePerUnit: z.string(),
  promotion: z.unknown(),
  promotionTo: z.string().optional(),
  promotionFrom: z.string().optional(),
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
