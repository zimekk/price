import {
  ChangeEventHandler,
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
  search: string;
}

function Loading() {
  return <div>Loading...</div>;
}

type Data = z.infer<typeof DataSchema>;

type Item = z.infer<typeof ItemSchema>;

// https://stackoverflow.com/questions/2660201/what-parameters-should-i-use-in-a-google-maps-url-to-go-to-a-lat-lon
export function getLocationLink(location: string, zoom = 0) {
  const [latitude, longitude] = location.split(",");
  return `//www.google.com/maps?t=k&q=loc:${latitude}+${longitude}&hl=pl${
    zoom ? `&z=${zoom}` : ""
  }`;
}

function Gallery({ data }: { data: Data }) {
  return (
    <div style={{ width: 120, height: 120, marginRight: "1em" }}>
      {Object.values(data.photos)
        .slice(0, 1)
        .map((url, key) => (
          <LazyImage key={key} src={url} />
        ))}
    </div>
  );
}

function Summary({ data }: { data: Data }) {
  return (
    <div>
      <a href={data.url} target="_blank" rel="noopener noreferrer">
        <strong>{data.title}</strong>
      </a>
      <div>
        <a
          href={getLocationLink((({ lat, lon }) => `${lat},${lon}`)(data.map))}
          target="_blank"
          rel="noopener noreferrer"
        >
          <i>{` ${data.location.pathName}`}</i>
        </a>
      </div>
      <div
        style={{
          fontSize: "small",
        }}
      >
        <div>{data.description}</div>
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

function Details({ data }: { data: Data }) {
  return (
    <div style={{ borderTop: "1px solid lightgray", marginTop: ".25em" }}>
      <div style={{ float: "right" }}>
        <small>
          {dayjs(data.createdTime).format("MMM D, YYYY H:mm")} -{" "}
          {dayjs(data.validToTime).format("MMM D, YYYY H:mm")}
        </small>
      </div>
      <strong>
        <span
          style={{
            color: "darkslateblue",
          }}
        >
          {data.price.displayValue}
        </span>
      </strong>
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
            []
          )}
        />
      </label>
    </fieldset>
  );
}

export function Item({ data }: { data: Data }) {
  // const [show, setShow] = useState(false);

  return (
    <div style={{ display: "flex", margin: "1em 0" }}>
      <Gallery data={data} />
      <div style={{ flex: 1 }}>
        {[data].map((item, key) => (
          <div key={item.id}>
            {!key && <Summary data={data} />}
            <Details data={data} />
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
    fetch("/api/plot")
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
      (data ? data.result : [])
        .sort((a, b) => b.created.localeCompare(a.created))
        .map(({ id, data }) => ({ id: String(id), data })),
    [data]
  );

  const filtered = useMemo(
    () =>
      grouped.filter(
        ({ id, data }) =>
          queries.search === "" ||
          queries.search === id ||
          data.title.toLowerCase().includes(queries.search) ||
          data.location.pathName.toLowerCase().includes(queries.search)
      ),
    [queries, grouped]
  );

  if (data === null) return <Loading />;
  console.log({ filters, filtered });
  return (
    <section>
      <Filters filters={filters} setFilters={setFilters} />
      <ol>
        {filtered.map(({ id, data }) => (
          <li key={id}>
            <Item data={data} />
          </li>
        ))}
      </ol>
    </section>
  );
}
