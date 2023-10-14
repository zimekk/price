import {
  type ChangeEventHandler,
  type Dispatch,
  type SetStateAction,
  useCallback,
} from "react";
import { Input, Picker, Range } from "@acme/components";

export interface FiltersState {
  availability: string;
  brand: string;
  model: string;
  dealer: string;
  search: string;
  limit: number;
  priceFrom: number;
  priceTo: number;
}

export interface OptionsState {
  brand: string[];
  model: string[];
  dealer: string[];
}

export const LIMIT = [...Array(10)].map((_value, index) => (index + 1) * 100);

export const PRICE_LIST = [
  0, 100_000, 200_000, 300_000, 400_000, 500_000, 600_000,
] as const;

export const TYPE = ["AVAILABLE", "RESERVED_MANUAL", "SOLD"] as const;

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
          label="Availability"
          options={[""].concat(TYPE)}
          value={filters.availability}
          onChange={useCallback(
            ({ target }) =>
              setFilters((filters) => ({
                ...filters,
                availability: target.value,
              })),
            []
          )}
        />
        <Picker
          label="Dealer"
          options={[""].concat(options.dealer)}
          value={filters.dealer}
          onChange={useCallback(
            ({ target }) =>
              setFilters((filters) => ({
                ...filters,
                dealer: target.value,
              })),
            []
          )}
        />
      </div>
      <div>
        <Picker
          label="Brand"
          options={[""].concat(options.brand)}
          value={filters.brand}
          onChange={useCallback(
            ({ target }) =>
              setFilters((filters) => ({
                ...filters,
                brand: target.value,
              })),
            []
          )}
        />
        <Picker
          label="Model"
          options={[""].concat(options.model)}
          value={filters.model}
          onChange={useCallback(
            ({ target }) =>
              setFilters((filters) => ({
                ...filters,
                model: target.value,
              })),
            []
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
          type="search"
          label="Search"
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
