import { z } from "zod";

const MoneyType = z.object({
  value: z.number(),
  currency: z.enum(["EUR", "PLN", "USD"]),
  __typename: z.literal("Money"),
});

const Ad = z.object({
  id: z.number(),
  slug: z.string(),
  seo: z.object({
    details: z.object({
      __typename: z.string(),
      description: z.string(),
    }),
    __typename: z.string(),
  }),
  title: z.string(),
  agency: z
    .object({
      id: z.number(),
      name: z.string(),
      slug: z.string(),
      type: z.string(),
      imageUrl: z.string().nullable(),
      __typename: z.string(),
      highlightedAds: z.boolean(),
      brandingVisible: z.boolean(),
    })
    .nullable(),
  estate: z.string(),
  images: z
    .object({
      large: z.string(),
      medium: z.string(),
      __typename: z.string(),
    })
    .array(),
  location: z
    .object({
      address: z.object({
        city: z.object({ name: z.string(), __typename: z.string() }),
        street: z
          .object({
            name: z.string(),
            number: z.string(),
            __typename: z.literal("Street"),
          })
          .nullable(),
        province: z.object({ name: z.string(), __typename: z.string() }),
        __typename: z.string(),
      }),
      __typename: z.string(),
      mapDetails: z
        .object({ radius: z.number(), __typename: z.string() })
        .strict(),
      reverseGeocoding: z
        .object({
          locations: z
            .object({ fullName: z.string(), __typename: z.string() })
            .array(),
          __typename: z.string(),
        })
        .optional(),
    })
    .strict(),
  openDays: z.string(),
  hidePrice: z.boolean(),
  rentPrice: MoneyType.nullable(),
  __typename: z.string(),
  isPromoted: z.boolean(),
  pushedUpAt: z.string().nullable(),
  totalPrice: MoneyType.nullable(),
  dateCreated: z.string(),
  roomsNumber: z.string().nullable(),
  transaction: z.string(),
  specialOffer: z.null(),
  developmentId: z.number().optional(),
  locationLabel: z
    .object({
      value: z.string(),
      locale: z.string(),
      __typename: z.string(),
    })
    .strict(),
  peoplePerRoom: z.null(),
  developmentUrl: z.string().optional(),
  isPrivateOwner: z.boolean(),
  investmentState: z.null(),
  dateCreatedFirst: z.string(),
  developmentTitle: z.string().optional(),
  isExclusiveOffer: z.boolean(),
  areaInSquareMeters: z.number(),
  pricePerSquareMeter: MoneyType.nullable(),
  totalPossibleImages: z.number(),
  investmentUnitsNumber: z.null(),
  priceFromPerSquareMeter: z.null(),
  terrainAreaInSquareMeters: z.number().nullable(),
  investmentUnitsRoomsNumber: z.null(),
  investmentEstimatedDelivery: z.null(),
  investmentUnitsAreaInSquareMeters: z.null(),
});

export const DataSchema = Ad.strict();

export const ItemSchema = z.object({
  id: z.number(),
  item: z.string(),
  data: DataSchema,
  created: z.string(),
  checked: z.string().nullable(),
});
