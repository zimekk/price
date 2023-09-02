import {
  type ChangeEventHandler,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Subject, debounceTime, distinctUntilChanged, map } from "rxjs";
import { z } from "zod";
import { Loading, Map } from "@acme/components";
import { DataSchema, ItemSchema } from "../schema";

interface FiltersState {
  search: string;
  sortBy: string;
  limit: number;
}

type Item = z.infer<typeof ItemSchema>;

const LIMIT = [...Array(15)].map((_value, index) => (index + 1) * 500);

const SORT_BY = {
  id_ulicy: "id_ulicy",
  zespol: "zespol",
  nazwa_zespolu: "nazwa_zespolu",
  kierunek: "kierunek",
} as const;

function Picker({
  label,
  options = [],
  entries = [],
  value,
  onChange,
}: {
  label: ReactNode;
  options?: string[];
  entries?: [string, string][];
  value: string;
  onChange: ChangeEventHandler<HTMLSelectElement>;
}) {
  return (
    <label>
      <span>{label}</span>
      <select value={value} onChange={onChange}>
        {options.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
        {entries.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
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
        <Picker
          label="Limit"
          options={LIMIT.map(String)}
          value={String(filters.limit)}
          onChange={useCallback(
            ({ target }) =>
              setFilters((filters) => ({
                ...filters,
                limit: Number(target.value),
              })),
            []
          )}
        />
        <Picker
          label="Sort"
          entries={Object.entries(SORT_BY)}
          value={filters.sortBy}
          onChange={useCallback(
            ({ target }) =>
              setFilters((filters) => ({
                ...filters,
                sortBy: target.value,
              })),
            []
          )}
        />
      </div>
    </fieldset>
  );
}

export function Price() {
  const [data, setData] = useState<{ result: Item[] } | null>(null);
  const [filters, setFilters] = useState<FiltersState>(() => ({
    search: "",
    sortBy: Object.keys(SORT_BY)[2],
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
    fetch(`/api/road?limit=${filters.limit}`)
      .then((res) => res.json())
      .then((data) => setData(DataSchema.parse(data)));
  }, [filters.limit]);

  const grouped = useMemo(
    () =>
      (data ? data.result : []).sort((a, b) =>
        a[filters.sortBy as keyof typeof SORT_BY].localeCompare(
          b[filters.sortBy as keyof typeof SORT_BY]
        )
      ),
    [data, filters.sortBy]
  );

  const filtered = useMemo(
    () =>
      grouped.filter(
        ({ nazwa_zespolu, kierunek }) =>
          queries.search === "" ||
          nazwa_zespolu.toLowerCase().includes(queries.search) ||
          kierunek.toLowerCase().includes(queries.search)
      ),
    [queries, grouped]
  );

  if (data === null) return <Loading />;
  console.log({ result: data.result, filters, filtered });
  return (
    <section>
      <Map
        points={filtered.map(
          ({
            zespol,
            nazwa_zespolu,
            slupek,
            kierunek,
            dlug_geo,
            szer_geo,
          }) => ({
            id: zespol,
            tooltip: `${nazwa_zespolu} ${slupek} \u2192 ${kierunek}`,
            position: [Number(szer_geo), Number(dlug_geo)],
          })
        )}
      />
      <Filters filters={filters} setFilters={setFilters} />
      <small>
        {filtered.length === grouped.length
          ? `Showing all of ${grouped.length}`
          : `Found ${filtered.length} items out of a total of ${grouped.length}`}
      </small>
      <table>
        <tbody>
          {filtered.map(
            (
              {
                zespol,
                id_ulicy,
                slupek,
                nazwa_zespolu,
                kierunek,
                obowiazuje_od,
              },
              key
            ) => (
              <tr key={key}>
                <td>{zespol}</td>
                <td>{id_ulicy}</td>
                <td>{slupek}</td>
                <td>{nazwa_zespolu}</td>
                <td>&#8594; {kierunek}</td>
                <td>{obowiazuje_od}</td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </section>
  );
}
