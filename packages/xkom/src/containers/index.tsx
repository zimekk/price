import {
  ChangeEventHandler,
  ComponentPropsWithoutRef,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import dayjs from "dayjs";
import { Subject, debounceTime, distinctUntilChanged, map } from "rxjs";
import { z } from "zod";
import { LazyImage } from "@acme/components";
import { DataSchema, ItemSchema } from "../schema";

interface FiltersState {
  brand: string;
  group: string;
  search: string;
}

interface OptionsState {
  brand: string[];
  group: string[];
}

function Link({ href = "#", ...props }: ComponentPropsWithoutRef<"a">) {
  const hash = href[0] === "#";

  return (
    <a
      href={href}
      target={hash ? undefined : "_blank"}
      rel={hash ? undefined : "noopener noreferrer"}
      {...props}
    />
  );
}

function Loading() {
  return <div>Loading...</div>;
}

type Data = z.infer<typeof DataSchema>;

type Item = z.infer<typeof ItemSchema>;

const formatPrice = (price: number) =>
  `${new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 2,
  }).format(price)} zł`;

function Gallery({ data }: { data: Data }) {
  return (
    <div style={{ width: 120, height: 120, marginRight: "1em" }}>
      {[data.photo].map(
        (item, key) =>
          item.thumbnailUrl && <LazyImage key={key} src={item.thumbnailUrl} />
      )}
    </div>
  );
}

function Summary({ data }: { data: Data }) {
  return (
    <div>
      <div style={{ float: "right", fontSize: "small" }}>
        #
        <Link
          href={`#${data.id}`}
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
      <strong>{data.producer.name}</strong>
      {data.name && <i>{` ${data.name}`}</i>}
      <div
        style={{
          fontSize: "small",
        }}
      >
        {data.featureSummary && (
          <ul>
            {data.featureSummary?.map((text, key) => (
              <li key={key}>{text}</li>
            ))}
          </ul>
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
    </fieldset>
  );
}

export function List({ list }: { list: Item[] }) {
  const [show, setShow] = useState(false);

  return (
    <div style={{ display: "flex", margin: "1em 0" }}>
      {list.slice(0, 1).map((item) => (
        <Gallery key={item.id} data={item.data} />
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
    brand: "",
    group: "",
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
    fetch("/api/xkom")
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
            {} as Record<string, Item[]>
          )
      ).sort((a, b) => b[1][0].created.localeCompare(a[1][0].created)),
    [data]
  );

  const filtered = useMemo(
    () =>
      grouped.filter(
        ([id, [{ data }]]) =>
          (queries.search === "" ||
            queries.search === id ||
            data.producer.name?.toLowerCase().includes(queries.search) ||
            data.name?.toLowerCase().includes(queries.search)) &&
          [data.producer.name, ""].includes(queries.brand) &&
          [data.category.id, ""].includes(queries.group)
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
                [data.producer.name]: true,
              }),
              group: Object.assign(options.group || {}, {
                [data.category.id]: true,
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
