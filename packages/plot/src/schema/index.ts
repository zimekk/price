import { z } from "zod";
import { DataSchema } from "@zimekk/scrap-schema";

// export { DataSchema };

export const ItemSchema = z.object({
  id: z.number(),
  item: z.string(),
  data: DataSchema,
  created: z.string(),
  checked: z.string().nullable(),
});

export type Data = z.infer<typeof DataSchema>;

export type Item = z.infer<typeof ItemSchema>;
