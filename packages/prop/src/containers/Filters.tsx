import {
  type ChangeEventHandler,
  type Dispatch,
  type SetStateAction,
  useCallback,
} from "react";
import { Input, Picker, Range } from "@acme/components";

export interface FiltersState {
  private: boolean;
  agency: string;
  agencyType: string;
  estate: string;
  region: string;
  search: string;
  sortBy: string;
  limit: number;
  priceFrom: number;
  priceTo: number;
  areaFrom: number;
  areaTo: number;
}

export interface OptionsState {
  agency: string[];
  agencyType: string[];
  estate: string[];
  region: string[];
}

export const LIMIT = [...Array(10)].map((_value, index) => (index + 1) * 500);

export const AREA_LIST = [
  0, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000, 3000, 5000,
] as const;

export const PRICE_LIST = [
  0, 200000, 400000, 600000, 800000, 1000000, 1500000, 2000000, 2500000,
  3000000, 4000000, 5000000,
] as const;

export const SORT_BY = {
  dateCreated: "Data aktualizacji",
  dateCreatedFirst: "Data utworzenia",
  totalPrice: "Cena",
  pricePerSquareMeter: "Cena za m2",
  areaInSquareMeters: "Powierzchnia",
  terrainAreaInSquareMeters: "Powierzchnia działki",
} as const;

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
          label="Agency"
          options={[""].concat(options.agency)}
          value={filters.agency}
          onChange={useCallback(
            ({ target }) =>
              setFilters((filters) => ({
                ...filters,
                agency: target.value,
              })),
            []
          )}
        />
      </div>
      <div>
        <Picker
          label="Estate"
          options={[""].concat(options.estate)}
          value={filters.estate}
          onChange={useCallback(
            ({ target }) =>
              setFilters((filters) => ({
                ...filters,
                estate: target.value,
              })),
            []
          )}
        />
        <Picker
          label="Region"
          options={[""].concat(options.region)}
          value={filters.region}
          onChange={useCallback(
            ({ target }) =>
              setFilters((filters) => ({
                ...filters,
                region: target.value,
              })),
            []
          )}
        />
        <Picker
          label="Type"
          options={[""].concat(options.agencyType)}
          value={filters.agencyType}
          onChange={useCallback(
            ({ target }) =>
              setFilters((filters) => ({
                ...filters,
                agencyType: target.value,
              })),
            []
          )}
        />
        <label>
          <span>Private owner</span>{" "}
          <input
            type="checkbox"
            checked={filters.private}
            onChange={useCallback<ChangeEventHandler<HTMLInputElement>>(
              ({ target }) =>
                setFilters((filters) => ({
                  ...filters,
                  private: target.checked,
                })),
              []
            )}
          />
        </label>
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
                }))(Number(target.value))
              ),
            []
          )}
          onChangeTo={useCallback<ChangeEventHandler<HTMLInputElement>>(
            ({ target }) =>
              setFilters(({ areaFrom, ...criteria }) =>
                ((areaTo) => ({
                  ...criteria,
                  areaFrom: areaTo > areaFrom ? areaFrom : areaTo,
                  areaTo,
                }))(Number(target.value))
              ),
            []
          )}
        />
        <span>{`${filters.areaFrom} - ${filters.areaTo}`} m&sup2;</span>
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
