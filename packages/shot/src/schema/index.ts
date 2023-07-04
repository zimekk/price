import { z } from "zod";

export const PhotoSchema = z
  .object({
    Url: z.string(),
    ThumbnailUrl: z.string(),
    UrlTemplate: z.string().nullable(),
  })
  .transform(({ Url, ThumbnailUrl, UrlTemplate }) => ({
    url: Url,
    thumbnailUrl: ThumbnailUrl,
    urlTemplate: UrlTemplate,
  }));

export const HotShotSchema = z
  .object({
    Id: z.string(),
    Price: z.number(),
    OldPrice: z.number(),
    PromotionGainText: z.string(),
    PromotionGainTextLines: z.string().array(),
    PromotionGainValue: z.number(),
    PromotionTotalCount: z.number(),
    SaleCount: z.number(),
    MaxBuyCount: z.number(),
    PromotionName: z.string(),
    PromotionEnd: z.string(),
    PromotionPhoto: PhotoSchema,
    Product: z.object({
      AvailabilityStatus: z.enum(["Available", "Unavailable"]),
      IsEsd: z.boolean(),
      Name: z.string(),
      MainPhoto: PhotoSchema,
      // Photos: PhotoSchema.array(),
      Price: z.number(),
      ProducerCode: z.string(),
      Producer: z.object({
        Id: z.string(),
        Name: z.string(),
      }),
      ProductDescription: z.string().nullable(),
      WebUrl: z.string(),
    }),
  })
  .transform(
    ({
      Id,
      Price,
      OldPrice,
      Product: { WebUrl, MainPhoto, Name, Producer, AvailabilityStatus },
    }) => ({
      id: Id,
      url: WebUrl,
      name: Name,
      featureSummary: [],
      producer: {
        name: Producer.Name,
      },
      photo: MainPhoto,
      priceInfo: {
        price: Price,
        oldPrice: OldPrice,
      },
      availabilityStatus: AvailabilityStatus,
      freeShipping: false,
      ratingCount: 0,
      rating: 0,
    })
  );

export const DataSchema = HotShotSchema;

export const ItemSchema = z.object({
  id: z.number(),
  item: z.string(),
  data: DataSchema,
  created: z.string(),
  checked: z.string().nullable(),
});

// export interface Item {
//   id: number;
//   item: string;
//   data: z.infer<typeof HotShotSchema>;
//   created: string;
//   checked: string | null;
//   updated: string | null;
//   removed: string | null;
// }

// const HotShotErrorSchema = z.object({
//   Message: z.string(),
// });

// export const Schema = z.object({
//   // json: z.union([HotShotErrorSchema, HotShotSchema]),
//   json: HotShotSchema,
// });
