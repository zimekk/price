import {
  type ChangeEventHandler,
  type Dispatch,
  type SetStateAction,
  useCallback,
  useMemo,
} from "react";
import { Input, Picker, Range } from "@acme/components";

export interface FiltersState {
  country: string;
  fuel: string;
  gearbox: string;
  make: string;
  search: string;
  limit: number;
  mileageFrom: number;
  mileageTo: number;
  priceFrom: number;
  priceTo: number;
  yearFrom: number;
  yearTo: number;
}

export interface OptionsState {
  country: string[];
  fuel: string[];
  gearbox: string[];
  make: string[];
  year: string[];
}

export const LIMIT = [...Array(10)].map((_value, index) => (index + 1) * 500);

export const MILEAGE_LIST = [
  0, 10_000, 20_000, 30_000, 50_000, 100_000, 200_000, 300_000,
] as const;

export const PRICE_LIST = [
  0, 30_000, 40_000, 50_000, 100_000, 200_000, 300_000, 400_000, 500_000,
  600_000,
] as const;

export function Filters({
  options,
  filters,
  setFilters,
}: {
  options: OptionsState;
  filters: FiltersState;
  setFilters: Dispatch<SetStateAction<FiltersState>>;
}) {
  const YEAR_LIST = useMemo(
    () => options.year.map(Number).sort(),
    [options.year]
  );

  return (
    <fieldset>
      <div>
        <Picker
          label="Make"
          options={[""].concat(options.make)}
          value={filters.make}
          onChange={useCallback(
            ({ target }) =>
              setFilters((filters) => ({
                ...filters,
                make: target.value,
              })),
            []
          )}
        />
        <Picker
          label="Fuel Type"
          options={[""].concat(options.fuel)}
          value={filters.fuel}
          onChange={useCallback(
            ({ target }) =>
              setFilters((filters) => ({
                ...filters,
                fuel: target.value,
              })),
            []
          )}
        />
        <Picker
          label="Gearbox"
          options={[""].concat(options.gearbox)}
          value={filters.gearbox}
          onChange={useCallback(
            ({ target }) =>
              setFilters((filters) => ({
                ...filters,
                gearbox: target.value,
              })),
            []
          )}
        />
        <Picker
          label="Country Origin"
          options={[""].concat(options.country)}
          value={filters.country}
          onChange={useCallback(
            ({ target }) =>
              setFilters((filters) => ({
                ...filters,
                country: target.value,
              })),
            []
          )}
        />
      </div>
      <div>
        <Range
          options={YEAR_LIST}
          labelFrom="Year From"
          labelTo="Year To"
          valueFrom={filters.yearFrom}
          valueTo={filters.yearTo}
          onChangeFrom={useCallback<ChangeEventHandler<HTMLInputElement>>(
            ({ target }) =>
              setFilters(({ yearTo, ...criteria }) =>
                ((yearFrom) => ({
                  ...criteria,
                  yearFrom,
                  yearTo: yearTo < yearFrom ? yearFrom : yearTo,
                }))(Number(target.value))
              ),
            []
          )}
          onChangeTo={useCallback<ChangeEventHandler<HTMLInputElement>>(
            ({ target }) =>
              setFilters(({ yearFrom, ...criteria }) =>
                ((yearTo) => ({
                  ...criteria,
                  yearFrom: yearTo > yearFrom ? yearFrom : yearTo,
                  yearTo,
                }))(Number(target.value))
              ),
            []
          )}
        />
        <span>{`${new Intl.NumberFormat().format(
          filters.yearFrom
        )} - ${new Intl.NumberFormat().format(filters.yearTo)}`}</span>
      </div>
      <div>
        <Range
          options={MILEAGE_LIST}
          labelFrom="Mileage From"
          labelTo="Mileage To"
          valueFrom={filters.mileageFrom}
          valueTo={filters.mileageTo}
          onChangeFrom={useCallback<ChangeEventHandler<HTMLInputElement>>(
            ({ target }) =>
              setFilters(({ mileageTo, ...criteria }) =>
                ((mileageFrom) => ({
                  ...criteria,
                  mileageFrom,
                  mileageTo: mileageTo < mileageFrom ? mileageFrom : mileageTo,
                }))(Number(target.value))
              ),
            []
          )}
          onChangeTo={useCallback<ChangeEventHandler<HTMLInputElement>>(
            ({ target }) =>
              setFilters(({ mileageFrom, ...criteria }) =>
                ((mileageTo) => ({
                  ...criteria,
                  mileageFrom:
                    mileageTo > mileageFrom ? mileageFrom : mileageTo,
                  mileageTo,
                }))(Number(target.value))
              ),
            []
          )}
        />
        <span>{`${new Intl.NumberFormat().format(
          filters.mileageFrom
        )} - ${new Intl.NumberFormat().format(filters.mileageTo)} km`}</span>
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
        )} - ${new Intl.NumberFormat().format(filters.priceTo)} PLN`}</span>
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
