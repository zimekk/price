import {
  type ChangeEventHandler,
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Subject, debounceTime, distinctUntilChanged, map } from "rxjs";
import { z } from "zod";
import { Loading } from "@acme/components";
import { Chart } from "../components";
import { Calculator } from "./Calculator";
import { Installment } from "./Installment";

interface FiltersState {
  search: string;
}

export const RateSchema = z.object({
  code: z.string(),
  units: z.number(),
  buy: z.string(),
  sell: z.string(),
  spread: z.string(),
  date: z.string(),
  time: z.string(),
});

export const DataSchema = z.object({
  date: z.string(),
  rates: z.record(RateSchema.array()),
  range: z.object({ minRateDate: z.string(), maxRateDate: z.string() }),
});

const ItemSchema = z.object({
  id: z.number(),
  item: z.string(),
  data: DataSchema,
  created: z.string(),
  checked: z.string().nullable(),
});

type Item = z.infer<typeof ItemSchema>;

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
            [],
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
    fetch("/api/rate")
      .then((res) => res.json())
      .then((data) => {
        setData(
          z
            .object({
              result: ItemSchema.array(),
            })
            .parse(data),
        );
      });
  }, []);

  const grouped = useMemo(
    () =>
      (data ? data.result : [])
        .map(({ data }) => data)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [data],
  );

  const filtered = useMemo(() => grouped, [grouped]);

  const [date, setDate] = useState(() => "");
  const [value, setValue] = useState(() => 0);
  const rate = useMemo(
    () =>
      (grouped.length > 0 ? Object.values(grouped[0].rates)[0] : []).reduce(
        (result, { code, sell }) =>
          Object.assign(result, { [code]: Number(sell) }),
        {} as Record<"EUR" | "CHF", number>,
      ),
    [grouped],
  );

  useEffect(() => {
    if (grouped.length > 0) {
      setDate(grouped[0].date);
    }
  }, [grouped]);

  if (data === null) return <Loading />;
  console.log({ filters, filtered });
  return (
    <section>
      <Calculator rate={value || rate.EUR} />
      <Installment date={date} rate={value || rate.CHF} />
      <Chart
        data={filtered.flatMap(({ date, rates }) =>
          Object.entries(rates).map(([time, rates]) =>
            rates.reduce(
              (result, { code, buy }) =>
                Object.assign(result, { [code]: Number(buy) }),
              {
                x: new Date(date).getTime(),
              },
            ),
          ),
        )}
      />
      <Filters filters={filters} setFilters={setFilters} />
      <table>
        <tbody>
          {filtered.map(({ date, rates }) =>
            Object.entries(rates).map(([time, values]) => (
              <tr key={date}>
                <td>
                  {date} {time}
                </td>
                {values.map((item, key) => (
                  <td key={key}>
                    {item.code}{" "}
                    <a
                      href="#"
                      onClick={(e) => (
                        e.preventDefault(),
                        setValue(Number(item.sell)),
                        setDate(date)
                      )}
                    >
                      {item.sell}
                    </a>
                  </td>
                ))}
              </tr>
            )),
          )}
        </tbody>
      </table>
    </section>
  );
}
