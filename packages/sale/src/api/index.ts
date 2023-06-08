// import { DataSchema, ItemSchema } from "../schema";
const API_URL = process.env.PRICE_API_URL || "/";

export default () =>
  fetch(
    `${API_URL}/promo?${new URLSearchParams({
      limit: String(10),
    })}`
  )
    .then((res) => res.json())
    .then((data) => data.result.splice(0, 10000));
