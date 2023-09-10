import { z } from "zod";

export const DataSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  category: z.object({
    id: z.number(),
    type: z.string(),
    itemType: z.string(),
  }),
  map: z.object({
    zoom: z.number(),
    lat: z.number(),
    lon: z.number(),
    radius: z.number(),
    show_detailed: z.boolean(),
  }),
  isBusiness: z.boolean(),
  url: z.string(),
  isHighlighted: z.boolean(),
  isPromoted: z.boolean(),
  promotion: z.object({
    highlighted: z.boolean(),
    urgent: z.boolean(),
    top_ad: z.boolean(),
    options: z.string().array(),
    b2c_ad_page: z.boolean(),
    premium_ad_page: z.boolean(),
  }),
  delivery: z.object({
    rock: z.object({
      offer_id: z.null(),
      active: z.boolean(),
      mode: z.string(),
    }),
  }),
  createdTime: z.string(),
  lastRefreshTime: z.string(),
  validToTime: z.string(),
  isActive: z.boolean(),
  status: z.string(),
  params: z
    .object({
      key: z.string(),
      name: z.string(),
      type: z.string(),
      value: z.string(),
      normalizedValue: z.string(),
    })
    .array(),
  itemCondition: z.string(),
  price: z.object({
    budget: z.boolean(),
    free: z.boolean(),
    exchange: z.boolean(),
    displayValue: z.string(),
    regularPrice: z.object({
      value: z.number(),
      currencyCode: z.string(),
      currencySymbol: z.string(),
      negotiable: z.boolean(),
      priceFormatConfig: z.object({
        decimalSeparator: z.string(),
        thousandsSeparator: z.string(),
      }),
    }),
  }),
  salary: z.null(),
  partner: z.object({ code: z.string() }),
  isJob: z.boolean(),
  photos: z.string().array(),
  photosSet: z.string().array(),
  location: z.object({
    cityName: z.string(),
    cityId: z.number(),
    cityNormalizedName: z.string(),
    regionName: z.string(),
    regionId: z.number(),
    regionNormalizedName: z.string(),
    districtName: z.string().nullable(),
    districtId: z.number(),
    pathName: z.string(),
  }),
  urlPath: z.string(),
  contact: z.object({
    chat: z.boolean(),
    courier: z.boolean(),
    name: z.string(),
    negotiation: z.boolean(),
    phone: z.boolean(),
  }),
  user: z.object({
    id: z.number(),
    name: z.string(),
    photo: z.string().nullable(),
    logo: z.string().nullable(),
    otherAdsEnabled: z.boolean(),
    socialNetworkAccountType: z.string().nullable(),
    isOnline: z.boolean(),
    lastSeen: z.string(),
    about: z.string(),
    bannerDesktopURL: z.string(),
    logo_ad_page: z.string().nullable(),
    company_name: z.string(),
    created: z.string(),
    sellerType: z.null(),
    uuid: z.string(),
  }),
  shop: z.object({ subdomain: z.string().nullable() }),
  safedeal: z.object({
    weight: z.number(),
    weight_grams: z.number(),
    status: z.string(),
    safedeal_blocked: z.boolean(),
    allowed_quantity: z.unknown().array(),
  }),
  searchReason: z.string(),
  isNewFavouriteAd: z.boolean(),
});

export const ItemSchema = z.object({
  id: z.number(),
  item: z.string(),
  data: DataSchema,
  created: z.string(),
  checked: z.string().nullable(),
});

export type Data = z.infer<typeof DataSchema>;

export type Item = z.infer<typeof ItemSchema>;
