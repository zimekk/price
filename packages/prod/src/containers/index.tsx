import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Error, Gallery, Link, Loading } from "@acme/components";
import type { Data, Item } from "../schema";
import {
  type FiltersState,
  Filters,
  OptionsState,
  PRICE_LIST,
  SORT_BY,
  initialQueries,
} from "./Filters";

type Meta = {
  // type: string;
  minPrice: number;
  maxPrice: number;
  minPriceChanged: number;
  price: number;
  priceChanged: number;
};

export const formatPrice = (price: number) =>
  `${new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 2,
  }).format(price)} zł`;

export const getMeta = (list: Item[]) =>
  list.reduce(
    (meta, { type, data, created }) =>
      Object.assign(
        meta,
        // { type },
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
        },
      ),
    {
      minPrice: Infinity,
      maxPrice: 0,
      minPriceChanged: 0,
      price: 0,
      priceChanged: 0,
    },
  );

export const getPercentage = ({
  price,
  oldPrice = price,
}: {
  price: number;
  oldPrice?: number | null;
}) => (oldPrice !== null ? (price / oldPrice - 1) * 100 : 0);

function Summary({
  data,
  item,
  setList,
}: {
  data: Data;
  item: string;
  setList: (list: Item[]) => void;
}) {
  const fetcher = () =>
    fetch(`/api/prod/history?item=${item}`)
      .then(async (res) =>
        res.ok ? await res.json() : Promise.reject(await res.text()),
      )
      .then(({ result }: { result: Item[] }) => setList(result))
      .catch(console.error);

  return (
    <div>
      <div style={{ float: "right", fontSize: "small" }}>
        #
        <Link
          href={data.url}
          onClick={(e) => {
            const range = document.createRange();
            e.preventDefault();
            range.selectNode(e.target as HTMLElement);
            ((selection) =>
              selection &&
              (selection.removeAllRanges(), selection.addRange(range)))(
              window.getSelection(),
            );
            fetcher();
          }}
        >
          {data.id}
        </Link>
      </div>
      <strong>{data.brand}</strong>
      {data.name && <i>{` ${data.name}`}</i>}
      {data.mark && (
        <>
          &nbsp;
          <span
            style={{
              fontSize: "xx-small",
              color: {
                CashBack: "blue",
                ForTeacher: "blue",
                Installment0Percent: "violet",
                LastItems: "mediumvioletred",
                New: "darkorange",
                PlusGratis: "limegreen",
                Presale: "limegreen",
                Promotion: "orangered",
                RecommendedProduct: "cornflowerblue",
              }[data.mark],
              border: "1px solid currentColor",
              padding: "0 .25em",
              position: "relative",
              top: -2,
            }}
          >
            {data.mark}
          </span>
        </>
      )}
      {/* <div
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
      </div> */}
      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
    </div>
  );
}

function Details({
  data,
  meta,
  created,
  checked,
}: {
  data: Data;
  meta: Meta;
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
        {meta.minPriceChanged === dayjs(created).valueOf() ? (
          <i
            style={{
              position: "absolute",
              marginLeft: "-1em",
              color: "green",
            }}
          >
            &#8594;
          </i>
        ) : (
          meta.minPrice === data.price && (
            <i
              style={{
                position: "absolute",
                marginLeft: "-1em",
                color: "lightgray",
              }}
            >
              &#8594;
            </i>
          )
        )}
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
      {/* {data.availabilityStatus && <span>{` ${data.availabilityStatus}`}</span>} */}
      {/* {data.freeShipping && <small>{` (FreeShipping)`}</small>} */}
      {/* {data.ratingCount ? (
        <span>
          {` / ${data.rating}`}
          <small>{` (${data.ratingCount})`}</small>
        </span>
      ) : null} */}
    </div>
  );
}

