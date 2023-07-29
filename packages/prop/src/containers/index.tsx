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
import { Gallery, Link, Loading, LocationLink } from "@acme/components";
import { DataSchema, ItemSchema } from "../schema";

interface FiltersState {
  private: boolean;
  agency: string;
  agencyType: string;
  estate: string;
  region: string;
  search: string;
  sortBy: string;
  limit: number;
  priceFrom: number;
  priceTo: number;
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

const PRICE_LIST = [
  0, 200000, 400000, 600000, 800000, 1000000, 1500000, 2000000, 2500000,
  3000000, 4000000, 5000000,
] as const;

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
    minimumFractionDigits: 0,
  }).format(price)} ${currency}`;

const formatArea = (area: number) =>
  `${new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 0,
  }).format(area)}`;

function getLocationLink(location: string, zoom = 0) {
  return `//www.google.com/maps?t=k&q=${encodeURIComponent(location)}&hl=pl${
    zoom ? `&z=${zoom}` : ""
  }`;
}

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
      {data.isPromoted && (
        <span
          style={{
            fontSize: "xx-small",
            color: "goldenrod",
            border: "1px solid currentColor",
            padding: "0 .25em",
            margin: ".5em",
            position: "relative",
            top: -2,
          }}
        >
          PROMOTED
        </span>
      )}
      {data.locationLabel && (
        <div
          style={{
            fontSize: "small",
          }}
        >
          <LocationLink href={getLocationLink(data.locationLabel.value)}>
            <i>{data.locationLabel.value}</i>
          </LocationLink>
          {data.agency && (
            <span
              style={{
                fontSize: "xx-small",
                color: "grey",
                border: "1px solid currentColor",
                padding: "0 .25em",
                margin: ".5em",
                position: "relative",
                top: -1,
              }}
            >
              {data.agency.name}
            </span>
          )}
          {data.isPrivateOwner && (
            <span
              style={{
                fontSize: "xx-small",
                color: "lightcoral",
                border: "1px solid currentColor",
                padding: "0 .25em",
                margin: ".5em",
                position: "relative",
                top: -1,
              }}
            >
              PRIVATE
            </span>
          )}
          {data.isExclusiveOffer && (
            <span
              style={{
                fontSize: "xx-small",
                color: "cornflowerblue",
                border: "1px solid currentColor",
                padding: "0 .25em",
                margin: ".5em",
                position: "relative",
                top: -1,
              }}
            >
              EXCLUSIVE
            </span>
          )}
        </div>
      )}
      <div
        style={{
          fontSize: "small",
        }}
      >
        {data.estate} / {data.dateCreatedFirst} / {data.dateCreated}
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
      <span
        style={{
          color: "darkslateblue",
        }}
      >
        {data.totalPrice && (
          <strong>
            {formatPrice(data.totalPrice.value, data.totalPrice.currency)}
          </strong>
        )}
        {" / "}
        <strong>{formatArea(data.areaInSquareMeters)} m&sup2;</strong>
        {data.terrainAreaInSquareMeters && (
          <span>
            {" "}
            / {formatArea(data.terrainAreaInSquareMeters)} m<sup>2</sup>
          </span>
        )}
        {data.pricePerSquareMeter && (
          <small>
            {" "}
            (
            <strong>
              {formatPrice(
                data.pricePerSquareMeter.value,
                data.pricePerSquareMeter.currency
              )}
              /m&sup2;
            </strong>
            )
          </small>
        )}
      </span>
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
        <Picker
          label="Agency"
          options={[""].concat(options.agency)}
          value={filters.agency}
          onChange={useCallback(
            ({ target }) =>
              setFilters((filters) => ({
                ...filters,
                agency: target.value,
              })),
            []
          )}
        />
      </div>
      <div>
        <Picker
          label="Estate"
          options={[""].concat(options.estate)}
          value={filters.estate}
          onChange={useCallback(
            ({ target }) =>
              setFilters((filters) => ({
                ...filters,
                estate: target.value,
              })),
            []
          )}
        />
        <Picker
          label="Region"
          options={[""].concat(options.region)}
          value={filters.region}
          onChange={useCallback(
            ({ target }) =>
              setFilters((filters) => ({
                ...filters,
                region: target.value,
              })),
            []
          )}
        />
        <Picker
          label="Type"
          options={[""].concat(options.agencyType)}
          value={filters.agencyType}
          onChange={useCallback(
            ({ target }) =>
              setFilters((filters) => ({
                ...filters,
                agencyType: target.value,
              })),
            []
          )}
        />
        <label>
          <span>Private owner</span>{" "}
          <input
            type="checkbox"
            checked={filters.private}
            onChange={useCallback<ChangeEventHandler<HTMLInputElement>>(
              ({ target }) =>
                setFilters((filters) => ({
                  ...filters,
                  private: target.checked,
                })),
              []
            )}
          />
        </label>
      </div>
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
    private: false,
    agency: "",
    agencyType: "",
    estate: "",
    region: "",
    search: "",
    sortBy: Object.keys(SORT_BY)[0],
    limit: LIMIT[1],
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
          [data.location.address.city.name, ""].includes(queries.region) &&
          (data.isPrivateOwner || !queries.private) &&
          (queries.priceTo === PRICE_LIST[0] ||
            (data.totalPrice
              ? queries.priceFrom <= data.totalPrice.value &&
                data.totalPrice.value <= queries.priceTo
              : true))
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
