import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Subject, debounceTime, distinctUntilChanged, map } from "rxjs";
import { Gallery, Link, Loading, LocationLink, Text } from "@acme/components";
import type { Data, Item } from "../schema";
import {
  type FiltersState,
  type OptionsState,
  AREA_LIST,
  Filters,
  LIMIT,
  PRICE_LIST,
  SORT_BY,
} from "./Filters";

type Meta = {
  dateCreated: number;
  dateCreatedFirst: number;
  totalPrice: number;
  pricePerSquareMeter: number;
  areaInSquareMeters: number;
  terrainAreaInSquareMeters: number;
};

const URL = process.env.NEXT_PUBLIC_PROP_BASE_URL || "";

const formatPrice = (price: number, currency: string) =>
  `${new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 0,
  }).format(price)} ${currency}`;

const formatArea = (area: number) =>
  `${new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 0,
  }).format(area)}`;

function getLocationAddress({ address }: Data["location"]) {
  return ([] as string[])
    .concat(address.street ? address.street.name : [])
    .concat(address.city.name || [])
    .concat(address.province.name || [])
    .join(", ");
}

function getLocationLink(location: string, zoom = 0) {
  return `//www.google.com/maps?t=k&q=${encodeURIComponent(location)}&hl=pl${
    zoom ? `&z=${zoom}` : ""
  }`;
}

function Description({ children }: { children: string }) {
  return <Text>{children}</Text>;
}

