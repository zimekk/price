import { z } from "zod";

export const PhotoSchema = z.object({
  url: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  urlTemplate: z.string().optional(),
});

export const DataSchema = z
  .object({
    featureSummary: z.string().array().optional(),
    featureSummaryStructured: z
      .object({
        shortName: z.string(),
        description: z.string().nullable(),
        valueSeparator: z.string(),
        valueGroups: z
          .object({ shortName: z.string(), description: z.string().nullable() })
          .array(),
      })
      .array()
      .optional(),
    availabilityStatus: z.enum(["Available", "Unavailable"]).optional(),
    producerCode: z.string().optional(),
    freeInstallment: z.boolean().optional(),
    installmentMinimum: z.number().optional(),
    alternativeGroupId: z.string().optional(),
    alternativeProducts: z.unknown().array().optional(),
    mark: z.string().optional(),
    oldPrice: z.number().optional(),
    priceInfo: z.object({
      price: z.number(),
      oldPrice: z.number().nullable(),
      isPriceVisible: z.boolean(),
    }),
    producer: z.object({ id: z.string(), name: z.string() }),
    isEsd: z.boolean(),
    esdType: z.string(),
    productLink: z.string(),
    photo: PhotoSchema,
    rating: z.number().optional(),
    ratingCount: z.number().optional(),
    commentsCount: z.number().optional(),
    freeShipping: z.boolean().optional(),
    id: z.string(),
    name: z.string(),
    price: z.number(),
    category: z.object({
      id: z.string(),
      parentGroupId: z.string().optional(),
    }),
    questionsAndAnswers: z.boolean(),
    isFetching: z.boolean(),
  })
  .strict();

export const ItemSchema = z.object({
  id: z.number(),
  item: z.string(),
  data: DataSchema,
  created: z.string(),
  checked: z.string().nullable(),
});
