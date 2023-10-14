import { z } from "zod";
import { ItemSchema } from "../schema";

const API_URL = process.env.PRICE_API_URL || "/";

export default (query: unknown) =>
  z
    .object({
      limit: z.coerce.number().default(100).transform(String),
    })
    .parseAsync(query)
    .then(({ limit }) =>
      fetch(
        `${API_URL}/prods?${new URLSearchParams({
          limit,
        })}`
      )
    )
    .then((res) => res.json())
    .then((data) => ItemSchema.array().parse(data.result));
// .catch(console.error);
