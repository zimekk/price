import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Subject, debounceTime, distinctUntilChanged, map } from "rxjs";
import { Gallery, Link, Loading } from "@acme/components";
import type { Data, Item } from "../schema";
import {
  type FiltersState,
  type OptionsState,
  Filters,
  INITIAL_FILTERS,
  PRICE_LIST,
  SORT_BY,
} from "./Filters";

interface Meta {
  minPrice: number;
  maxPrice: number;
  minPriceChanged: number;
  price: number;
  priceChanged: number;
}

const ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  nbsp: " ",
  quot: '"',
};

const decodeHTMLEntities = (text: string) =>
  text.replace(
    /&([^;]+);/gm,
    (match, entity: keyof typeof ENTITIES) => ENTITIES[entity] || match,
  );

const formatPrice = (price: number) =>
  `${new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 2,
  }).format(price)} zł`;

const getPercentage = ({
  saleprice,
  fullPrice,
}: {
  saleprice: number;
  fullPrice: number;
}) => (saleprice / fullPrice - 1) * 100;

function Summary({ data }: { data: Data }) {
  return (
    <div>
      <div style={{ float: "right", fontSize: "small" }}>
        #
        <Link
          href={`#`}
          onClick={(e) => {
            const range = document.createRange();
            e.preventDefault();
            range.selectNode(e.target as HTMLElement);
            ((selection) =>
              selection &&
              (selection.removeAllRanges(), selection.addRange(range)))(
              window.getSelection(),
            );
          }}
        >
          {data.productId}
        </Link>
      </div>
      <div>
        <strong>{data.productName}</strong>
        {data.stockStatus && (
          <>
            &nbsp;
            <span
              style={{
                fontSize: "xx-small",
                textTransform: "uppercase",
                color: {
                  "In Stock": "limegreen",
                  "Out of Stock": "mediumvioletred",
                }[data.stockStatus],
                border: "1px solid currentColor",
                padding: "0 .25em",
                position: "relative",
                top: -2,
              }}
            >
              {data.stockStatus}
            </span>
          </>
        )}
      </div>
      <div
        style={{
          fontSize: "small",
        }}
      >
        {data.parents ? (
          <ul>
            {data.parents.map((item, key) => (
              <li key={key}>{item}</li>
            ))}
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
        {data.fullPrice > data.saleprice && (
          <span>
            <span
              style={{ color: "lightgray", textDecoration: "line-through" }}
            >
              {formatPrice(data.fullPrice)}
            </span>{" "}
          </span>
        )}
        <span
          style={{
            color:
              data.fullPrice > data.saleprice ? "orangered" : "darkslateblue",
          }}
        >
          {formatPrice(data.saleprice)}
          {data.fullPrice > data.saleprice && (
            <small>{` (${new Intl.NumberFormat("pl-PL", {
              maximumFractionDigits: 2,
            }).format(getPercentage(data))}%)`}</small>
          )}
        </span>
      </strong>
      {data.badge?.text && (
        <>
          &nbsp;
          <span
            style={{
              fontSize: "xx-small",
              textTransform: "uppercase",
              color: "cornflowerblue",
              border: "1px solid currentColor",
              padding: "0 .25em",
              position: "relative",
              top: -2,
            }}
          >
            {decodeHTMLEntities(data.badge.text)}
          </span>
        </>
      )}
      {data.promotionalPriceCopy && (
        <small>
          &nbsp;
          <span
            dangerouslySetInnerHTML={{ __html: data.promotionalPriceCopy }}
          />
        </small>
      )}
    </div>
  );
}

export function List({ list }: { list: Item[] }) {
  const [show, setShow] = useState(false);

  return (
    <section
      style={{ display: "flex", margin: "1em 0" }}
      id={`${list[0].data.productId}`}
    >
      {list.slice(0, 1).map((item) => (
        <Gallery key={item.id} images={[item.data.primaryImageUrl]} />
      ))}
      <div style={{ flex: 1 }}>
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
    </section>
  );
}

export function Price() {
  const [data, setData] = useState<{ result: Item[] } | null>(null);
  const [filters, setFilters] = useState<FiltersState>(INITIAL_FILTERS);

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
          }),
        ),
        distinctUntilChanged(),
        debounceTime(400),
      )
      .subscribe((filters) =>
        setQueries((queries) => ({ ...queries, ...JSON.parse(filters) })),
      );
    return () => subscription.unsubscribe();
  }, [search$]);

  useEffect(() => {
    search$.next(filters);
  }, [filters]);

  useEffect(() => {
    fetch(`/api/dyso?limit=${filters.limit}`)
      .then((res) => res.json())
      .then((data) => setData(data));
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
            {} as Record<string, Item[]>,
          ),
      )
        .map(
          ([item, list]) =>
            [
              item,
              list,
              list.reduce(
                (meta, { data, created }) =>
                  Object.assign(
                    meta,
                    data.saleprice <= meta.minPrice && {
                      minPrice: data.saleprice,
                      minPriceChanged: new Date(created).getTime(),
                    },
                    data.saleprice > meta.maxPrice && {
                      maxPrice: data.saleprice,
                    },
                    0 === meta.price && {
                      price: data.saleprice,
                      priceChanged: new Date(created).getTime(),
                    },
                  ),
                {
                  minPrice: Infinity,
                  maxPrice: 0,
                  minPriceChanged: 0,
                  price: 0,
                  priceChanged: 0,
                },
              ),
            ] as [string, Item[], Meta],
        )
        .sort(
          (a, b) =>
            b[2][filters.sortBy as keyof typeof SORT_BY] -
            a[2][filters.sortBy as keyof typeof SORT_BY],
        ),
    [data, filters.sortBy],
  );

  const filtered = useMemo(
    () =>
      grouped.filter(
        ([id, [{ data }]]) =>
          (queries.search === "" ||
            queries.search === id ||
            data.productSKU.toLowerCase().includes(queries.search) ||
            data.productName.toLowerCase().includes(queries.search)) &&
          (queries.priceTo === PRICE_LIST[0] ||
            (data.saleprice
              ? queries.priceFrom <= data.saleprice &&
                data.saleprice <= queries.priceTo
              : true)) &&
          [data.stockStatus, ""].includes(queries.status),
      ),
    [PRICE_LIST, queries, grouped],
  );

  const options = useMemo(
    () =>
      Object.entries(
        grouped.reduce(
          (options, [, [{ data }]]) =>
            Object.assign(options, {
              status: Object.assign(
                options.status || {},
                data.stockStatus && {
                  [data.stockStatus]: true,
                },
              ),
            }),
          {} as OptionsState,
        ),
      ).reduce(
        (options, [key, value]) =>
          Object.assign(options, {
            [key]: Object.keys(value).sort(),
          }),
        {} as OptionsState,
      ),
    [grouped],
  );

  if (data === null) return <Loading />;
  console.log({ result: data.result, filters, filtered, grouped, options });
  return (
    <section>
      <Filters filters={filters} setFilters={setFilters} options={options} />
      <small>
        {filtered.length === grouped.length
          ? `Showing all of ${grouped.length}`
          : `Found ${filtered.length} items out of a total of ${grouped.length}`}
      </small>
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
