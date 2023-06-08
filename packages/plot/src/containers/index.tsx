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

interface FiltersState {
  search: string;
}

function Loading() {
  return <div>Loading...</div>;
}

export const DataSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  category: z.object({
    id: z.number(),
    type: z.string(),
    itemType: z.string(),
  }),
  map: z.object({
    zoom: z.number(),
    lat: z.number(),
    lon: z.number(),
    radius: z.number(),
    show_detailed: z.boolean(),
  }),
  isBusiness: z.boolean(),
  url: z.string(),
  isHighlighted: z.boolean(),
  isPromoted: z.boolean(),
  promotion: z.object({
    highlighted: z.boolean(),
    urgent: z.boolean(),
    top_ad: z.boolean(),
    options: z.string().array(),
    b2c_ad_page: z.boolean(),
    premium_ad_page: z.boolean(),
  }),
  delivery: z.object({
    rock: z.object({
      offer_id: z.null(),
      active: z.boolean(),
      mode: z.string(),
    }),
  }),
  createdTime: z.string(),
  lastRefreshTime: z.string(),
  validToTime: z.string(),
  isActive: z.boolean(),
  status: z.string(),
  params: z
    .object({
      key: z.string(),
      name: z.string(),
      type: z.string(),
      value: z.string(),
      normalizedValue: z.string(),
    })
    .array(),
  itemCondition: z.string(),
  price: z.object({
    budget: z.boolean(),
    free: z.boolean(),
    exchange: z.boolean(),
    displayValue: z.string(),
    regularPrice: z.object({
      value: z.number(),
      currencyCode: z.string(),
      currencySymbol: z.string(),
      negotiable: z.boolean(),
      priceFormatConfig: z.object({
        decimalSeparator: z.string(),
        thousandsSeparator: z.string(),
      }),
    }),
  }),
  salary: z.null(),
  partner: z.object({ code: z.string() }),
  isJob: z.boolean(),
  photos: z.string().array(),
  photosSet: z.string().array(),
  location: z.object({
    cityName: z.string(),
    cityId: z.number(),
    cityNormalizedName: z.string(),
    regionName: z.string(),
    regionId: z.number(),
    regionNormalizedName: z.string(),
    districtName: z.string().nullable(),
    districtId: z.number(),
    pathName: z.string(),
  }),
  urlPath: z.string(),
  contact: z.object({
    chat: z.boolean(),
    courier: z.boolean(),
    name: z.string(),
    negotiation: z.boolean(),
    phone: z.boolean(),
  }),
  user: z.object({
    id: z.number(),
    name: z.string(),
    photo: z.string().nullable(),
    logo: z.string().nullable(),
    otherAdsEnabled: z.boolean(),
    socialNetworkAccountType: z.string().nullable(),
    isOnline: z.boolean(),
    lastSeen: z.string(),
    about: z.string(),
    bannerDesktopURL: z.string(),
    logo_ad_page: z.string().nullable(),
    company_name: z.string(),
    created: z.string(),
    sellerType: z.null(),
    uuid: z.string(),
  }),
  shop: z.object({ subdomain: z.string().nullable() }),
  safedeal: z.object({
    weight: z.number(),
    weight_grams: z.number(),
    status: z.string(),
    safedeal_blocked: z.boolean(),
    allowed_quantity: z.unknown().array(),
  }),
  searchReason: z.string(),
  isNewFavouriteAd: z.boolean(),
});

const ItemSchema = z.object({
  id: z.number(),
  json: DataSchema,
});

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
    <div style={{ marginRight: "1em" }}>
      {Object.values(data.photos)
        .slice(0, 1)
        .map((url, key) => (
          <img key={key} src={url} width="200" referrerPolicy="no-referrer" />
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
      <div style={{ flexGrow: 1 }}>
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
        .map(({ id, json: data }) => ({ id: String(id), data }))
        .sort((a, b) => b.data.createdTime.localeCompare(a.data.createdTime)),
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
