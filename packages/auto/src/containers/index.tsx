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
import { Color, Gallery, Link, Loading } from "@acme/components";
import { DataSchema, ItemSchema } from "../schema";

interface FiltersState {
  availability: string;
  brand: string;
  dealer: string;
  search: string;
  limit: number;
}

interface OptionsState {
  brand: string[];
  dealer: string[];
}

type Data = z.infer<typeof DataSchema>;

type Item = z.infer<typeof ItemSchema>;

const URL = process.env.NEXT_PUBLIC_AUTO_BASE_URL || "";

const LIMIT = [...Array(10)].map((_value, index) => (index + 1) * 100);

const formatPrice = (price: number) =>
  `${new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 2,
  }).format(price)} zł`;

function Summary({ data }: { data: Data }) {
  return (
    <div>
      <div style={{ float: "right", fontSize: "small" }}>
        #
        <Link
          href={`${URL}/pl/stocklocator.html#/details/${data.documentId}`}
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
          {data.documentId}
        </Link>
      </div>
      <strong>{data.vehicleSpecification.modelAndOption.brand}</strong>
      <i>{` ${data.vehicleSpecification.modelAndOption.model.modelName}`}</i>
      <small>{` (${data.vehicleSpecification.modelAndOption.modelRange.name})`}</small>
      <Color
        color={data.vehicleSpecification.modelAndOption.color.hexColorCode}
      >
        {data.vehicleSpecification.modelAndOption.color.clusterFine}
      </Color>
      {data.vehicleSpecification.modelAndOption.upholsteryColor && (
        <Color
          color={
            data.vehicleSpecification.modelAndOption.upholsteryColor
              .hexColorCode
          }
        >
          {
            data.vehicleSpecification.modelAndOption.upholsteryColor
              .upholsteryColorCluster
          }
        </Color>
      )}
      <div
        style={{
          fontSize: "small",
        }}
      >
        {data.ordering.distributionData.locationOutletNickname}
      </div>
      {/* <div
        style={{
          fontSize: "small",
        }}
      >
        {data.vehicleSpecification.modelAndOption.equipments ? (
          <ul>
            {Object.values(data.vehicleSpecification.modelAndOption.equipments).map(
              ({ name, offerPriceGross }, key) => (
                <li key={key}>
                  {name.pl_PL} <small>{offerPriceGross}</small>
                </li>
              )
            )}
          </ul>
        ) : null}
      </div> */}
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
          <span>Dealer</span>
          <select
            value={filters.dealer}
            onChange={useCallback<ChangeEventHandler<HTMLSelectElement>>(
              ({ target }) =>
                setFilters((filters) => ({
                  ...filters,
                  dealer: target.value,
                })),
              []
            )}
          >
            {[""].concat(options.dealer).map((value) => (
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
          images={Object.values(item.data.media.cosyImages)}
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
    availability: TYPE[0],
    brand: "",
    dealer: "",
    search: "M40i",
    limit: LIMIT[0],
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
    fetch(`/api/auto?limit=${filters.limit}`)
      .then((res) => res.json())
      .then(({ result }: { result: Item[] }) => {
        setData({
          result,
        });
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
              .includes(queries.search) ||
            data.vehicleSpecification.modelAndOption.modelRange.name
              .toLowerCase()
              .includes(queries.search)) &&
          [data.salesProcess.type, ""].includes(queries.availability) &&
          [data.vehicleSpecification.modelAndOption.brand, ""].includes(
            queries.brand
          ) &&
          [data.ordering.distributionData.locationOutletNickname, ""].includes(
            queries.dealer
          )
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
                [data.vehicleSpecification.modelAndOption.brand]: true,
              }),
              dealer: Object.assign(
                options.dealer || {},
                data.ordering.distributionData.locationOutletNickname && {
                  [data.ordering.distributionData.locationOutletNickname]: true,
                }
              ),
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
  console.log({ result: data.result, options, filters, filtered, grouped });
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
