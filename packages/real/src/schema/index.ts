import { z } from "zod";
import { DataSchema } from "@zimekk/scrap-rynek-schema";

export { DataSchema };

export const ItemSchema = z.object({
  id: z.number(),
  item: z.string(),
  data: DataSchema,
  created: z.string(),
  checked: z.string().nullable(),
});
