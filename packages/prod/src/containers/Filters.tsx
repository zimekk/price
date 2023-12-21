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
import { Input, Picker, Range } from "@acme/components";

export const LIMIT = [...Array(20)].map((_value, index) => (index + 1) * 1000);

export const PRICE_LIST = [
  0, 100, 200, 500, 1_000, 2_000, 5_000, 10_000, 15_000,
];

export const SORT_BY = {
  price: "Cena",
  priceChanged: "Data zmiany ceny",
  minPrice: "Najniższa cena",
  minPriceChanged: "Data najniższej ceny",
} as const;

const INITIAL_FILTERS = {
  brand: "",
  group: "",
  search: "",
  sortBy: Object.keys(SORT_BY)[3],
  limit: LIMIT[3],
  priceFrom: PRICE_LIST[0],
  priceTo: PRICE_LIST[PRICE_LIST.length - 2],
};

export type FiltersState = typeof INITIAL_FILTERS;

export interface OptionsState {
  brand: string[];
  group: string[];
}

export const stringifyFilters = ({ search, ...filters }: FiltersState) =>
  JSON.stringify({
    ...filters,
    search: search.toLowerCase().trim(),
  });

export const initialQueries = () =>
  JSON.parse(stringifyFilters(INITIAL_FILTERS));

export function Filters({
  options,
  setQueries,
}: {
  options: OptionsState;
  setQueries: Dispatch<SetStateAction<FiltersState>>;
}) {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const search$ = useMemo(() => new Subject<any>(), []);

  useEffect(() => {
    const subscription = search$
      .pipe(map(stringifyFilters), distinctUntilChanged(), debounceTime(400))
      .subscribe((filters) =>
        setQueries((queries) => ({ ...queries, ...JSON.parse(filters) }))
      );
    return () => subscription.unsubscribe();
  }, [search$]);

  useEffect(() => {
    search$.next(filters);
  }, [filters]);

  return (
    <fieldset>
      <div>
        <Picker
          label="Brand"
          options={[""].concat(options.brand)}
          value={String(filters.brand)}
          onChange={useCallback(
            ({ target }) =>
              setFilters((filters) => ({
                ...filters,
                brand: target.value,
              })),
            []
          )}
        />
        <Range
          options={PRICE_LIST}
          labelFrom="Price From"
          labelTo="Price To"
          valueFrom={filters.priceFrom}
          valueTo={filters.priceTo}
          onChangeFrom={useCallback<ChangeEventHandler<HTMLInputElement>>(
            ({ target }) =>
              setFilters(({ priceTo, ...criteria }) =>
                ((priceFrom) => ({
                  ...criteria,
                  priceFrom,
                  priceTo: priceTo < priceFrom ? priceFrom : priceTo,
                }))(Number(target.value))
              ),
            []
          )}
          onChangeTo={useCallback<ChangeEventHandler<HTMLInputElement>>(
            ({ target }) =>
              setFilters(({ priceFrom, ...criteria }) =>
                ((priceTo) => ({
                  ...criteria,
                  priceFrom: priceTo > priceFrom ? priceFrom : priceTo,
                  priceTo,
                }))(Number(target.value))
              ),
            []
          )}
        />
        <span>{`${new Intl.NumberFormat().format(
          filters.priceFrom
        )} - ${new Intl.NumberFormat().format(filters.priceTo)} zł`}</span>
      </div>
      <div>
        <Input
          label="Search"
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
      </div>
    </fieldset>
  );
}
