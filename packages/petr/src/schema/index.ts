import { z } from "zod";

export const DataSchema = z.object({
  availability: z.string(),
  brand: z.string(),
  category: z.string(),
  id: z.string(),
  image: z.string().optional(),
  name: z.string(),
  price: z.number(),
  priceCurrency: z.string(),
  url: z.string(),
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
