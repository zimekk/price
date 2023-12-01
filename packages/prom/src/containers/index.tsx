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
import { formatPrice, getPercentage } from "@acme/prod";
import { GeneralSchema, ProductSchema } from "../schema";

const ItemSchema = z.object({
  general: GeneralSchema,
  product: ProductSchema,
});

interface FiltersState {
  search: string;
}

type Item = z.infer<typeof ItemSchema>;

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
            [],
          )}
        />
      </label>
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
    fetch(`/api/prom?${new URLSearchParams({ ilike: queries.search })}`)
      .then((res) => res.json())
      .then((data) => {
        setData(
          z
            .object({
              result: ItemSchema.array(),
            })
            .parse(data),
        );
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
          list.map((item) => (
            <li key={`${item.general.id}-${item.product.id}`}>
              <List {...item} />
            </li>
          ))}
      </ol>
    </section>
  );
}
