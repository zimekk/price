import { z } from "zod";

export const Equipment = z.object({
  aggregatedStandardOption: z.boolean(),
  categorizedOptionGroups: z
    .object({
      default_PL: z
        .object({
          optionGroups: z.string().array(),
          category: z.string(),
        })
        .array(),
    })
    .optional(),
  definedByVg: z.boolean().optional(),
  displayType: z.string().optional(),
  equipmentFlag: z.string().optional(),
  grossPrice: z.number().optional(),
  images: z.object({ default: z.string() }),
  marketingText: z.object({}),
  name: z.object({
    default_PL: z.string(),
    pl_PL: z.string().optional(),
    en_PL: z.string().optional(),
  }),
  nonDerivedDisplayType: z.string().optional(),
  offerPriceGross: z.number().optional(),
  optionFlag: z.string(),
  packageFlag: z.string(),
  standard: z.boolean(),
  translatedOptionGroups: z
    .object({
      default_PL: z.array(z.string()),
    })
    .optional(),
  translatedSalesGroups: z
    .object({
      default_PL: z.array(z.string().nullable()),
      pl_PL: z.array(z.string().nullable()),
      en_PL: z.array(z.string()),
    })
    .optional(),
  type: z.string(),
  ucpType: z.string().optional(),
  usageType: z.string().optional(),
});

