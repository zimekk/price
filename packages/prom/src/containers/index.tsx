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
import { Gallery, Input, Link, Loading, Picker } from "@acme/components";
import { formatPrice, getPercentage } from "@acme/prod";
import { GeneralSchema, ProductSchema } from "../schema";

const LIMIT = 100;

export const SORT_BY = {
  price: "Cena",
  date_start: "Data promocji",
} as const;

const INITIAL_FILTERS = {
  offset: 0,
  search: "",
  sortBy: Object.keys(SORT_BY)[1],
};

const ItemSchema = z.object({
  general: GeneralSchema,
  product: ProductSchema,
});

const DataSchema = z.object({
  offset: z.number(),
  result: ItemSchema.array(),
});

type FiltersState = typeof INITIAL_FILTERS;

type Item = z.infer<typeof ItemSchema>;
type Data = z.infer<typeof DataSchema>;

function Summary({ general, product: data }: Item) {
  return (
    <div>
      <strong>{data.name}</strong>
      {general.name && (
        <Link href={`#${general.url}`}>
          <small>{` ${general.name}`}</small>
        </Link>
      )}
      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
    </div>
  );
}

function Details({ general, product: data }: Item) {
  return (
    <div style={{ borderTop: "1px solid lightgray", marginTop: ".25em" }}>
      <div style={{ float: "right" }}>
        <small>{dayjs(general.date_start).format("MMM D, YYYY H:mm")}</small>
        <small>
          {" "}
          &rarr; {dayjs(general.date_stop).format("MMM D, YYYY H:mm")}
        </small>
      </div>
      <strong>
        {data.priceInfo.oldPrice && (
          <span>
            <span
              style={{ color: "lightgray", textDecoration: "line-through" }}
            >
              {formatPrice(data.priceInfo.oldPrice)}
            </span>{" "}
          </span>
        )}
        <span
          style={{
            color: data.priceInfo.oldPrice ? "orangered" : "darkslateblue",
          }}
        >
          {formatPrice(data.priceInfo.price)}
          {data.priceInfo.oldPrice && (
            <small>{` (${new Intl.NumberFormat("pl-PL", {
              maximumFractionDigits: 2,
            }).format(getPercentage(data.priceInfo))}%)`}</small>
          )}
        </span>
      </strong>
      {data.availabilityStatus && <span>{` ${data.availabilityStatus}`}</span>}
      {data.freeShipping && <small>{` (FreeShipping)`}</small>}
      {data.ratingCount ? (
        <span>
          {` / ${data.rating}`}
          <small>{` (${data.ratingCount})`}</small>
        </span>
      ) : null}
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
      <Input
        label="Search"
        type="search"
        value={filters.search}
        onChange={useCallback<ChangeEventHandler<HTMLInputElement>>(
          ({ target }) =>
            setFilters((filters) => ({
              ...filters,
              search: target.value,
            })),
          [],
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
          [],
        )}
      />
    </fieldset>
  );
}

export function List({ general, product }: Item) {
  return (
    <div style={{ display: "flex", margin: "1em 0" }}>
      {[product].map((item) => (
        <Gallery key={item.id} images={[item.photo]} />
      ))}
      <div style={{ flex: 1 }}>
        <Summary general={general} product={product} />
        <Details general={general} product={product} />
        {/* <pre>{JSON.stringify(item, null, 2)}</pre> */}
      </div>
    </div>
  );
}

export function Price() {
  const [data, setData] = useState<Data | null>(null);
  const [filters, setFilters] = useState<FiltersState>(() => INITIAL_FILTERS);

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
    fetch(
      `/api/prom?${new URLSearchParams({
        ilike: queries.search,
        orderBy: queries.sortBy,
        limit: String(LIMIT),
        start: String(queries.offset),
      })}`,
    )
      .then((res) => res.json())
      .then((data) => DataSchema.parse(data))
      .then(({ result, offset }) => {
        setData((data) => ({
          offset,
          result:
            data && queries.offset > 0 ? data.result.concat(result) : result,
        }));
      });
  }, [queries]);

  const list = useMemo(() => data && data.result, [data]);

  if (data === null) return <Loading />;

  console.log({ filters, list });
  return (
    <section>
      <Filters filters={filters} setFilters={setFilters} />
      <ol>
        {list &&
          list.map((item, key) => (
            <li key={`${item.general.id}-${item.product.id}-${key}`}>
              <List {...item} />
            </li>
          ))}
      </ol>
      {data && data.offset > 0 && (
        <Link
          onClick={(e) => (
            e.preventDefault(),
            setQueries((queries) => ({
              ...queries,
              offset: data.offset,
            }))
          )}
        >
          More &darr;
        </Link>
      )}
    </section>
  );
}
