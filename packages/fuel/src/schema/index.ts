import { z } from "zod";

export const TYPES = ["pb", "pb+", "on", "on+", "lpg", "lpg+"] as const;

export const DataSchema = z
  .object({
    station_id: z.number(),
    x: z.number(),
    y: z.number(),
    network_id: z.number(),
    network_name: z.string(),
    map_img: z.string(),
  })
  .extend({
    address: z.string(),
    url: z.string(),
    map_img: z.string().optional(),
    petrol_list: z
      .object({
        type: z.enum(TYPES),
        price: z.coerce.number(),
      })
      .array(),
  });

export const ItemSchema = z.object({
  id: z.number(),
  data: DataSchema,
  created: z.string(),
});
