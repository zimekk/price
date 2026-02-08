import { z } from "zod";
import { ItemSchema } from "../../schema";

const API_URL = process.env.PRICE_API_URL || "/";

export default (query: unknown) =>
  z
    .object({
      item: z.string(),
    })
    .parseAsync(query)
    .then(({ item }) =>
      fetch(
        `${API_URL}/prods/history?${new URLSearchParams({
          item,
        })}`,
      ),
    )
    .then((res) => res.json())
    .then((data) => ItemSchema.array().parse(data.result));
// .catch(console.error);
