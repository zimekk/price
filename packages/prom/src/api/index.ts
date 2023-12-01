import { z } from "zod";
// import { DataSchema, ItemSchema } from "../schema";
const API_URL = process.env.PRICE_API_URL || "/";

export default (query: unknown) =>
  z
    .object({
      ilike: z.string().default(""),
      limit: z.coerce.number().default(25).transform(String),
      start: z.coerce.number().default(0).transform(String),
    })
    .parseAsync(query)
    .then((query) => fetch(`${API_URL}/promo/v2?${new URLSearchParams(query)}`))
    .then((res) => res.json())
    .then((data) => data.result.splice(0, 10000));
