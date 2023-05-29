import {
  ChangeEventHandler,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import dayjs from "dayjs";
import { Subject, debounceTime, distinctUntilChanged, map } from "rxjs";
import { z } from "zod";

interface FiltersState {
  search: string;
}

function Loading() {
  return <div>Loading...</div>;
}

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
  images: z.object({ default: z.string() }),
  marketingText: z.object({}),
  name: z.object({
    default_PL: z.string(),
    pl_PL: z.string().optional(),
    en_PL: z.string().optional(),
  }),
  nonDerivedDisplayType: z.string().optional(),
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

export const DataSchema = z
  .object({
    documentId: z.string(),
    media: z.object({
      cosyImages: z.record(z.string()),
      eveCpMedia: z.object({
        configId: z.string(),
        contentBaseUrl: z.string(),
        expirationDate: z.string(),
      }),
    }),
    ordering: z.object({
      distributionData: z.object({
        actualLocationId: z.string().optional(),
        bufferedDeliveryDate: z.string(),
        carrierLoad: z.string().optional(),
        dealerLocation: z
          .object({
            latitude: z.number(),
            longitude: z.number(),
          })
          .optional(),
        addressLocale: z.object({}),
        destinationLocationDomesticDealerNumber: z.string(),
        distributionMot: z.string().optional(),
        expectedDeliveryDate: z.string().optional(),
        holds: z.object({
          agInvoiceHold: z.boolean(),
          qualityHoldFlag: z.boolean(),
          vehDelHoldFlg: z.boolean(),
        }),
        load: z.string().optional(),
        manufacturerDistributionPrio: z.string().optional(),
        qualityHoldFlag: z.boolean(),
        shippingDealerNumber: z.string(),
        transportFlag: z.string().optional(),
        locationOutletNickname: z.string().optional(),
      }),
      productionData: z.object({
        ckdFlag: z.boolean(),
        confirmedDeliveryDateFrom: z.string().optional(),
        confirmedDeliveryDateTo: z.string().optional(),
        confirmedDeliveryDateInitialFrom: z.string().optional(),
        confirmedDeliveryDateInitialTo: z.string().optional(),
        confirmedProductionWeek: z.string(),
        endOfProduction: z.string().optional(),
        engineNumber: z.string().optional(),
        factoryCode: z.string(),
        orderNumber: z.string(),
        orderStatus: z.number(),
        plannedEndOfProduction: z.string(),
        productionDataError: z.string(),
        productionDate: z.string(),
        productionProcess: z.string(),
        productionQuotaCode: z.string(),
        productType: z.string(),
        tsn: z.string().optional(),
        vin7: z.string(),
        vin10: z.string(),
        vin17: z.string(),
      }),
    }),
    price: z.object({
      listPriceCurrency: z.string(),
      equipmentsTotalPrice: z.number(),
      equipmentsTotalGrossPrice: z.number(),
      equipmentsTotalListPriceNet: z.number(),
      equipmentsTotalListPriceGross: z.number(),
      netListPrice: z.number(),
      grossListPrice: z.number(),
      netModelPrice: z.number(),
      grossModelPrice: z.number(),
      modelSalesPriceNet: z.number(),
      modelSalesPriceGross: z.number(),
      netSalesPrice: z.number(),
      grossSalesPrice: z.number(),
      taxes: z.object({
        totalTaxes: z.number(),
        taxes: z
          .object({
            key: z.string(),
            category: z.string(),
            amount: z.number(),
            percentage: z.number(),
          })
          .array(),
      }),
      priceUpdatedAt: z.string(),
    }),
    salesProcess: z.object({ reason: z.string(), type: z.string() }),
    vehicleLifeCycle: z.object({ isRepaired: z.boolean() }),
    vehicleSpecification: z.object({
      modelAndOption: z.object({
        baseFuelType: z.string(),
        brand: z.string(),
        bodyType: z.string(),
        bodyTypeDescription: z.object({ pl_PL: z.string() }).optional(),
        color: z.object({
          hexColorCode: z.string(),
          rgbColorCode: z.object({
            r: z.number(),
            g: z.number(),
            b: z.number(),
          }),
          labColorCode: z.object({
            l: z.number(),
            a: z.number(),
            b: z.number(),
          }),
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
        equipments: z.record(Equipment),
        //     is48Volt: z.boolean(),
        //     marketingDriveType: z.string(),
        model: z.object({
          agModelCode: z.string(),
          derivative: z.string(),
          effectDateRange: z.object({
            from: z.string(),
            to: z.string().optional(),
          }),
          modelDescription: z.object({
            default_PL: z.string(),
            pl_PL: z.string(),
            en_PL: z.string(),
          }),
          modelName: z.string(),
          steering: z.string(),
          vgModelCode: z.string(),
        }),
        modelRange: z.object({
          name: z.string(),
          description: z.object({
            default_PL: z.string(),
            pl_PL: z.string(),
          }),
        }),
        //     numberOfColors: z.number(),
        //     numberOfGears: z.number(),
        //     paintType: z.string(),
        //     series: z.object({ name: z.string() }),
        //     transmission: z.string(),
        //     retailSeries: z.object({ name: z.string() }),
        //     upholsteryColor: z.object({
        //       hexColorCode: z.string(),
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
        //       upholsteryColorCluster: z.string(),
        //     }),
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
  })
  .passthrough();

const ItemSchema = z.object({
  id: z.number(),
  item: z.string(),
  data: DataSchema,
  created: z.string(),
  checked: z.string().nullable(),
});

type Data = z.infer<typeof DataSchema>;

type Item = z.infer<typeof ItemSchema>;

function Gallery({ data }: { data: Data }) {
  return (
    <div style={{ marginRight: "1em" }}>
      {Object.values(data.media.cosyImages)
        .slice(0, 1)
        .map((url, key) => (
          <img key={key} src={url} width="200" referrerPolicy="no-referrer" />
        ))}
    </div>
  );
}

function Summary({ data }: { data: Data }) {
  return (
    <div>
      <strong>{data.vehicleSpecification.modelAndOption.brand}</strong>
      <i>{` ${data.vehicleSpecification.modelAndOption.model.modelName}`}</i>
      <small>{` (${data.vehicleSpecification.modelAndOption.modelRange.name})`}</small>
      <div
        style={{
          fontSize: "small",
        }}
      >
        {data.ordering.distributionData.locationOutletNickname}
      </div>
      <div
        style={{
          fontSize: "small",
        }}
      >
        {data.equipments ? (
          <ul>
            {Object.values(data.equipments).map(
              ({ name, offerPriceGross }, key) => (
                <li key={key}>
                  {name.pl_PL} <small>{offerPriceGross}</small>
                </li>
              )
            )}
          </ul>
        ) : null}
      </div>
      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
    </div>
  );
}

function Details({
  data,
  created,
  checked,
}: {
  data: Data;
  created: string;
  checked: string | null;
}) {
  return (
    <div style={{ borderTop: "1px solid lightgray", marginTop: ".25em" }}>
      <div style={{ float: "right" }}>
        <small>{dayjs(created).format("MMM D, YYYY H:mm")}</small>
        {checked && (
          <small> / {dayjs(checked).format("MMM D, YYYY H:mm")}</small>
        )}
      </div>
      <strong>
        <span
          style={{
            color: "darkslateblue",
          }}
        >
          {data.price.grossSalesPrice} ({data.price.modelSalesPriceGross} /{" "}
          {data.price.equipmentsTotalGrossPrice}){" "}
          <small>{data.price.priceUpdatedAt}</small>
        </span>
      </strong>
      {data.salesProcess.type && (
        <span>{` ${data.salesProcess.type} - ${data.salesProcess.reason}`}</span>
      )}
      {data.vehicleLifeCycle.isRepaired && <small>{` (Repaired)`}</small>}
    </div>
  );
}

function Filters({
  filters,
  setFilters,
}: {
  filters: FiltersState;
  setFilters: Dispatch<SetStateAction<FiltersState>>;
}) {
  return (
    <fieldset>
      <label>
        <span>Search</span>
        <input
          type="search"
          value={filters.search}
          onChange={useCallback<ChangeEventHandler<HTMLInputElement>>(
            ({ target }) =>
              setFilters((filters) => ({
                ...filters,
                search: target.value,
              })),
            []
          )}
        />
      </label>
    </fieldset>
  );
}

export function List({ list }: { list: Item[] }) {
  const [show, setShow] = useState(false);

  return (
    <div style={{ display: "flex", margin: "1em 0" }}>
      {list.slice(0, 1).map((item) => (
        <Gallery key={item.id} data={item.data} />
      ))}
      <div style={{ flexGrow: 1 }}>
        {(show ? list : list.slice(0, 1)).map((item, key) => (
          <div key={item.id}>
            {!key && <Summary data={item.data} />}
            <Details
              data={item.data}
              created={item.created}
              checked={item.checked}
            />
            {!show && list.length > 1 && (
              <div>
                <a
                  href="#"
                  onClick={(e) => (e.preventDefault(), setShow(true))}
                >
                  <pre>[...]</pre>
                </a>
              </div>
            )}
            {/* <pre>{JSON.stringify(item, null, 2)}</pre> */}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Price() {
  const [data, setData] = useState<{ result: Item[] } | null>(null);
  const [filters, setFilters] = useState<FiltersState>(() => ({
    search: "",
  }));

  const [queries, setQueries] = useState(() => filters);
  const search$ = useMemo(() => new Subject<any>(), []);

  useEffect(() => {
    const subscription = search$
      .pipe(
        map(({ search, ...filters }) =>
          JSON.stringify({
            ...queries,
            ...filters,
            search: search.toLowerCase().trim(),
          })
        ),
        distinctUntilChanged(),
        debounceTime(400)
      )
      .subscribe((filters) =>
        setQueries((queries) => ({ ...queries, ...JSON.parse(filters) }))
      );
    return () => subscription.unsubscribe();
  }, [search$]);

  useEffect(() => {
    search$.next(filters);
  }, [filters]);

  useEffect(() => {
    fetch("/api/auto")
      .then((res) => res.json())
      .then((data) => {
        setData(
          z
            .object({
              result: ItemSchema.array(),
            })
            .parse(data)
        );
      });
  }, []);

  const grouped = useMemo(
    () =>
      Object.entries(
        (data ? data.result : [])
          .sort((a, b) => b.created.localeCompare(a.created))
          .reduce(
            (list, item) =>
              Object.assign(list, {
                [item.item]: (list[item.item] || []).concat(item),
              }),
            {} as Record<string, Item[]>
          )
      ).sort((a, b) => b[1][0].created.localeCompare(a[1][0].created)),
    [data]
  );

  const filtered = useMemo(
    () =>
      grouped.filter(
        ([id, [{ data }]]) =>
          queries.search === "" ||
          queries.search === id ||
          data.vehicleSpecification.modelAndOption.model.modelName
            .toLowerCase()
            .match(queries.search) ||
          data.vehicleSpecification.modelAndOption.modelRange.name
            .toLowerCase()
            .match(queries.search)
      ),
    [queries, grouped]
  );

  if (data === null) return <Loading />;
  console.log({ filters, filtered });
  return (
    <section>
      <Filters filters={filters} setFilters={setFilters} />
      <ol>
        {filtered.map(([id, list]) => (
          <li key={id}>
            <List list={list} />
          </li>
        ))}
      </ol>
    </section>
  );
}
