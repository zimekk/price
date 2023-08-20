import {
  type ChangeEventHandler,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import dayjs from "dayjs";
import { Subject, debounceTime, distinctUntilChanged, map } from "rxjs";
import { z } from "zod";
import { Gallery, Link, Loading, Location, Map, Text } from "@acme/components";
import { DataSchema, ItemSchema } from "../schema";

interface FiltersState {
  search: string;
  sortBy: string;
  limit: number;
  priceFrom: number;
  priceTo: number;
}

type Data = z.infer<typeof DataSchema>;

type Item = z.infer<typeof ItemSchema>;

interface Meta {
  dateCreated: number;
  dateCreatedFirst: number;
  totalPrice: number;
  // pricePerSquareMeter: number;
  // terrainAreaInSquareMeters: number;
}

interface Values {
  m: string;
  price_per_m: string;
}

const LIMIT = [...Array(5)].map((_value, index) => (index + 1) * 500);

const PRICE_LIST = [
  0, 200000, 400000, 600000, 800000, 1000000, 1500000, 2000000, 2500000,
  3000000, 4000000, 5000000,
] as const;

const SORT_BY = {
  dateCreated: "Data aktualizacji",
  dateCreatedFirst: "Data utworzenia",
  totalPrice: "Cena",
  // pricePerSquareMeter: "Cena za m2",
  // areaInSquareMeters: "Powierzchnia",
  // terrainAreaInSquareMeters: "Powierzchnia działki",
} as const;

function Picker({
  label,
  options = [],
  entries = [],
  value,
  onChange,
}: {
  label: ReactNode;
  options?: string[];
  entries?: [string, string][];
  value: string;
  onChange: ChangeEventHandler<HTMLSelectElement>;
}) {
  return (
    <label>
      <span>{label}</span>
      <select value={value} onChange={onChange}>
        {options.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
        {entries.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Range({
  labelFrom,
  labelTo,
  options,
  filters,
  setFilters,
}: {
  labelFrom: ReactNode;
  labelTo: ReactNode;
  options: readonly number[];
  filters: FiltersState;
  setFilters: Dispatch<SetStateAction<FiltersState>>;
}) {
  const id = useId();
  return (
    <>
      <label>
        <span>{labelFrom}</span>
        <input
          type="range"
          list={id}
          min={options[0]}
          max={options[options.length - 1]}
          value={filters.priceFrom}
          onChange={useCallback<ChangeEventHandler<HTMLInputElement>>(
            ({ target }) =>
              setFilters(({ priceTo, ...criteria }) => {
                const priceFrom = Number(target.value);
                return {
                  ...criteria,
                  priceFrom,
                  priceTo: priceTo < priceFrom ? priceFrom : priceTo,
                };
              }),
            []
          )}
        />
        <datalist id={id}>
          {options.map((value) => (
            <option key={value} value={value}></option>
          ))}
        </datalist>
      </label>
      <label>
        <span>{labelTo}</span>
        <input
          type="range"
          list={id}
          min={options[0]}
          max={options[options.length - 1]}
          value={filters.priceTo}
          onChange={useCallback<ChangeEventHandler<HTMLInputElement>>(
            ({ target }) =>
              setFilters(({ priceFrom, ...criteria }) => {
                const priceTo = Number(target.value);
                return {
                  ...criteria,
                  priceFrom: priceTo > priceFrom ? priceFrom : priceTo,
                  priceTo,
                };
              }),
            []
          )}
        />
      </label>
    </>
  );
}

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

function Filters({
  filters,
  setFilters,
}: {
  filters: FiltersState;
  setFilters: Dispatch<SetStateAction<FiltersState>>;
}) {
  return (
    <fieldset>
      <div>
        <Range
          labelFrom="Price From"
          labelTo="Price To"
          options={PRICE_LIST}
          filters={filters}
          setFilters={setFilters}
        />
        <span>{`${new Intl.NumberFormat().format(
          filters.priceFrom
        )} - ${new Intl.NumberFormat().format(filters.priceTo)} PLN`}</span>
      </div>
      <div>
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
        <Picker
          label="Limit"
          options={LIMIT.map(String)}
          value={String(filters.limit)}
          onChange={useCallback(
            ({ target }) =>
              setFilters((filters) => ({
                ...filters,
                limit: Number(target.value),
              })),
            []
          )}
        />
        <Picker
          label="Sort"
          entries={Object.entries(SORT_BY)}
          value={filters.sortBy}
          onChange={useCallback(
            ({ target }) =>
              setFilters((filters) => ({
                ...filters,
                sortBy: target.value,
              })),
            []
          )}
        />
      </div>
    </fieldset>
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
              list.reduce(
                (meta, { data, created }) =>
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
        ([id, [{ data }]]) =>
          (queries.search === "" ||
            queries.search === id ||
            data.title.toLowerCase().includes(queries.search) ||
            data.location.pathName.toLowerCase().includes(queries.search)) &&
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
