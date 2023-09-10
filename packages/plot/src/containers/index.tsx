import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Subject, debounceTime, distinctUntilChanged, map } from "rxjs";
import { Gallery, Link, Loading, Location, Map, Text } from "@acme/components";
import type { Data, Item } from "../schema";
import {
  type FiltersState,
  AREA_LIST,
  Filters,
  LIMIT,
  PRICE_LIST,
  SORT_BY,
} from "./Filters";

interface Meta {
  dateCreated: number;
  dateCreatedFirst: number;
  totalPrice: number;
  // pricePerSquareMeter: number;
  terrainAreaInSquareMeters: number;
}

interface Values {
  m: string;
  price_per_m: string;
}

type ExtendedItem = Item & {
  data: Data & {
    values: {
      m: string;
    };
    normalizedValues: {
      m: string;
    };
  };
};

function Description({ children }: { children: string }) {
  return <Text>{children}</Text>;
}

function Summary({ data }: { data: Data }) {
  return (
    <div>
      <div style={{ float: "right", fontSize: "small" }}>
        #
        <Link
          href={`${data.url}`}
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
      <div>
        <strong>{data.title}</strong>
        {!data.isBusiness && (
          <>
            &nbsp;
            <span
              style={{
                fontSize: "xx-small",
                color: "lightcoral",
                border: "1px solid currentColor",
                padding: "0 .25em",
                position: "relative",
                top: -2,
              }}
            >
              PRIVATE
            </span>
          </>
        )}
        {data.isPromoted && (
          <>
            &nbsp;
            <span
              style={{
                fontSize: "xx-small",
                color: "goldenrod",
                border: "1px solid currentColor",
                padding: "0 .25em",
                position: "relative",
                top: -2,
              }}
            >
              PROMOTED
            </span>
          </>
        )}
        {data.contact.negotiation && (
          <>
            &nbsp;
            <span
              style={{
                fontSize: "xx-small",
                color: "mediumseagreen",
                border: "1px solid currentColor",
                padding: "0 .25em",
                position: "relative",
                top: -2,
              }}
            >
              NEGOTIATION
            </span>
          </>
        )}
      </div>
      <div
        style={{
          fontSize: "small",
        }}
      >
        <Location {...data.map}>
          <i>{data.location.pathName}</i>
        </Location>
      </div>
      <div
        style={{
          fontSize: "small",
        }}
      >
        <Description>{data.description}</Description>
        {data.params ? (
          <ul>
            {data.params.map(({ name, value }, key) => (
              <li key={key}>
                {name} <small>{value}</small>
              </li>
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
  data: Data & { values: Values };
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
      <div>
        <span
          style={{
            color: "darkslateblue",
          }}
        >
          <strong>{data.price.displayValue}</strong>
          {" / "}
          <strong>{data.values.m}</strong>
          <small>
            {" "}
            (<strong>{data.values.price_per_m}</strong>)
          </small>
        </span>
        <small>
          {` ${dayjs(data.createdTime).format(
            "MMM D, YYYY H:mm"
          )} \u2192 ${dayjs(data.validToTime).format("MMM D, YYYY H:mm")}`}
        </small>
      </div>
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
        <Gallery key={item.id} images={Object.values(item.data.photos)} />
      ))}
      <div style={{ flex: 1 }}>
        {(show ? list : list.slice(0, 1)).map((item, key) => (
          <div key={item.id}>
            {!key && <Summary data={item.data} />}
            <Details
              data={item.data as Data & { values: Values }}
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
  const [filters, setFilters] = useState<FiltersState>(() => ({
    search: "",
    sortBy: Object.keys(SORT_BY)[0],
    limit: LIMIT[0],
    priceFrom: PRICE_LIST[1],
    priceTo: PRICE_LIST[4],
    areaFrom: AREA_LIST[1],
    areaTo: AREA_LIST[9],
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
    fetch(`/api/plot?limit=${filters.limit}`)
      .then((res) => res.json())
      .then((data) => setData(data));
  }, [filters.limit]);

  const grouped = useMemo(
    () =>
      Object.entries(
        (data ? data.result : [])
          .sort((a, b) => b.created.localeCompare(a.created))
          .map(({ data, ...item }) => ({
            data: Object.assign(
              {
                values: data.params.reduce(
                  (params, { key, value }) =>
                    Object.assign(params, {
                      [key]: value,
                    }),
                  {}
                ),
                normalizedValues: data.params.reduce(
                  (params, { key, normalizedValue }) =>
                    Object.assign(params, {
                      [key]: normalizedValue,
                    }),
                  {}
                ),
              },
              data
            ),
            ...item,
          }))
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
              (list as ExtendedItem[]).reduce(
                (meta, { data }) =>
                  Object.assign(
                    meta,
                    0 === meta.dateCreated && {
                      dateCreated: new Date(data.lastRefreshTime).getTime(),
                    },
                    0 === meta.dateCreatedFirst && {
                      dateCreatedFirst: new Date(data.createdTime).getTime(),
                    },
                    0 === meta.totalPrice &&
                      data.price.regularPrice.value && {
                        totalPrice: data.price.regularPrice.value,
                      },
                    data.normalizedValues.m && {
                      terrainAreaInSquareMeters: Number(
                        data.normalizedValues.m
                      ),
                    }
                  ),
                {
                  dateCreated: 0,
                  dateCreatedFirst: 0,
                  totalPrice: 0,
                  pricePerSquareMeter: 0,
                  areaInSquareMeters: 0,
                  terrainAreaInSquareMeters: 0,
                }
              ),
            ] as [string, Item[], Meta]
        )
        .sort(
          (a, b) =>
            (["totalPrice", "pricePerSquareMeter"].includes(filters.sortBy)
              ? -1
              : 1) *
            (b[2][filters.sortBy as keyof typeof SORT_BY] -
              a[2][filters.sortBy as keyof typeof SORT_BY])
        ),
    [data, filters.sortBy]
  );

  const filtered = useMemo(
    () =>
      grouped.filter(
        ([id, [{ data }], meta]) =>
          (queries.search === "" ||
            queries.search === id ||
            data.title.toLowerCase().includes(queries.search) ||
            data.location.pathName.toLowerCase().includes(queries.search)) &&
          (queries.areaTo === PRICE_LIST[0] ||
            (meta.terrainAreaInSquareMeters
              ? queries.areaFrom <= meta.terrainAreaInSquareMeters &&
                meta.terrainAreaInSquareMeters <= queries.areaTo
              : true)) &&
          (queries.priceTo === PRICE_LIST[0] ||
            (data.price.regularPrice
              ? queries.priceFrom <= data.price.regularPrice.value &&
                data.price.regularPrice.value <= queries.priceTo
              : true))
      ),
    [queries, grouped]
  );

  if (data === null) return <Loading />;
  console.log({ result: data.result, filters, filtered });
  return (
    <section>
      <Map
        points={filtered.map(([id, [{ data }]]) => ({
          id,
          tooltip: data.title,
          position: [data.map.lat, data.map.lon],
        }))}
      />
      <Filters filters={filters} setFilters={setFilters} />
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
