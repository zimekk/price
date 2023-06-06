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
  availability: string;
  search: string;
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
      {Object.values(data.media.cosyImages)
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
      <strong>{data.vehicleSpecification.modelAndOption.brand}</strong>
      <i>{` ${data.vehicleSpecification.modelAndOption.model.modelName}`}</i>
      <small>{` (${data.vehicleSpecification.modelAndOption.modelRange.name})`}</small>
      <div
        style={{
          fontSize: "small",
        }}
      >
        {data.ordering.distributionData.locationOutletNickname}
      </div>
      <div
        style={{
          fontSize: "small",
        }}
      >
        {data.equipments ? (
          <ul>
            {Object.values(data.equipments).map(
              ({ name, offerPriceGross }, key) => (
                <li key={key}>
                  {name.pl_PL} <small>{offerPriceGross}</small>
                </li>
              )
            )}
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
          {formatPrice(data.price.grossSalesPrice)} (
          {formatPrice(data.price.equipmentsTotalGrossPrice)}){" "}
          <small>
            {dayjs(data.price.priceUpdatedAt).format("MMM D, YYYY H:mm")}
          </small>
        </span>
      </strong>
      {data.salesProcess.type && (
        <span>{` ${data.salesProcess.type} - ${data.salesProcess.reason}`}</span>
      )}
      {data.vehicleLifeCycle.isRepaired && <small>{` (Repaired)`}</small>}
    </div>
  );
}

const TYPE = ["AVAILABLE", "RESERVED_MANUAL", "SOLD"] as const;

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
        <span>Availability</span>
        <select
          value={filters.availability}
          onChange={useCallback<ChangeEventHandler<HTMLSelectElement>>(
            ({ target }) =>
              setFilters((filters) => ({
                ...filters,
                availability: target.value,
              })),
            []
          )}
        >
          {[""].concat(TYPE).map((value) => (
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
    availability: TYPE[0],
    search: "G01",
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
    fetch("/api/auto")
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
            data.vehicleSpecification.modelAndOption.model.modelName
              .toLowerCase()
              .match(queries.search) ||
            data.vehicleSpecification.modelAndOption.modelRange.name
              .toLowerCase()
              .match(queries.search)) &&
          (queries.availability === "" ||
            queries.availability === data.salesProcess.type)
      ),
    [queries, grouped]
  );

  if (data === null) return <Loading />;
  console.log({ data, filters, filtered });
  return (
    <section>
      <Filters filters={filters} setFilters={setFilters} />
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
