import { DataSchema, ItemSchema } from "../schema";

const API_URL = process.env.PRICE_API_URL || "/";

export default () =>
  fetch(
    `${API_URL}/euro?${new URLSearchParams({
      limit: String(500),
    })}`
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
