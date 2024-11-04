import { z } from "zod";

export const DataSchema = z.object({
  brand: z.string(),
  category: z.string(),
  id: z.number(),
  image: z.string(),
  name: z.string(),
  price: z.number(),
  url: z.string(),
  variant: z.string(),
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
