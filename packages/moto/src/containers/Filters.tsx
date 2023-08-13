import {
  type ChangeEventHandler,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useId,
} from "react";

export interface FiltersState {
  country: string;
  fuel: string;
  make: string;
  search: string;
  limit: number;
  priceFrom: number;
  priceTo: number;
}

export interface OptionsState {
  country: string[];
  fuel: string[];
  make: string[];
}

export const LIMIT = [...Array(10)].map((_value, index) => (index + 1) * 500);

export const PRICE_LIST = [
  0, 30_000, 40_000, 50_000, 100_000, 200_000, 300_000, 400_000, 500_000,
  600_000,
] as const;

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

function Range({
  labelFrom,
  labelTo,
  options,
  filters,
  setFilters,
}: {
  labelFrom: ReactNode;
  labelTo: ReactNode;
  options: readonly number[];
  filters: FiltersState;
  setFilters: Dispatch<SetStateAction<FiltersState>>;
}) {
  const id = useId();
  return (
    <>
      <label>
        <span>{labelFrom}</span>
        <input
          type="range"
          list={id}
          min={options[0]}
          max={options[options.length - 1]}
          value={filters.priceFrom}
          onChange={useCallback<ChangeEventHandler<HTMLInputElement>>(
            ({ target }) =>
              setFilters(({ priceTo, ...criteria }) => {
                const priceFrom = Number(target.value);
                return {
                  ...criteria,
                  priceFrom,
                  priceTo: priceTo < priceFrom ? priceFrom : priceTo,
                };
              }),
            []
          )}
        />
        <datalist id={id}>
          {options.map((value) => (
            <option key={value} value={value}></option>
          ))}
        </datalist>
      </label>
      <label>
        <span>{labelTo}</span>
        <input
          type="range"
          list={id}
          min={options[0]}
          max={options[options.length - 1]}
          value={filters.priceTo}
          onChange={useCallback<ChangeEventHandler<HTMLInputElement>>(
            ({ target }) =>
              setFilters(({ priceFrom, ...criteria }) => {
                const priceTo = Number(target.value);
                return {
                  ...criteria,
                  priceFrom: priceTo > priceFrom ? priceFrom : priceTo,
                  priceTo,
                };
              }),
            []
          )}
        />
      </label>
    </>
  );
}

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
          labelFrom="Price From"
          labelTo="Price To"
          options={PRICE_LIST}
          filters={filters}
          setFilters={setFilters}
        />
        <span>{`${new Intl.NumberFormat().format(
          filters.priceFrom
        )} - ${new Intl.NumberFormat().format(filters.priceTo)} PLN`}</span>
      </div>
      <div>
        {/* <label>
        <span>Brand</span>
        <select
          value={filters.brand}
          onChange={useCallback<ChangeEventHandler<HTMLSelectElement>>(
            ({ target }) =>
              setFilters((filters) => ({
                ...filters,
                brand: target.value,
              })),
            []
          )}
        >
          {[""].concat(options.brand).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Group</span>
        <select
          value={filters.group}
          onChange={useCallback<ChangeEventHandler<HTMLSelectElement>>(
            ({ target }) =>
              setFilters((filters) => ({
                ...filters,
                group: target.value,
              })),
            []
          )}
        >
          {[""].concat(options.group).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label> */}
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
      </div>
    </fieldset>
  );
}