export function List({ list: initialList }: { list: Item[] }) {
  const [show, setShow] = useState(false);
  const [list, setList] = useState(initialList);

  const meta = useMemo(() => getMeta(list), [list]);

  return (
    <div style={{ display: "flex", margin: "1em 0" }}>
      {list.slice(0, 1).map((item) => (
        <Gallery key={item.id} images={item.data.images} />
      ))}
      <div style={{ flex: 1 }}>
        {/* [{meta.minPrice}]
        [{meta.maxPrice}]
        [{dayjs(meta.minPriceChanged).format("MMM D, YYYY H:mm")}] */}
        {(show ? list : list.slice(0, 1)).map((item, key) => (
          <div key={item.id}>
            {!key && (
              <Summary data={item.data} item={item.item} setList={setList} />
            )}
            <Details
              meta={meta}
              data={item.data}
              created={item.created}
              checked={item.updated}
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

export function Main({
  result,
  queries,
}: {
  result: Item[];
  queries: FiltersState;
}) {
  const grouped = useMemo(
    () =>
      Object.entries(
        result
          .sort((a, b) => b.created.localeCompare(a.created))
          .reduce(
            (list, item) =>
              Object.assign(list, {
                [item.item]: (list[item.item] || []).concat(item),
              }),
            {} as Record<string, Item[]>,
          ),
      )
        .map(
          ([item, list]) =>
            [item, list, getMeta(list)] as [string, Item[], Meta],
        )
        .sort(
          (a, b) =>
            (["minPrice", "price"].includes(queries.sortBy) ? -1 : 1) *
            (b[2][queries.sortBy as keyof typeof SORT_BY] -
              a[2][queries.sortBy as keyof typeof SORT_BY]),
        ),
    [result, queries.sortBy],
  );

  const filtered = useMemo(
    () =>
      grouped.filter(
        ([id, [{ data, type }]]) =>
          (queries.search === "" ||
            queries.search === data.id ||
            data.brand?.toLowerCase().includes(queries.search) ||
            data.name?.toLowerCase().includes(queries.search)) &&
          [data.brand, ""].includes(queries.brand) &&
          [type, ""].includes(queries.type) &&
          (queries.priceTo === PRICE_LIST[0] ||
            (data.price
              ? ((price) =>
                  queries.priceFrom <= price && price <= queries.priceTo)(
                  data.price,
                )
              : true)),
        // [data.category.id, ""].includes(queries.group)
      ),
    [queries, grouped],
  );

  console.log({ result, filtered });

  return (
    <section>
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

export function Price() {
  const [{ error, loading = false, result }, setData] = useState<{
    error?: Error;
    loading?: boolean;
    result?: Item[];
  }>({});
  const [queries, setQueries] = useState(() => initialQueries());

  const fetcher = () =>
    (setData(({ error, ...data }) => ({ ...data, loading: true })),
    fetch(`/api/prod?limit=${queries.limit}`))
      .then(async (res) =>
        res.ok ? await res.json() : Promise.reject(await res.text()),
      )
      .then(({ result }: { result: Item[] }) => setData({ result }))
      .catch((error) =>
        setData(({ loading, ...data }) => ({ ...data, error })),
      );

  useEffect(() => {
    fetcher();
  }, [queries.limit]);

  const options = useMemo(
    () =>
      Object.entries(
        (result || []).reduce(
          (options, { data }) =>
            Object.assign(options, {
              brand: Object.assign(
                options.brand || {},
                data.brand
                  ? {
                      [data.brand]: true,
                    }
                  : {},
              ),
              // group: Object.assign(options.group || {}, {
              //   [data.category.id]: true,
              // }),
            }),
          {} as OptionsState,
        ),
      ).reduce(
        (options, [key, value]) =>
          Object.assign(options, {
            [key]: Object.keys(value).sort(),
          }),
        {} as OptionsState,
      ),
    [result],
  );

  console.log({ error, options, queries });

  return (
    <section>
      <Filters options={options} setQueries={setQueries} />
      {error && <Error onRetry={fetcher}>{error.toString()}</Error>}
      {loading && <Loading />}
      {result && <Main result={result} queries={queries} />}
    </section>
  );
}