export const DataSchema = z.object({
  documentId: z.string(),
  media: z.object({
    cosyImages: z.record(z.string(), z.string()),
    // eveCpMedia: z.object({
    //   configId: z.string(),
    //   contentBaseUrl: z.string(),
    //   expirationDate: z.string(),
    // }),
  }),
  ordering: z.object({
    distributionData: z.object({
      // actualLocationId: z.string().optional(),
      // bufferedDeliveryDate: z.string(),
      // carrierLoad: z.string().optional(),
      // dealerLocation: z
      //   .object({
      //     latitude: z.number(),
      //     longitude: z.number(),
      //   })
      //   .optional(),
      // addressLocale: z.unknown({}).optional(),
      // destinationLocationDomesticDealerNumber: z.string(),
      // distributionMot: z.string().optional(),
      // expectedDeliveryDate: z.string().optional(),
      // holds: z.object({
      //   agInvoiceHold: z.boolean().optional(),
      //   qualityHoldFlag: z.boolean(),
      //   vehDelHoldFlg: z.boolean().optional(),
      // }),
      // load: z.string().optional(),
      // manufacturerDistributionPrio: z.string().optional(),
      // qualityHoldFlag: z.boolean(),
      // shippingDealerNumber: z.string().optional(),
      // transportFlag: z.string().optional(),
      locationOutletNickname: z.string().optional(),
    }),
    // productionData: z.object({
    //   ckdFlag: z.boolean(),
    //   confirmedDeliveryDateFrom: z.string().optional(),
    //   confirmedDeliveryDateTo: z.string().optional(),
    //   confirmedDeliveryDateInitialFrom: z.string().optional(),
    //   confirmedDeliveryDateInitialTo: z.string().optional(),
    //   confirmedProductionWeek: z.string(),
    //   endOfProduction: z.string().optional(),
    //   engineNumber: z.string().optional(),
    //   factoryCode: z.string(),
    //   orderNumber: z.string(),
    //   orderStatus: z.number(),
    //   plannedEndOfProduction: z.string(),
    //   productionDataError: z.string(),
    //   productionDate: z.string(),
    //   productionProcess: z.string(),
    //   productionQuotaCode: z.string(),
    //   productType: z.string(),
    //   tsn: z.string().optional(),
    //   vin7: z.string(),
    //   vin10: z.string(),
    //   vin17: z.string(),
    // }),
  }),
  price: z.object({
    // listPriceCurrency: z.string(),
    // equipmentsTotalPrice: z.number(),
    equipmentsTotalGrossPrice: z.number(),
    // equipmentsTotalListPriceNet: z.number(),
    // equipmentsTotalListPriceGross: z.number(),
    // netListPrice: z.number(),
    // grossListPrice: z.number(),
    // netModelPrice: z.number(),
    // grossModelPrice: z.number(),
    // modelSalesPriceNet: z.number(),
    // modelSalesPriceGross: z.number(),
    // netSalesPrice: z.number(),
    grossSalesPrice: z.number(),
    // taxes: z.object({
    //   totalTaxes: z.number(),
    //   taxes: z
    //     .object({
    //       key: z.string(),
    //       category: z.string(),
    //       amount: z.number(),
    //       percentage: z.number(),
    //     })
    //     .array(),
    // }),
    priceUpdatedAt: z.string(),
  }),
  salesProcess: z.object({
    reason: z.string().optional(),
    type: z.enum(["AVAILABLE", "RESERVED_MANUAL", "SOLD"]),
  }),
  vehicleLifeCycle: z.object({ isRepaired: z.boolean().optional() }),
  vehicleSpecification: z.object({
    modelAndOption: z.object({
      // baseFuelType: z.string(),
      brand: z.string(),
      // bodyType: z.string(),
      // bodyTypeDescription: z.object({ pl_PL: z.string() }).optional(),
      color: z.object({
        hexColorCode: z.string(),
        // rgbColorCode: z.object({
        //   r: z.number(),
        //   g: z.number(),
        //   b: z.number(),
        // }),
        // labColorCode: z.object({
        //   l: z.number(),
        //   a: z.number(),
        //   b: z.number(),
        // }),
        clusterFine: z.string(),
        clusterRough: z.string(),
      }),
      //     colors: z
      //       .object({
      //         hexColorCode: z.string(),
      //         rgbColorCode: z.object({
      //           r: z.number(),
      //           g: z.number(),
      //           b: z.number(),
      //         }),
      //         labColorCode: z.object({
      //           l: z.number(),
      //           a: z.number(),
      //           b: z.number(),
      //         }),
      //         clusterFine: z.string(),
      //         clusterRough: z.string(),
      //       })
      //       .array(),
      //     driveType: z.string(),
      // equipments: z.record(Equipment),
      //     is48Volt: z.boolean(),
      //     marketingDriveType: z.string(),
      model: z.object({
        // agModelCode: z.string(),
        // derivative: z.string(),
        // effectDateRange: z.object({
        //   from: z.string(),
        //   to: z.string().optional(),
        // }),
        // modelDescription: z.object({
        //   default_PL: z.string(),
        //   pl_PL: z.string(),
        //   en_PL: z.string(),
        // }),
        modelName: z.string(),
        // steering: z.string(),
        // vgModelCode: z.string(),
      }),
      modelRange: z.object({
        name: z.string(),
        // description: z.object({
        //   default_PL: z.string(),
        //   pl_PL: z.string(),
        // }),
      }),
      //     numberOfColors: z.number(),
      //     numberOfGears: z.number(),
      paintType: z.string().optional(),
      //     series: z.object({ name: z.string() }),
      //     transmission: z.string(),
      //     retailSeries: z.object({ name: z.string() }),
      upholsteryColor: z
        .object({
          hexColorCode: z.string(),
          //       rgbColorCode: z.object({
          //         r: z.number(),
          //         g: z.number(),
          //         b: z.number(),
          //       }),
          //       labColorCode: z.object({
          //         l: z.number(),
          //         a: z.number(),
          //         b: z.number(),
          //       }),
          upholsteryColorCluster: z.string(),
        })
        .optional(),
      //     upholsteryType: z.string(),
      //     marketingModelRanges: z.object({}),
      //     marketingModelRange: z.string(),
      //     marketingSeries: z.array(z.string()),
      //     trim: z.object({
      //       default_PL: z.string(),
      //       pl_PL: z.string(),
      //       en_PL: z.string(),
    }),
  }),
});
// .passthrough();

export const ItemSchema = z.object({
  id: z.number(),
  item: z.string(),
  data: DataSchema,
  created: z.string(),
  checked: z.string().nullable(),
});
