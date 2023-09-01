import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Subject, debounceTime, distinctUntilChanged, map } from "rxjs";
import { z } from "zod";
import { Gallery, Link, Loading } from "@acme/components";
import { DataSchema, ItemSchema } from "../schema";
import {
  Filters,
  FiltersState,
  LIMIT,
  OptionsState,
  PRICE_LIST,
  SORT_BY,
} from "./Filters";

type Data = z.infer<typeof DataSchema>;

type Item = z.infer<typeof ItemSchema>;

type Meta = {
  type: string;
  minPrice: number;
  maxPrice: number;
  minPriceChanged: number;
  price: number;
  priceChanged: number;
};

const ALTO_BASE_URL = process.env.NEXT_PUBLIC_ALTO_BASE_URL || "";
const EURO_BASE_URL = process.env.NEXT_PUBLIC_EURO_BASE_URL || "";
const XKOM_BASE_URL = process.env.NEXT_PUBLIC_XKOM_BASE_URL || "";

export const formatPrice = (price: number) =>
  `${new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 2,
  }).format(price)} zł`;

export const getPercentage = ({
  price,
  oldPrice = price,
}: {
  price: number;
  oldPrice?: number | null;
}) => (oldPrice !== null ? (price / oldPrice - 1) * 100 : 0);

function Summary({ data, type }: { data: Data; type: string }) {
  return (
    <div>
      <div style={{ float: "right", fontSize: "small" }}>
        #
        <Link
          href={`${
            { alto: ALTO_BASE_URL, euro: EURO_BASE_URL, xkom: XKOM_BASE_URL }[
              type
            ]
          }/p/${data.id}`}
          onClick={(e) => {
            const range = document.createRange();
            e.preventDefault();
            range.selectNode(e.target as HTMLElement);
            ((selection) =>
              selection &&
              (selection.removeAllRanges(), selection.addRange(range)))(
              window.getSelection()
            );
          }}
        >
          {data.id}
        </Link>
      </div>
      <strong>{data.brand}</strong>
      {data.name && <i>{` ${data.name}`}</i>}
      {/* <div
        style={{
          fontSize: "small",
        }}
      >
        {data.featureSummary && (
          <ul>
            {data.featureSummary?.map((text, key) => (
              <li key={key}>{text}</li>
            ))}
          </ul>
        )}
      </div> */}
      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
    </div>
  );
}

function Details({
  data,
  meta,
  created,
  checked,
}: {
  data: Data;
  meta: Meta;
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
        {meta.minPriceChanged === dayjs(created).valueOf() && (
          <i
            style={{
              position: "absolute",
              marginLeft: "-1em",
              color: "green",
            }}
          >
            &#8594;
          </i>
        )}
        {data.oldPrice && (
          <span>
            <span
              style={{ color: "lightgray", textDecoration: "line-through" }}
            >
              {formatPrice(data.oldPrice)}
            </span>{" "}
          </span>
        )}
        <span
          style={{
            color: data.oldPrice ? "orangered" : "darkslateblue",
          }}
        >
          {formatPrice(data.price)}
          {data.oldPrice && (
            <small>{` (${new Intl.NumberFormat("pl-PL", {
              maximumFractionDigits: 2,
            }).format(getPercentage(data))}%)`}</small>
          )}
        </span>
      </strong>
      {/* {data.availabilityStatus && <span>{` ${data.availabilityStatus}`}</span>} */}
      {/* {data.freeShipping && <small>{` (FreeShipping)`}</small>} */}
      {/* {data.ratingCount ? (
        <span>
          {` / ${data.rating}`}
          <small>{` (${data.ratingCount})`}</small>
        </span>
      ) : null} */}
    </div>
  );
}

export function List({ list, meta }: { list: Item[]; meta: Meta }) {
  const [show, setShow] = useState(false);

  return (
    <div style={{ display: "flex", margin: "1em 0" }}>
      {list.slice(0, 1).map((item) => (
        <Gallery key={item.id} images={item.data.images} />
      ))}
      <div style={{ flex: 1 }}>
        {/* [{meta.minPrice}]
        [{meta.maxPrice}]
        [{dayjs(meta.minPriceChanged).format("MMM D, YYYY H:mm")}] */}
        {(show ? list : list.slice(0, 1)).map((item, key) => (
          <div key={item.id}>
            {!key && <Summary data={item.data} type={meta.type} />}
            <Details
              meta={meta}
              data={item.data}
              created={item.created}
              checked={item.updated}
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
    brand: "",
    group: "",
    search: "",
    sortBy: Object.keys(SORT_BY)[3],
    limit: LIMIT[9],
    priceFrom: PRICE_LIST[0],
    priceTo: PRICE_LIST[PRICE_LIST.length - 2],
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
    fetch(`/api/prod?limit=${filters.limit}`)
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
  }, [filters.limit]);

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
      )
        .map(
          ([item, list]) =>
            [
              item,
              list,
              list.reduce(
                (meta, { type, data, created }) =>
                  Object.assign(
                    meta,
                    { type },
                    data.price <= meta.minPrice && {
                      minPrice: data.price,
                      minPriceChanged: new Date(created).getTime(),
                    },
                    data.price > meta.maxPrice && {
                      maxPrice: data.price,
                    },
                    0 === meta.price && {
                      price: data.price,
                      priceChanged: new Date(created).getTime(),
                    }
                  ),
                {
                  minPrice: Infinity,
                  maxPrice: 0,
                  minPriceChanged: 0,
                  price: 0,
                  priceChanged: 0,
                }
              ),
            ] as [string, Item[], Meta]
        )
        .sort(
          (a, b) =>
            (["minPrice", "price"].includes(filters.sortBy) ? -1 : 1) *
            (b[2][filters.sortBy as keyof typeof SORT_BY] -
              a[2][filters.sortBy as keyof typeof SORT_BY])
        ),
    [data, , filters.sortBy]
  );

  const filtered = useMemo(
    () =>
      grouped.filter(
        ([id, [{ data }]]) =>
          (queries.search === "" ||
            queries.search === id ||
            data.brand?.toLowerCase().includes(queries.search) ||
            data.name?.toLowerCase().includes(queries.search)) &&
          [data.brand, ""].includes(queries.brand) &&
          (queries.priceTo === PRICE_LIST[0] ||
            (data.price
              ? ((price) =>
                  queries.priceFrom <= price && price <= queries.priceTo)(
                  data.price
                )
              : true))
        // [data.category.id, ""].includes(queries.group)
      ),
    [queries, grouped]
  );

  const options = useMemo(
    () =>
      Object.entries(
        (data ? data.result : []).reduce(
          (options, { data }) =>
            Object.assign(options, {
              brand: Object.assign(options.brand || {}, {
                [data.brand]: true,
              }),
              // group: Object.assign(options.group || {}, {
              //   [data.category.id]: true,
              // }),
            }),
          {} as OptionsState
        )
      ).reduce(
        (options, [key, value]) =>
          Object.assign(options, {
            [key]: Object.keys(value).sort(),
          }),
        {} as OptionsState
      ),
    [data]
  );

  if (data === null) return <Loading />;
  console.log({ result: data.result, options, filters, filtered });
  return (
    <section>
      <Filters options={options} filters={filters} setFilters={setFilters} />
      <small>
        {filtered.length === grouped.length
          ? `Showing all of ${grouped.length}`
          : `Found ${filtered.length} items out of a total of ${grouped.length}`}
      </small>
      <ol>
        {filtered.map(([id, list, meta]) => (
          <li key={id}>
            <List list={list} meta={meta} />
          </li>
        ))}
      </ol>
    </section>
  );
}
