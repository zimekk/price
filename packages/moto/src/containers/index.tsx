import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Subject, debounceTime, distinctUntilChanged, map } from "rxjs";
import { z } from "zod";
import { Gallery, Link, Loading, LocationLink } from "@acme/components";
import {
  type FiltersState,
  type OptionsState,
  Filters,
  LIMIT,
  MILEAGE_LIST,
  PRICE_LIST,
} from "./Filters";
import { DataSchema, ItemSchema } from "../schema";

type Data = z.infer<typeof DataSchema>;

type Item = z.infer<typeof ItemSchema> & {
  item: string;
  checked: string | null;
  values: Record<string, string>;
};

type Meta = {
  created: number;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 2,
  }).format(price);

function getLocationLink(location: string, zoom = 0) {
  return `//www.google.com/maps?t=k&q=${encodeURIComponent(location)}&hl=pl${
    zoom ? `&z=${zoom}` : ""
  }`;
}

function Summary({ data }: { data: Data }) {
  return (
    <div>
      <div style={{ float: "right", fontSize: "small" }}>
        #
        <Link
          href={`${data.url}`}
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
      {((location) => (
        <div
          style={{
            fontSize: "small",
          }}
        >
          <LocationLink href={getLocationLink(location)}>
            <i>{location}</i>
          </LocationLink>
        </div>
      ))((({ city, region }) => `${city.name}, ${region.name}`)(data.location))}
      {/* {data.name && <i>{` ${data.name}`}</i>} */}
      <div
        style={{
          fontSize: "small",
        }}
      >
        <div>{data.shortDescription}</div>
        {data.parameters && (
          <ul>
            {data.parameters.map(({ key, displayValue }) => (
              <li key={key}>{`${key}: ${displayValue}`}</li>
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
        <span
          style={{
            color: "darkslateblue",
          }}
        >
          {formatPrice(data.price.amount.units)}
          <small> {data.price.amount.currencyCode}</small>
        </span>
      </strong>
      {data.priceEvaluation && (
        <>
          &nbsp;
          <span
            style={{
              fontSize: "xx-small",
              color: {
                // ABOVE: "darksalmon",
                ABOVE: "chocolate",
                BELOW: "limegreen",
                // IN: "dodgerblue",
                IN: "cornflowerblue",
                NONE: "grey",
              }[data.priceEvaluation.indicator],
              border: "1px solid currentColor",
              padding: "0 .25em",
              position: "relative",
              top: -1,
            }}
          >
            {data.priceEvaluation.indicator}
          </span>
        </>
        // <small> ({data.priceEvaluation.indicator})</small>
      )}
      {/* {data.availabilityStatus && <span>{` ${data.availabilityStatus}`}</span>}
      {data.freeShipping && <small>{` (FreeShipping)`}</small>}
      {data.ratingCount ? (
        <span>
          {` / ${data.rating}`}
          <small>{` (${data.ratingCount})`}</small>
        </span>
      ) : null} */}
    </div>
  );
}

export function List({ list, meta }: { list: Item[]; meta: Meta }) {
  const [show, setShow] = useState(false);

  return (
    <div style={{ display: "flex", margin: "1em 0" }}>
      {list.slice(0, 1).map((item) => (
        <Gallery
          key={item.id}
          images={[item.data.thumbnail]
            .filter(Boolean)
            .map((thumbnail: any) => thumbnail.x1)}
        />
      ))}
      <div style={{ flex: 1 }}>
        {/* [{meta.minPrice}]
        [{meta.maxPrice}]
        [{dayjs(meta.minPriceChanged).format("MMM D, YYYY H:mm")}] */}
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
  const [filters, setFilters] = useState<FiltersState>(() =>
    ((yearTo) => ({
      country: "",
      fuel: "",
      gearbox: "",
      make: "",
      search: "",
      limit: LIMIT[0],
      mileageFrom: MILEAGE_LIST[0],
      mileageTo: MILEAGE_LIST[3],
      priceFrom: PRICE_LIST[5],
      priceTo: PRICE_LIST[7],
      yearFrom: yearTo - 3,
      yearTo,
    }))(new Date().getFullYear())
  );

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
    fetch(`/api/moto?limit=${filters.limit}`)
      .then((res) => res.json())
      .then((data) => {
        setData(
          z
            .object({
              result: ItemSchema.transform((item) =>
                Object.assign(item, {
                  id: Number(item.id),
                  item: item.id,
                  checked: null,
                  values: item.data.parameters.reduce(
                    (values, { key, value }) =>
                      Object.assign(values, {
                        [key]: value,
                      }),
                    {}
                  ),
                })
              ).array(),
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
                  Object.assign(meta, {
                    created: new Date(created).getTime(),
                  }),
                {
                  created: 0,
                }
              ),
            ] as [string, Item[], Meta]
        )
        .sort((a, b) => b[2].created - a[2].created),
    [data]
  );

  const filtered = useMemo(
    () =>
      grouped.filter(
        ([id, [{ data, values }]]) =>
          (queries.search === "" ||
            queries.search === id ||
            data.title?.toLowerCase().includes(queries.search) ||
            data.shortDescription?.toLowerCase().includes(queries.search)) &&
          (queries.mileageTo === MILEAGE_LIST[0] ||
            (values.mileage
              ? ((mileage) =>
                  queries.mileageFrom <= mileage &&
                  mileage <= queries.mileageTo)(Number(values.mileage))
              : true)) &&
          (queries.priceTo === PRICE_LIST[0] ||
            (data.price.amount
              ? ((price) =>
                  queries.priceFrom <= price && price <= queries.priceTo)(
                  data.price.amount.units
                )
              : true)) &&
          (values.year
            ? ((year) => queries.yearFrom <= year && year <= queries.yearTo)(
                Number(values.year)
              )
            : true) &&
          [values.country_origin, ""].includes(queries.country) &&
          [values.fuel_type, ""].includes(queries.fuel) &&
          [values.gearbox, ""].includes(queries.gearbox) &&
          [values.make, ""].includes(queries.make)
      ),
    [queries, grouped]
  );

  const options = useMemo(
    () =>
      Object.entries(
        (data ? data.result : []).reduce(
          (options, { values }) =>
            Object.assign(options, {
              country: Object.assign(
                options.country || {},
                values.country_origin && {
                  [values.country_origin]: true,
                }
              ),
              fuel: Object.assign(
                options.fuel || {},
                values.fuel_type && {
                  [values.fuel_type]: true,
                }
              ),
              gearbox: Object.assign(
                options.gearbox || {},
                values.gearbox && {
                  [values.gearbox]: true,
                }
              ),
              make: Object.assign(
                options.make || {},
                values.make && {
                  [values.make]: true,
                }
              ),
              year: Object.assign(
                options.year || {},
                values.year && {
                  [values.year]: true,
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
