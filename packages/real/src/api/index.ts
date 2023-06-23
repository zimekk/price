import { z } from "zod";
import { DataSchema, ItemSchema } from "../schema";

const API_URL = process.env.PRICE_API_URL || "/";

export default (query: unknown) =>
  z
    .object({
      limit: z.coerce.number().default(100).transform(String),
    })
    .parseAsync(query)
    .then(({ limit }) =>
      fetch(
        `${API_URL}/rynek?${new URLSearchParams({
          limit,
        })}`
      )
    )
    .then((res) => res.json())
    .then((data) =>
      ItemSchema.extend({
        data: DataSchema,
      })
        .array()
        .parse(data.result)
        .splice(0, 10000)
    );
