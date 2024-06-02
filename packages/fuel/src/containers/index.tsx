import {
  type ChangeEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import cx from "clsx";
import dayjs from "dayjs";
import { Subject, debounceTime, distinctUntilChanged, map } from "rxjs";
import { z } from "zod";
import { Loading, LocationLink } from "@acme/components";
import Calculator, { useFilters } from "./Calculator";
import { type FiltersState, type OptionsState, Filters } from "./Filters";
import { TYPES, ItemSchema } from "../schema";
import styles from "./styles.module.scss";

type Item = z.infer<typeof ItemSchema>;

function getLocationLink(location: string, zoom = 0) {
  return `//www.google.com/maps?t=k&q=${encodeURIComponent(location)}&hl=pl${
    zoom ? `&z=${zoom}` : ""
  }`;
}

enum Compare {
  LT = "LT",
  GT = "GT",
  EQ = "EQ",
}

const compare = (list: Item[], i: number, t: (typeof TYPES)[number]) => {
  if (list[i + 1] && list[i + 1].data.petrol_list[t]) {
    const a = list[i].data.petrol_list[t];
    const b = list[i + 1].data.petrol_list[t];
    return a === b ? Compare.EQ : a > b ? Compare.GT : Compare.LT;
  }
  return null;
};

function PriceItem({
  list,
  type,
  index,
  setValue,
}: {
  list: Item[];
  type: (typeof TYPES)[number];
  index: number;
  setValue: (value: number) => void;
}) {
  const item = list[index];
  const handleClick = useCallback(
    () => item.data.petrol_list[type] && setValue(item.data.petrol_list[type]),
    [],
  );

  return (
    item.data.petrol_list[type] && (
      <a
        href="#"
        onClick={handleClick}
        className={cx(
          styles.Price,
          ((type) =>
            type &&
            {
              [Compare.GT]: styles.gt,
              [Compare.LT]: styles.lt,
              [Compare.EQ]: styles.eq,
            }[type])(compare(list, index, type)),
        )}
      >
        {item.data.petrol_list[type]}
      </a>
    )
  );
}

export function Price() {
  const [expanded, setExpanded] = useState<string[]>([]);
  const [data, setData] = useState<{ result: Item[] } | null>(null);
  const [filters, setFilters] = useState<FiltersState>(() => ({
    network: "",
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
    fetch("/api/fuel")
      .then((res) => res.json())
      .then(setData);
  }, []);

  const grouped = useMemo(
    () =>
      Object.entries(
        (data ? data.result : [])
          .filter((item) => Object.keys(item.data.petrol_list).length > 0)
          .sort((a, b) => b.created.localeCompare(a.created))
          .map((item) => ({
            ...item,
            data: Object.assign(
              {},
              item.data,
              item.data.map_img
                ? {
                    map_img: new URL(
                      item.data.map_img,
                      new URL(item.data.url),
                    ).toString(),
                  }
                : {},
            ),
          }))
          .reduce(
            (list, item) =>
              Object.assign(list, {
                [item.data.station_id]: (
                  list[item.data.station_id] || []
                ).concat(item),
              }),
            {} as Record<string, Item[]>,
          ),
      ).sort(([, a], [, b]) => b[0].created.localeCompare(a[0].created)),
    [data],
  );

  const filtered = useMemo(
    () =>
      grouped.filter(
        ([id, [{ data }]]) =>
          (queries.search === "" ||
            queries.search === id ||
            data.address?.toLowerCase().includes(queries.search)) &&
          [data.network_name, ""].includes(queries.network),
      ),
    [queries, grouped],
  );

  const options = useMemo(
    () =>
      Object.entries(
        (data ? data.result : []).reduce(
          (options, { data }) =>
            Object.assign(options, {
              network: Object.assign(options.network || {}, {
                [data.network_name]: data.network_name,
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

  const handleExpand = useCallback<ChangeEventHandler<HTMLInputElement>>(
    ({ target }) =>
      setExpanded((expanded) =>
        !target.checked
          ? expanded.filter((id) => id !== target.value)
          : expanded.concat(target.value),
      ),
    [],
  );

  const [filters2, setFilters2] = useFilters();
  const setPrice = (price: number) =>
    setFilters2((filters) => ({ ...filters, price }));

  if (data === null) return <Loading />;
  console.log({ filters, filtered });
  return (
    <section>
      <Calculator filters={filters2} setFilters={setFilters2} />
      <Filters options={options} filters={filters} setFilters={setFilters} />
      <table className={styles.Table}>
        <thead>
          <tr>
            <th style={{ width: 20 }}></th>
            <th style={{ width: 265 }}>station</th>
            {TYPES.map((type) => (
              <th key={type}>{type}</th>
            ))}
            <th style={{ width: 160 }}>updated</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(([station_id, list]) => {
            const expandedList = expanded.includes(station_id)
              ? list
              : list.slice(0, 1);
            const rowSpan =
              expandedList.length > 1 ? expandedList.length : undefined;
            return expandedList.map((item, key) => (
              <tr key={`${station_id}-${key}`}>
                {key === 0 && (
                  <td rowSpan={rowSpan}>
                    <label>
                      <input
                        type="checkbox"
                        value={station_id}
                        checked={expanded.includes(station_id)}
                        onChange={handleExpand}
                      />
                    </label>
                  </td>
                )}
                {key === 0 && (
                  <td rowSpan={rowSpan}>
                    <div
                      style={{
                        display: "flex",
                      }}
                    >
                      {item.data.map_img && (
                        <div>
                          <img
                            src={item.data.map_img}
                            alt={item.data.network_name}
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      <div>
                        <div>{item.data.network_name}</div>
                        <div style={{ fontSize: "xx-small" }}>
                          <LocationLink
                            href={getLocationLink(item.data.address)}
                          >
                            <i>
                              {item.data.address} ({item.data.station_id})
                            </i>
                          </LocationLink>
                        </div>
                      </div>
                    </div>
                  </td>
                )}
                {TYPES.map((type) => (
                  <td key={type} align="right">
                    <PriceItem
                      list={list}
                      index={key}
                      type={type}
                      setValue={setPrice}
                    />
                  </td>
                ))}
                <td
                  className={cx(
                    styles.Date,
                    new Date(item.created).getDay() === 0 && styles.sunday,
                  )}
                >
                  {dayjs(item.created).format("ddd, MMM D, YYYY H:mm")}
                </td>
              </tr>
            ));
          })}
        </tbody>
      </table>
    </section>
  );
}
