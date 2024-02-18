import {
  type ChangeEventHandler,
  type Dispatch,
  type SetStateAction,
  useCallback,
} from "react";
import { Input, Picker, Range } from "@acme/components";

export const SORT_BY = {
  dateCreated: "Data aktualizacji",
  dateCreatedFirst: "Data utworzenia",
  totalPrice: "Cena",
  // pricePerSquareMeter: "Cena za m2",
  // areaInSquareMeters: "Powierzchnia",
  // terrainAreaInSquareMeters: "Powierzchnia działki",
} as const;

export const TYPE = {
  SALE: "Sprzedaż",
  RENT: "Wynajem",
} as const;

export interface FiltersState {
  type: keyof typeof TYPE;
  search: string;
  sortBy: string;
  limit: number;
  priceFrom: number;
  priceTo: number;
  areaFrom: number;
  areaTo: number;
}

export const LIMIT = [...Array(5)].map((_value, index) => (index + 1) * 500);

export const AREA_LIST = [
  0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200,
] as const;

export const RENT_PRICE_LIST = [
  0, 500, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000,
] as const;

export const SALE_PRICE_LIST = [
  0, 250000, 500000, 750000, 1000000, 1250000, 1500000,
] as const;

export const INITIAL_FILTERS: FiltersState = {
  type: "SALE",
  search: "",
  sortBy: Object.keys(SORT_BY)[0],
  limit: LIMIT[0],
  priceFrom: SALE_PRICE_LIST[1],
  priceTo: SALE_PRICE_LIST[4],
  areaFrom: AREA_LIST[1],
  areaTo: AREA_LIST[9],
};

export function Filters({
  filters,
  setFilters,
}: {
  filters: FiltersState;
  setFilters: Dispatch<SetStateAction<FiltersState>>;
}) {
  return (
    <fieldset>
      <div>
        <Picker
          label="Type"
          entries={Object.entries(TYPE)}
          value={filters.type}
          onChange={useCallback(
            ({ target }) =>
              setFilters((filters) =>
                ((type) => ({
                  ...filters,
                  type,
                  priceFrom:
                    type === "SALE" ? SALE_PRICE_LIST[1] : RENT_PRICE_LIST[1],
                  priceTo:
                    type === "SALE" ? SALE_PRICE_LIST[6] : RENT_PRICE_LIST[4],
                }))(target.value as FiltersState["type"]),
              ),
            [],
          )}
        />
      </div>
      <div>
        <Range
          options={AREA_LIST}
          labelFrom="Area From"
          labelTo="Area To"
          valueFrom={filters.areaFrom}
          valueTo={filters.areaTo}
          onChangeFrom={useCallback<ChangeEventHandler<HTMLInputElement>>(
            ({ target }) =>
              setFilters(({ areaTo, ...criteria }) =>
                ((areaFrom) => ({
                  ...criteria,
                  areaFrom,
                  areaTo: areaTo < areaFrom ? areaFrom : areaTo,
                }))(Number(target.value)),
              ),
            [],
          )}
          onChangeTo={useCallback<ChangeEventHandler<HTMLInputElement>>(
            ({ target }) =>
              setFilters(({ areaFrom, ...criteria }) =>
                ((areaTo) => ({
                  ...criteria,
                  areaFrom: areaTo > areaFrom ? areaFrom : areaTo,
                  areaTo,
                }))(Number(target.value)),
              ),
            [],
          )}
        />
        <span>{`${filters.areaFrom} - ${filters.areaTo}`} m&sup2;</span>
      </div>
      <div>
        <Range
          options={filters.type === "SALE" ? SALE_PRICE_LIST : RENT_PRICE_LIST}
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