function Summary({ data }: { data: Data }) {
  return (
    <div>
      <div style={{ float: "right", fontSize: "small" }}>
        #
        <Link
          href={`${URL}/pl/oferta/${data.slug}`}
          onClick={(e) => {
            const range = document.createRange();
            e.preventDefault();
            range.selectNode(e.target as HTMLElement);
            ((selection) =>
              selection &&
              (selection.removeAllRanges(), selection.addRange(range)))(
              window.getSelection(),
            );
          }}
        >
          {data.id}
        </Link>
      </div>
      <div>
        <strong>{data.title}</strong>
        {data.isPromoted && (
          <>
            &nbsp;
            <span
              style={{
                fontSize: "xx-small",
                color: "goldenrod",
                border: "1px solid currentColor",
                padding: "0 .25em",
                position: "relative",
                top: -2,
              }}
            >
              PROMOTED
            </span>
          </>
        )}
        {data.isExclusiveOffer && (
          <>
            &nbsp;
            <span
              style={{
                fontSize: "xx-small",
                color: "cornflowerblue",
                border: "1px solid currentColor",
                padding: "0 .25em",
                position: "relative",
                top: -2,
              }}
            >
              EXCLUSIVE
            </span>
          </>
        )}
      </div>
      {(data.location || data.locationLabel) && (
        <div
          style={{
            fontSize: "small",
          }}
        >
          {((location) => (
            <LocationLink href={getLocationLink(location)}>
              <i>{location}</i>
            </LocationLink>
          ))(
            data.locationLabel
              ? data.locationLabel.value
              : getLocationAddress(data.location),
          )}
        </div>
      )}
      <div
        style={{
          fontSize: "small",
        }}
      >
        {data.estate} / {data.dateCreatedFirst} / {data.dateCreated}
        {data.agency && (
          <>
            &nbsp;
            <span
              style={{
                fontSize: "xx-small",
                color: "grey",
                border: "1px solid currentColor",
                padding: "0 .25em",
                position: "relative",
                top: -1,
              }}
            >
              {data.agency.name}
            </span>
          </>
        )}
        {data.isPrivateOwner && (
          <>
            &nbsp;
            <span
              style={{
                fontSize: "xx-small",
                color: "lightcoral",
                border: "1px solid currentColor",
                padding: "0 .25em",
                position: "relative",
                top: -1,
              }}
            >
              PRIVATE
            </span>
          </>
        )}
        {data.shortDescription && (
          <Description>{data.shortDescription}</Description>
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
      <div
        style={{
          color: "darkslateblue",
        }}
      >
        {data.totalPrice && (
          <strong>
            {formatPrice(data.totalPrice.value, data.totalPrice.currency)}
          </strong>
        )}
        {data.areaInSquareMeters && (
          <span>
            {" / "}
            <strong>{formatArea(data.areaInSquareMeters)} m&sup2;</strong>
          </span>
        )}
        {data.terrainAreaInSquareMeters && (
          <span>
            {" "}
            / {formatArea(data.terrainAreaInSquareMeters)} m<sup>2</sup>
          </span>
        )}
        {data.pricePerSquareMeter && (
          <small>
            {" "}
            (
            <strong>
              {formatPrice(
                data.pricePerSquareMeter.value,
                data.pricePerSquareMeter.currency,
              )}
              /m&sup2;
            </strong>
            )
          </small>
        )}
      </div>
    </div>
  );
}

export function List({ list }: { list: Item[] }) {
  const [show, setShow] = useState(false);

  return (
    <div style={{ display: "flex", margin: "1em 0" }}>
      {list.slice(0, 1).map((item) => (
        <Gallery
          key={item.id}
          images={item.data.images.map(({ medium }) => medium)}
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
    private: false,
    agency: "",
    agencyType: "",
    estate: "TERRAIN",
    region: "",
    search: "",
    sortBy: Object.keys(SORT_BY)[0],
    limit: LIMIT[1],
    priceFrom: PRICE_LIST[1],
    priceTo: PRICE_LIST[4],
    areaFrom: AREA_LIST[1],
    areaTo: AREA_LIST[9],
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
    fetch(`/api/prop?limit=${filters.limit}`)
      .then((res) => res.json())
      .then((data) => setData(data));
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
            {} as Record<string, Item[]>,
          ),
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
                    0 === meta.dateCreated && {
                      dateCreated: new Date(data.dateCreated).getTime(),
                    },
                    0 === meta.dateCreatedFirst &&
                      data.dateCreatedFirst && {
                        dateCreatedFirst: new Date(
                          data.dateCreatedFirst,
                        ).getTime(),
                      },
                    0 === meta.totalPrice &&
                      data.totalPrice && {
                        totalPrice: data.totalPrice.value,
                      },
                    0 === meta.pricePerSquareMeter &&
                      data.pricePerSquareMeter && {
                        pricePerSquareMeter: data.pricePerSquareMeter.value,
                      },
                    0 === meta.areaInSquareMeters &&
                      data.areaInSquareMeters && {
                        areaInSquareMeters: data.areaInSquareMeters,
                      },
                    0 === meta.terrainAreaInSquareMeters && {
                      terrainAreaInSquareMeters:
                        data.terrainAreaInSquareMeters ||
                        data.areaInSquareMeters,
                    },
                  ),
                {
                  dateCreated: 0,
                  dateCreatedFirst: 0,
                  totalPrice: 0,
                  pricePerSquareMeter: 0,
                  areaInSquareMeters: 0,
                  terrainAreaInSquareMeters: 0,
                },
              ),
            ] as [string, Item[], Meta],
        )
        .sort(
          (a, b) =>
            (["totalPrice", "pricePerSquareMeter"].includes(filters.sortBy)
              ? -1
              : 1) *
            (b[2][filters.sortBy as keyof typeof SORT_BY] -
              a[2][filters.sortBy as keyof typeof SORT_BY]),
        ),
    [data, filters.sortBy],
  );

  const filtered = useMemo(
    () =>
      grouped.filter(
        ([id, [{ data }], meta]) =>
          (queries.search === "" ||
            queries.search === id ||
            data.locationLabel?.value?.toLowerCase().includes(queries.search) ||
            data.title?.toLowerCase().includes(queries.search)) &&
          [data.agency?.name, ""].includes(queries.agency) &&
          [data.agency?.type, ""].includes(queries.agencyType) &&
          [data.estate, ""].includes(queries.estate) &&
          [data.location.address.city.name, ""].includes(queries.region) &&
          (data.isPrivateOwner || !queries.private) &&
          (queries.areaTo === PRICE_LIST[0] ||
            (meta.terrainAreaInSquareMeters
              ? queries.areaFrom <= meta.terrainAreaInSquareMeters &&
                meta.terrainAreaInSquareMeters <= queries.areaTo
              : true)) &&
          (queries.priceTo === PRICE_LIST[0] ||
            (data.totalPrice
              ? queries.priceFrom <= data.totalPrice.value &&
                data.totalPrice.value <= queries.priceTo
              : true)),
      ),
    [queries, grouped],
  );

  const options = useMemo(
    () =>
      Object.entries(
        (data ? data.result : []).reduce(
          (options, { data }) =>
            Object.assign(options, {
              agency: Object.assign(
                options.agency || {},
                data.agency && {
                  [data.agency.name]: true,
                },
              ),
              agencyType: Object.assign(
                options.agencyType || {},
                data.agency && {
                  [data.agency.type]: true,
                },
              ),
              estate: Object.assign(options.estate || {}, {
                [data.estate]: true,
              }),
              region: Object.assign(options.region || {}, {
                [data.location.address.city.name]: true,
              }),
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
    [data],
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
