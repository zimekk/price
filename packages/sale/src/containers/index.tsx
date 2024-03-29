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
import { ItemSchema, ProductSchema } from "../schema";

interface FiltersState {
  search: string;
}

type Data = z.infer<typeof ProductSchema>;

type Item = z.infer<typeof ItemSchema>;

function General({ data }: { data: Item["data"] }) {
  const { general } = data;
  return (
    <div>
      <Link href={`#${general.url}`}>
        <strong>{general.name}</strong>
      </Link>
      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
    </div>
  );
}

function Summary({ item, data }: { item: Item; data: Data }) {
  return (
    <div>
      <strong>{data.name}</strong>
      {item.data.general.name && <i>{` ${item.data.general.name}`}</i>}
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

export function List({ item, data }: { item: Item; data: Data }) {
  return (
    <div style={{ display: "flex", margin: "1em 0" }}>
      {[data].map((item) => (
        <Gallery key={item.id} images={[item.photo]} />
      ))}
      <div style={{ flex: 1 }}>
        {[data].map((data, key) => (
          <div key={item.id}>
            {!key && <Summary item={item} data={data} />}
            <Details
              data={data}
              created={item.created}
              checked={item.checked}
            />
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
    fetch("/api/sale")
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
  }, []);

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
      ).sort((a, b) => b[1][0].created.localeCompare(a[1][0].created)),
    [data],
  );

  const filtered = useMemo(
    () =>
      grouped
        .map(
          ([id, [item]]) =>
            [
              id,
              [
                {
                  ...item,
                  data: {
                    ...item.data,
                    products: item.data.products.filter(
                      (product) =>
                        queries.search === "" ||
                        product.name?.toLowerCase().includes(queries.search),
                    ),
                  },
                },
              ],
            ] as [string, Item[]],
        )
        .filter(([_id, list]) =>
          list.find((item) => item.data.products.length > 0),
        ),
    [queries, grouped],
  );

  if (data === null) return <Loading />;

  console.log({ filters, filtered });
  return (
    <section>
      <Filters filters={filters} setFilters={setFilters} />
      <ol>
        {filtered.map(([id, list]) =>
          list.map((item) => (
            <li key={item.id}>
              <General data={item.data} />
              <ol>
                {item.data.products.map((product) => (
                  <li key={`${id}-${product.id}`}>
                    <List item={item} data={product} />
                  </li>
                ))}
              </ol>
            </li>
          )),
        )}
      </ol>
    </section>
  );
}
