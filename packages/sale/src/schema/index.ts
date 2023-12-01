import { z } from "zod";

export const ProductSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    url: z.string(),
    photo: z.string(),
    rate: z.number(),
    rate_count: z.number(),
    // features: z.record(z.string()).array(),
    price: z.number(),
    previous_price: z.number(),
    filter_values: z.array(z.string()),
    popularity: z.number(),
    mark: z.string(),
  })
  .transform(
    ({ id, name, photo, price, previous_price, rate, rate_count }) => ({
      id,
      name,
      photo,
      priceInfo: {
        price,
        oldPrice: previous_price || null,
      },
      availabilityStatus: "",
      freeShipping: false,
      rating: rate,
      ratingCount: rate_count,
    }),
  );

export const GeneralSchema = z.object({
  date_start: z.string(),
  date_start_utc: z.string(),
  date_stop: z.string(),
  date_stop_utc: z.string(),
  enabled: z.boolean(),
  id: z.number(),
  name: z.string(),
  url: z.string(),
});

const PromoSchema = z.object({
  filters: z
    .object({
      id: z.number(),
      name: z.string(),
      position: z.number(),
      type: z.enum(["availability", "custom", "price", "producer"]),
      values: z
        .object({
          count: z.number(),
          id: z.number(),
          name: z.string(),
          position: z.number(),
        })
        .array(),
      view: z.enum(["select", "range"]),
    })
    .array(),
  general: GeneralSchema,
  products: ProductSchema.array(),
  seo: z
    .object({
      description: z.string(),
      keywords: z.string(),
      robots: z.string(),
      title: z.string(),
    })
    .or(z.array(z.object({ _trap: z.string() }))),
});

export const DataSchema = PromoSchema;

export const ItemSchema = z.object({
  id: z.number(),
  item: z.string(),
  data: DataSchema,
  created: z.string(),
  checked: z.string().nullable(),
});
