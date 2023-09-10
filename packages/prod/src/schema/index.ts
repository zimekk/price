import { z } from "zod";

export const DataSchema = z.object({
  id: z.string(),
  url: z.string(),
  brand: z.string(),
  name: z.string(),
  images: z.string().array(),
  oldPrice: z.number().optional(),
  price: z.number(),
});

export const ItemSchema = z.object({
  id: z.string(),
  type: z.string(),
  item: z.string(),
  data: DataSchema,
  created: z.string(),
  // checked: z.string().nullable(),
  updated: z.string().nullable(),
});

export type Data = z.infer<typeof DataSchema>;

export type Item = z.infer<typeof ItemSchema>;
