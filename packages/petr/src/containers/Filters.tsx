import {
  type ChangeEventHandler,
  type Dispatch,
  type SetStateAction,
  useCallback,
} from "react";
import { Input, Picker, Range } from "@acme/components";

export const SORT_BY = {
  priceChanged: "Data zmiany ceny",
  minPriceChanged: "Data najniższej ceny",
} as const;

export interface FiltersState {
  category: string;
  search: string;
  sortBy: string;
  limit: number;
  priceFrom: number;
  priceTo: number;
}

export interface OptionsState {
  category: string[];
}

export const LIMIT = [...Array(5)].map((_value, index) => (index + 1) * 500);

export const PRICE_LIST = [0, 500, 1000, 2000, 3000, 5000, 8000] as const;

export const INITIAL_FILTERS: FiltersState = {
  category: "",
  search: "",
  sortBy: Object.keys(SORT_BY)[0],
  limit: LIMIT[0],
  priceFrom: PRICE_LIST[0],
  priceTo: PRICE_LIST[PRICE_LIST.length - 1],
};

export function Filters({
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
        <Picker
          label="Category"
          options={[""].concat(options.category)}
          value={filters.category}
          onChange={useCallback(
            ({ target }) =>
              setFilters((filters) => ({
                ...filters,
                category: target.value,
              })),
            [],
          )}
        />
      </div>
      <div>
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
                }))(Number(target.value)),
              ),
            [],
          )}
          onChangeTo={useCallback<ChangeEventHandler<HTMLInputElement>>(
            ({ target }) =>
              setFilters(({ priceFrom, ...criteria }) =>
                ((priceTo) => ({
                  ...criteria,
                  priceFrom: priceTo > priceFrom ? priceFrom : priceTo,
                  priceTo,
                }))(Number(target.value)),
              ),
            [],
          )}
        />
        <span>{`${new Intl.NumberFormat().format(
          filters.priceFrom,
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
            [],
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
            [],
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
            [],
          )}
        />
      </div>
    </fieldset>
  );
}
