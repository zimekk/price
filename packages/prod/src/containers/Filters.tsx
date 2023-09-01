import {
  type ChangeEventHandler,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useId,
} from "react";

export interface FiltersState {
  brand: string;
  group: string;
  search: string;
  sortBy: string;
  limit: number;
  priceFrom: number;
  priceTo: number;
}

export interface OptionsState {
  brand: string[];
  group: string[];
}

export const LIMIT = [...Array(19)].map((_value, index) => (index + 1) * 500);

export const PRICE_LIST = [
  0, 100, 200, 500, 1_000, 2_000, 5_000, 10_000, 15_000,
] as const;

export const SORT_BY = {
  price: "Cena",
  priceChanged: "Data zmiany ceny",
  minPrice: "Najniższa cena",
  minPriceChanged: "Data najniższej ceny",
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

function Range({
  options,
  labelFrom,
  labelTo,
  valueFrom,
  valueTo,
  onChangeFrom,
  onChangeTo,
}: {
  options: readonly number[];
  labelFrom: ReactNode;
  labelTo: ReactNode;
  valueFrom: string | number;
  valueTo: string | number;
  onChangeFrom: ChangeEventHandler<HTMLInputElement>;
  onChangeTo: ChangeEventHandler<HTMLInputElement>;
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
          value={valueFrom}
          onChange={onChangeFrom}
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
          value={valueTo}
          onChange={onChangeTo}
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
        )} - ${new Intl.NumberFormat().format(filters.priceTo)} PLN`}</span>
      </div>
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
          label="Sort"
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
