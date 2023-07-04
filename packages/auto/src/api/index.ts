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
        `${API_URL}/stock/v1?${new URLSearchParams({
          limit,
        })}`
      )
    )
    .then((res) => res.json())
    .then((data) =>
      ItemSchema.extend({
        data: DataSchema.strip().pick({
          documentId: true,
          media: true,
          ordering: true,
          price: true,
          salesProcess: true,
          vehicleLifeCycle: true,
          vehicleSpecification: true,
        }),
      })
        .array()
        .parse(data.result)
        .splice(0, 10000)
    );
