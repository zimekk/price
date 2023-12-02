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
    .then(({ start, limit, ...query }) =>
      fetch(
        `${API_URL}/promo/v2?${new URLSearchParams({
          start,
          limit: String(Number(limit) + 1),
          ...query,
        })}`,
      )
        .then((res) => res.json())
        .then(
          ({ result }) => (
            console.log(
              { start, limit },
              result.length,
              result.length > Number(limit),
            ),
            {
              result: result.slice(0, Number(limit)),
              offset:
                result.length > Number(limit)
                  ? Number(start) + Number(limit)
                  : 0,
            }
          ),
        ),
    );
