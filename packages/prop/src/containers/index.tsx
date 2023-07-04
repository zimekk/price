import {
  type ChangeEventHandler,
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import dayjs from "dayjs";
import { Subject, debounceTime, distinctUntilChanged, map } from "rxjs";
import { z } from "zod";
import { Gallery, Link, Loading } from "@acme/components";
import { DataSchema, ItemSchema } from "../schema";

interface FiltersState {
  agency: string;
  agencyType: string;
  estate: string;
  region: string;
  search: string;
  sortBy: string;
  limit: number;
}

interface OptionsState {
  agency: string[];
  agencyType: string[];
  estate: string[];
  region: string[];
}

type Data = z.infer<typeof DataSchema>;

type Item = z.infer<typeof ItemSchema>;

type Meta = {
  dateCreated: number;
  dateCreatedFirst: number;
  totalPrice: number;
  pricePerSquareMeter: number;
  areaInSquareMeters: number;
  terrainAreaInSquareMeters: number;
};

const URL = process.env.NEXT_PUBLIC_PROP_BASE_URL || "";

const LIMIT = [...Array(10)].map((_value, index) => (index + 1) * 500);

const SORT_BY = {
  dateCreated: "Data aktualizacji",
  dateCreatedFirst: "Data utworzenia",
  totalPrice: "Cena",
  pricePerSquareMeter: "Cena za m2",
  areaInSquareMeters: "Powierzchnia",
  terrainAreaInSquareMeters: "Powierzchnia działki",
} as const;

const formatPrice = (price: number, currency: string) =>
  `${new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 2,
  }).format(price)} ${currency}`;

const formatArea = (area: number) =>
  `${new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 0,
  }).format(area)}`;

function Summary({ data }: { data: Data }) {
  return (
    <div>
      <div style={{ float: "right", fontSize: "small" }}>
        #
        <Link
          href={`${URL}/pl/oferta/${data.slug}`}
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
      <strong>{data.title}</strong>
      {data.locationLabel && (
        <div
          style={{
            fontSize: "small",
          }}
        >
          <i>{data.locationLabel.value}</i>
        </div>
      )}
      {data.agency && (
        <div
          style={{
            fontSize: "small",
          }}
        >
          {data.agency.name}
        </div>
      )}
      <div
        style={{
          fontSize: "small",
        }}
      >
        {data.estate} / {data.dateCreated} / {data.dateCreatedFirst}
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
          {data.totalPrice &&
            formatPrice(data.totalPrice.value, data.totalPrice.currency)}
          {data.pricePerSquareMeter && (
            <small>
              {" "}
              (
              <span>
                {formatArea(data.areaInSquareMeters)} m<sup>2</sup>
              </span>
              {data.terrainAreaInSquareMeters && (
                <span>
                  {" "}
                  / {formatArea(data.terrainAreaInSquareMeters)} m<sup>2</sup>
                </span>
              )}
              <span>
                {" "}
                -{" "}
                {formatPrice(
                  data.pricePerSquareMeter.value,
                  data.pricePerSquareMeter.currency
                )}
                /m<sup>2</sup>
              </span>
              )
            </small>
          )}
        </span>
      </strong>
    </div>
  );
}

function Filters({
  options,
  filters,
  setFilters,
}: {
  options: OptionsState;
  filters: FiltersState;
  setFilters: Dispatch<SetStateAction<FiltersState>>;
}) {
  return (
    <fieldset>
      <div>
        <label>
          <span>Agency</span>
          <select
            value={filters.agency}
            onChange={useCallback<ChangeEventHandler<HTMLSelectElement>>(
              ({ target }) =>
                setFilters((filters) => ({
                  ...filters,
                  agency: target.value,
                })),
              []
            )}
          >
            {[""].concat(options.agency).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Type</span>
          <select
            value={filters.agencyType}
            onChange={useCallback<ChangeEventHandler<HTMLSelectElement>>(
              ({ target }) =>
                setFilters((filters) => ({
                  ...filters,
                  agencyType: target.value,
                })),
              []
            )}
          >
            {[""].concat(options.agencyType).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <label>
          <span>Estate</span>
          <select
            value={filters.estate}
            onChange={useCallback<ChangeEventHandler<HTMLSelectElement>>(
              ({ target }) =>
                setFilters((filters) => ({
                  ...filters,
                  estate: target.value,
                })),
              []
            )}
          >
            {[""].concat(options.estate).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Region</span>
          <select
            value={filters.region}
            onChange={useCallback<ChangeEventHandler<HTMLSelectElement>>(
              ({ target }) =>
                setFilters((filters) => ({
                  ...filters,
                  region: target.value,
                })),
              []
            )}
          >
            {[""].concat(options.region).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
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
        <label>
          <span>Limit</span>
          <select
            value={String(filters.limit)}
            onChange={useCallback<ChangeEventHandler<HTMLSelectElement>>(
              ({ target }) =>
                setFilters((filters) => ({
                  ...filters,
                  limit: Number(target.value),
                })),
              []
            )}
          >
            {LIMIT.map((value) => (
              <option key={value} value={String(value)}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Sort</span>
          <select
            value={filters.sortBy}
            onChange={useCallback<ChangeEventHandler<HTMLSelectElement>>(
              ({ target }) =>
                setFilters((filters) => ({
                  ...filters,
                  sortBy: target.value,
                })),
              []
            )}
          >
            {Object.entries(SORT_BY).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </fieldset>
  );
}

export function List({ list }: { list: Item[] }) {
  const [show, setShow] = useState(false);

  return (
    <div style={{ display: "flex", margin: "1em 0" }}>
      {list.slice(0, 1).map((item) => (
        <Gallery
          key={item.id}
          images={item.data.images.map(({ medium }) => medium)}
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
    </div>
  );
}

export function Price() {
  const [data, setData] = useState<{ result: Item[] } | null>(null);
  const [filters, setFilters] = useState<FiltersState>(() => ({
    agency: "",
    agencyType: "",
    estate: "",
    region: "",
    search: "",
    sortBy: Object.keys(SORT_BY)[0],
    limit: LIMIT[1],
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
    fetch(`/api/prop?limit=${filters.limit}`)
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
                (meta, { data, created }) =>
                  Object.assign(
                    meta,
                    0 === meta.dateCreated && {
                      dateCreated: new Date(data.dateCreated).getTime(),
                    },
                    0 === meta.dateCreatedFirst &&
                      data.dateCreatedFirst && {
                        dateCreatedFirst: new Date(
                          data.dateCreatedFirst
                        ).getTime(),
                      },
                    0 === meta.totalPrice &&
                      data.totalPrice && {
                        totalPrice: data.totalPrice.value,
                      },
                    0 === meta.pricePerSquareMeter &&
                      data.pricePerSquareMeter && {
                        pricePerSquareMeter: data.pricePerSquareMeter.value,
                      },
                    0 === meta.areaInSquareMeters &&
                      data.areaInSquareMeters && {
                        areaInSquareMeters: data.areaInSquareMeters,
                      },
                    0 === meta.terrainAreaInSquareMeters && {
                      terrainAreaInSquareMeters: data.terrainAreaInSquareMeters,
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
            data.locationLabel.value?.toLowerCase().includes(queries.search) ||
            data.title?.toLowerCase().includes(queries.search)) &&
          [data.agency?.name, ""].includes(queries.agency) &&
          [data.agency?.type, ""].includes(queries.agencyType) &&
          [data.estate, ""].includes(queries.estate) &&
          [data.location.address.city.name, ""].includes(queries.region)
      ),
    [queries, grouped]
  );

  const options = useMemo(
    () =>
      Object.entries(
        (data ? data.result : []).reduce(
          (options, { data }) =>
            Object.assign(options, {
              agency: Object.assign(
                options.agency || {},
                data.agency && {
                  [data.agency.name]: true,
                }
              ),
              agencyType: Object.assign(
                options.agencyType || {},
                data.agency && {
                  [data.agency.type]: true,
                }
              ),
              estate: Object.assign(options.estate || {}, {
                [data.estate]: true,
              }),
              region: Object.assign(options.region || {}, {
                [data.location.address.city.name]: true,
              }),
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
        {filtered.map(([id, list]) => (
          <li key={id}>
            <List list={list} />
          </li>
        ))}
      </ol>
    </section>
  );
}
