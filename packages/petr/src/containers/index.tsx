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

const formatPrice = (price: number) =>
  `${new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 2,
  }).format(price)} zł`;

// const getPercentage = ({
//   saleprice,
//   fullPrice,
// }: {
//   saleprice: number;
//   fullPrice: number;
// }) => (saleprice / fullPrice - 1) * 100;

function Summary({ data }: { data: Data }) {
  return (
    <div>
      <div style={{ float: "right", fontSize: "small" }}>
        #
        <Link
          href={data.url}
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
          {data.id}
        </Link>
      </div>
      <div>
        <strong>{data.name}</strong>
        {data.availability && (
          <>
            &nbsp;
            <span
              style={{
                fontSize: "xx-small",
                textTransform: "uppercase",
                color:
                  {
                    InStock: "limegreen",
                  }[data.availability] || "orangered",
                border: "1px solid currentColor",
                padding: "0 .25em",
                position: "relative",
                top: -2,
              }}
            >
              {data.availability}
            </span>
          </>
        )}
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
          {formatPrice(data.price)}
        </span>
      </strong>
    </div>
  );
}

export function List({ list }: { list: Item[] }) {
  const [show, setShow] = useState(false);

  return (
    <section
      style={{ display: "flex", margin: "1em 0" }}
      id={`${list[0].data.id}`}
    >
      {list.slice(0, 1).map((item) => (
        <Gallery
          key={item.id}
          images={
            item.data.image
              ? [`${new URL(item.data.url).origin}${item.data.image}`]
              : []
          }
        />
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
    fetch(`/api/petr?limit=${filters.limit}`)
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
            // data.name.toLowerCase().includes(queries.search) ||
            data.name.toLowerCase().includes(queries.search)) &&
          (queries.priceTo === PRICE_LIST[0] ||
            (data.price
              ? queries.priceFrom <= data.price && data.price <= queries.priceTo
              : true)) &&
          [data.category, ""].includes(queries.category),
      ),
    [PRICE_LIST, queries, grouped],
  );

  const options = useMemo(
    () =>
      Object.entries(
        grouped.reduce(
          (options, [, [{ data }]]) =>
            Object.assign(options, {
              category: Object.assign(
                options.category || {},
                data.category && {
                  [data.category]: true,
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
