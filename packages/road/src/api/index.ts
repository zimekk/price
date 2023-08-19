import { z } from "zod";
// import { DataSchema, ItemSchema } from "../schema";

const API_URL = "https://api.um.warszawa.pl/api/action/dbstore_get/";

const ItemSchema = z
  .object({
    values: z
      .object({
        key: z.string(),
        value: z.string(),
      })
      .array(),
  })
  .transform(({ values }) =>
    values.reduce(
      (result, { key, value }) => Object.assign(result, { [key]: value }),
      {}
    )
  );

const DataSchema = z
  .object({
    result: ItemSchema.array(),
  })
  .transform(({ result }) => result);

export default (query: unknown) =>
  z
    .object({
      limit: z.coerce.number().default(100),
    })
    .parseAsync(query)
    .then(({ limit }) =>
      fetch(`${API_URL}?id=ab75c33d-3a26-4342-b36a-6e5fef0a3ac3`)
        .then((res) => res.json())
        .then((data) => DataSchema.parseAsync(data))
        .then((list) => list.splice(0, limit))
    );
