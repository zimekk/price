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
  brand: string;
  group: string;
  limit: number;
  sortBy: string;
  search: string;
}

interface OptionsState {
  brand: string[];
  group: string[];
}

type Data = z.infer<typeof DataSchema>;

type Item = z.infer<typeof ItemSchema>;

type Meta = {
  minPrice: number;
  maxPrice: number;
  minPriceChanged: number;
  price: number;
  priceChanged: number;
};

const URL = process.env.NEXT_PUBLIC_ROSS_BASE_URL || "";

const LIMIT = [...Array(6)].map((_value, index) => (index + 1) * 500);

const SORT_BY = {
  priceChanged: "Data zmiany ceny",
  minPriceChanged: "Data najniższej ceny",
} as const;

const formatPrice = (price: number) =>
  `${new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 2,
  }).format(price)} zł`;

const getPercentage = ({
  price,
  oldPrice = price,
}: {
  price: number;
  oldPrice?: number | null;
}) => (oldPrice !== null ? (price / oldPrice - 1) * 100 : 0);

function Summary({ data }: { data: Data }) {
  return (
    <div>
      <div style={{ float: "right", fontSize: "small" }}>
        #
        <Link
          href={`${URL}${data.navigateUrl}`}
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
      <div>{data.caption}</div>
      {data.cmpDescription && (
        <div
          style={{
            fontSize: "small",
            color: "orangered",
            background: "lightyellow",
          }}
        >
          {data.cmpDescription}
        </div>
      )}
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
      {data.pricePerUnit && <span>{` ${data.pricePerUnit}`}</span>}
      {data.lastLowestPrice && (
        <small>{` (last lowest price: ${formatPrice(
          data.lastLowestPrice
        )})`}</small>
      )}
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
          <span>Brand</span>
          <select
            value={filters.brand}
            onChange={useCallback<ChangeEventHandler<HTMLSelectElement>>(
              ({ target }) =>
                setFilters((filters) => ({
                  ...filters,
                  brand: target.value,
                })),
              []
            )}
          >
            {[""].concat(options.brand).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Group</span>
          <select
            value={filters.group}
            onChange={useCallback<ChangeEventHandler<HTMLSelectElement>>(
              ({ target }) =>
                setFilters((filters) => ({
                  ...filters,
                  group: target.value,
                })),
              []
            )}
          >
            {[""].concat(options.group).map((value) => (
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
      </div>
    </fieldset>
  );
}

export function List({ list, meta }: { list: Item[]; meta: Meta }) {
  const [show, setShow] = useState(false);

  return (
    <div style={{ display: "flex", margin: "1em 0" }}>
      {list.slice(0, 1).map((item) => (
        <Gallery
          key={item.id}
          images={item.data.pictures.slice(0, 1).map((item) => item.small)}
        />
      ))}
      <div style={{ flex: 1 }}>
        {/* [{meta.minPrice}] [{meta.maxPrice}] [
        {dayjs(meta.minPriceChanged).format("MMM D, YYYY H:mm")}] [{meta.price}]
        [{dayjs(meta.priceChanged).format("MMM D, YYYY H:mm")}] */}
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
    brand: "",
    group: "",
    limit: LIMIT[1],
    sortBy: Object.keys(SORT_BY)[0],
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
    fetch(`/api/ross?limit=${filters.limit}`)
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
            b[2][filters.sortBy as keyof typeof SORT_BY] -
            a[2][filters.sortBy as keyof typeof SORT_BY]
        ),
    [data, filters.sortBy]
  );

  const filtered = useMemo(
    () =>
      grouped.filter(
        ([id, [{ data }]]) =>
          (queries.search === "" ||
            queries.search === id ||
            data.brand?.toLowerCase().includes(queries.search) ||
            data.name?.toLowerCase().includes(queries.search) ||
            data.caption?.toLowerCase().includes(queries.search) ||
            data.cmpDescription?.toLowerCase().includes(queries.search)) &&
          [data.brand, ""].includes(queries.brand) &&
          [data.category, ""].includes(queries.group)
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
              group: Object.assign(options.group || {}, {
                [data.category]: true,
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
        {filtered.map(([id, list, meta]) => (
          <li key={id}>
            <List list={list} meta={meta} />
          </li>
        ))}
      </ol>
    </section>
  );
}
