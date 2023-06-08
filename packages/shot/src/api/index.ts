// import { DataSchema, ItemSchema } from "../schema";
const API_URL = process.env.PRICE_API_URL || "/";

export default () =>
  fetch(
    `${API_URL}/shots?${new URLSearchParams({
      limit: String(1000),
    })}`
  )
    .then((res) => res.json())
    .then((data) => data.result.splice(0, 10000));
