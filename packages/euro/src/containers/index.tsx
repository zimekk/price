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

const DataSchema = z.object({
  name: z.string(),
  baseAttributes: z.array(
    z.object({
      name: z.string(),
      attributes: z.array(
        z.object({
          name: z.string(),
          value: z.array(
            z.object({
              name: z.string(),
              definitionId: z.number().nullable(),
              url: z.null(),
            })
          ),
          definitionId: z.number().nullable(),
        })
      ),
    })
  ),
  prices: z.object({
    mainPrice: z.number(),
    promotionalPrice: z
      .object({
        price: z.number(),
        fromDatetime: z.string(),
        toDatetime: z.string(),
      })
      .nullable(),
    voucherDiscountedPrice: z.number().nullable(),
    lowestPrice: z.object({ price: z.number().nullable(), show: z.boolean() }),
  }),
  images: z.array(z.object({ url: z.string(), type: z.string() })),
  productGroupName: z.string(),
  productType: z.string(),
  deliveryAvailability: z.object({
    shopDeliveryAvailability: z
      .object({
        code: z.string(),
        deliveryDate: z.null(),
      })
      .nullable(),
    homeDeliveryAvailability: z
      .object({
        code: z.string(),
        deliveryDate: z.null(),
      })
      .nullable(),
    commonDeliveryAvailability: z
      .object({
        code: z.string(),
        deliveryDate: z.null(),
      })
      .nullable(),
    reserveAndCollectAvailable: z.boolean(),
  }),
  labels: z.array(
    z.object({
      name: z.string(),
      color: z.null(),
      backgroundColor: z.null(),
    })
  ),
  brand: z.string(),
  brandLogo: z.null(),
  variantBasicData: z.object({
    variantGroups: z.array(
      z.object({
        variantGroupName: z.string(),
        variants: z.array(
          z.object({
            variantValue: z.string(),
            currentProduct: z.boolean(),
            colorCodes: z.string().array().nullable(),
          })
        ),
      })
    ),
  }),
  outletDetails: z
    .object({
      deliveryAvailability: z.object({
        shopDeliveryAvailability: z.object({
          code: z.string(),
          deliveryDate: z.null(),
        }),
        homeDeliveryAvailability: z.object({
          code: z.string(),
          deliveryDate: z.null(),
        }),
        commonDeliveryAvailability: z.null(),
        reserveAndCollectAvailable: z.boolean(),
      }),
      outletCategories: z.array(
        z.object({
          categoryName: z.string(),
          categoryDescription: z.string(),
          categoryId: z.number(),
          price: z.number(),
          instalment: z
            .object({
              code: z.string(),
              instalmentPrice: z.number(),
              numberOfInstalments: z.number(),
              loanInterest: z.number(),
              label: z.string(),
              hasPromotionDetails: z.boolean(),
              shortPromotionDescription: z.null(),
              rrso: z.number(),
              usingDiscountedPrice: z.boolean(),
            })
            .nullable(),
        })
      ),
    })
    .nullable(),
  opinionsSummary: z.object({
    averageGrade: z.number(),
    opinionsNumber: z.number(),
  }),
  splitPayment: z.boolean(),
  productName: z.string(),
  energyLabel: z.null(),
  productAdvertisingPlacements: z.array(z.unknown()),
  voucherDetails: z
    .object({
      voucherName: z.string().nullable(),
      voucherCode: z.string(),
      automatic: z.boolean(),
      beginTime: z.string(),
      endTime: z.string(),
      usageLimit: z.null(),
      description: z.string(),
    })
    .nullable(),
  deliveryPriceMessage: z.string().nullable(),
  instalment: z
    .object({
      code: z.string(),
      instalmentPrice: z.number(),
      numberOfInstalments: z.number(),
      loanInterest: z.number(),
      label: z.string(),
      hasPromotionDetails: z.boolean(),
      shortPromotionDescription: z.string().nullable(),
      rrso: z.number(),
      usingDiscountedPrice: z.boolean(),
    })
    .nullable(),
  identifiers: z.object({
    plu: z.string(),
    productLinkName: z.string(),
    productGroupLinkName: z.string(),
    huCode: z.null(),
  }),
  presentationBox: z
    .object({
      backgroundColor: z.string(),
      promotionBackgroundColor: z.string(),
      promotionTextColor: z.string(),
      infoTextColor: z.string(),
      voucherCodeTextColor: z.string(),
      dateTextColor: z.string(),
      gaugeBackgroundColor: z.string(),
      gaugeBorderColor: z.string(),
      discountedPriceColor: z.string(),
      priceColor: z.string(),
      boxBorderColor: z.string(),
      tabTextColor: z.string(),
    })
    .nullable(),
  productLinks: z.array(z.unknown()),
  callCenterPhoneNumber: z.string(),
  paymentTypeDescriptions: z.array(z.unknown()),
  videos: z.array(z.unknown()),
  relatedPromotion: z.null(),
});

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
      {data.images
        .filter((item) => ["ICON_PHOTO"].includes(item.type))
        .slice(0, 1)
        .map((item, key) => (
          <img key={key} src={item.url} referrerPolicy="no-referrer" />
        ))}
    </div>
  );
}

function Summary({ data }: { data: Data }) {
  return (
    <div>
      <strong>{data.brand}</strong>
      {data.name && <i>{` ${data.name}`}</i>}
      <div>{data.productGroupName}</div>
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
        {data.prices.promotionalPrice && (
          <span>
            <span
              style={{ color: "lightgray", textDecoration: "line-through" }}
            >
              {data.prices.mainPrice}
            </span>{" "}
          </span>
        )}
        <span
          style={{
            color: data.prices.promotionalPrice ? "orangered" : "darkslateblue",
          }}
        >
          {data.prices.promotionalPrice
            ? data.prices.promotionalPrice.price
            : data.prices.mainPrice}
          {data.prices.promotionalPrice && (
            <small>{`${data.prices.promotionalPrice.fromDatetime} - ${data.prices.promotionalPrice.toDatetime}`}</small>
          )}
        </span>
      </strong>
      {data.prices.lowestPrice.price && (
        <small>{` (last lowest price: ${data.prices.lowestPrice.price})`}</small>
      )}
      {data.deliveryPriceMessage && (
        <span>{` ${data.deliveryPriceMessage}`}</span>
      )}
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
    fetch("/api/euro")
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
          data.brand?.toLowerCase().match(queries.search) ||
          data.name?.toLowerCase().match(queries.search)
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
