import { z } from "zod";

const Advert = z.object({
  id: z.string(),
  title: z.string(),
  createdAt: z.string(),
  shortDescription: z.string(),
  url: z.string(),
  badges: z.any(),
  category: z.object({
    id: z.string(),
    __typename: z.enum(["Category"]),
  }),
  location: z.object({
    city: z.object({
      name: z.string(),
      __typename: z.enum(["AdministrativeLevel"]),
    }),
    region: z.object({
      name: z.string(),
      __typename: z.enum(["AdministrativeLevel"]),
    }),
    __typename: z.enum(["Location"]),
  }),
  thumbnail: z
    .object({
      x1: z.string(),
      x2: z.string(),
      __typename: z.enum(["Image"]),
    })
    .nullable(),
  price: z
    .object({
      amount: z.object({
        units: z.number(),
        currencyCode: z.enum(["EUR", "PLN"]),
        __typename: z.enum(["Money"]),
      }),
      badges: z.any(),
      grossPrice: z.any(),
      netPrice: z.any(),
      __typename: z.enum(["Price"]),
    })
    .strict(),
  parameters: z
    .object({
      key: z.enum([
        "country_origin",
        "engine_capacity",
        "engine_power",
        "fuel_type",
        "gearbox",
        "make",
        "mileage",
        "model",
        "show_pir",
        "version",
        "year",
      ]),
      displayValue: z.string(),
      value: z.string(),
      __typename: z.enum(["AdvertParameter"]),
    })
    .array(),
  sellerLink: z.object({
    id: z.string(),
    name: z.string().nullable(),
    websiteUrl: z.string().nullable(),
    logo: z
      .object({
        x1: z.string(),
        __typename: z.enum(["Image"]),
      })
      .nullable(),
    __typename: z.enum(["AdvertSellerLink"]),
  }),
  brandProgram: z
    .object({
      logo: z.any(),
      name: z.any(),
      searchUrl: z.any(),
      __typename: z.enum(["BrandProgram"]),
    })
    .strict()
    .nullable(),
  dealer4thPackage: z
    .object({
      package: z.object({
        id: z.string(),
        name: z.string(),
        __typename: z.enum(["SellerPackage"]),
      }),
      services: z.any(),
      photos: z
        .object({
          nodes: z.any(),
          totalCount: z.number(),
          __typename: z.enum(["PhotosCollection"]),
        })
        .strict(),
      __typename: z.enum(["AdvertDealer4thPackage"]),
    })
    .strict()
    .nullable(),
  priceEvaluation: z
    .object({
      indicator: z.enum(["ABOVE", "BELOW", "IN", "NONE"]),
      __typename: z.enum(["PriceEvaluation"]),
    })
    .optional(),
  __typename: z.enum(["Advert"]),
});

export const DataSchema = Advert;

export const ItemSchema = z.object({
  id: z.string(),
  // item: z.string(),
  data: DataSchema,
  created: z.string(),
  // checked: z.string().nullable(),
});
