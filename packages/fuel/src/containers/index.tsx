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
import { Loading, LocationLink } from "@acme/components";
import { TYPES, ItemSchema } from "../schema";

interface FiltersState {
  search: string;
}

type Item = z.infer<typeof ItemSchema>;

function getLocationLink(location: string, zoom = 0) {
  return `//www.google.com/maps?t=k&q=${encodeURIComponent(location)}&hl=pl${
    zoom ? `&z=${zoom}` : ""
  }`;
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
    fetch("/api/fuel")
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
        .filter((item) => item.data.petrol_list.length > 0)
        .sort((a, b) => b.created.localeCompare(a.created))
        .map((item) => ({
          ...item,
          data: Object.assign(
            {
              ...item.data,
              petrol_list: item.data.petrol_list.reduce(
                (petrol_list, { type, price }) =>
                  Object.assign(petrol_list, { [type]: price }),
                {} as Record<(typeof TYPES)[number], number>
              ),
            },
            item.data.map_img
              ? {
                  map_img: new URL(
                    item.data.map_img,
                    new URL(item.data.url)
                  ).toString(),
                }
              : {}
          ),
        })),
    [data]
  );

  const filtered = useMemo(() => grouped, [grouped]);

  if (data === null) return <Loading />;
  console.log({ filters, filtered });
  return (
    <section>
      <Filters filters={filters} setFilters={setFilters} />
      <table>
        <thead>
          <tr>
            <th>station</th>
            {TYPES.map((type) => (
              <th key={type}>{type}</th>
            ))}
            <th>updated</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(
            ({
              id,
              created,
              data: { address, map_img, network_name, petrol_list },
            }) => (
              <tr key={id}>
                <td>
                  <div
                    style={{
                      display: "flex",
                    }}
                  >
                    {map_img && (
                      <div>
                        <img
                          src={map_img}
                          alt={network_name}
                          referrerPolicy="no-referrer"
                          style={{
                            width: 20,
                            float: "left",
                            marginRight: "0.5em",
                            marginTop: "-0.5em",
                            position: "relative",
                            top: 12,
                          }}
                        />
                      </div>
                    )}
                    <div>
                      <div>{network_name}</div>
                      <div style={{ fontSize: "small" }}>
                        <LocationLink href={getLocationLink(address)}>
                          <i>{address}</i>
                        </LocationLink>
                      </div>
                    </div>
                  </div>
                </td>
                {TYPES.map((type) => (
                  <td key={type}>{petrol_list[type]}</td>
                ))}
                <td>{dayjs(created).format("MMM D, YYYY H:mm")}</td>
              </tr>
            )
            // ))
          )}
        </tbody>
      </table>
    </section>
  );
}
