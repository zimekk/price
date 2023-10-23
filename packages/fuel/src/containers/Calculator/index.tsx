import {
  type ChangeEventHandler,
  type Dispatch,
  type SetStateAction,
  useCallback,
  useState,
} from "react";
import styles from "./styles.module.scss";

export const CONSUMPTION_LIST = [5, 10, 15];
export const DISTANCE_LIST = [...Array(20)].map((_, index) => (index + 1) * 5);
export const PRICE_LIST = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
export const AMOUNT_LIST = [0, 10, 20, 30, 40, 50, 60, 70];

interface FiltersState {
  consumption: (typeof CONSUMPTION_LIST)[number];
  distance: (typeof DISTANCE_LIST)[number];
  price: (typeof PRICE_LIST)[number];
  amount: (typeof AMOUNT_LIST)[number];
  roundTrip: boolean;
}

export const useFilters = () =>
  useState<FiltersState>(() => ({
    consumption: 10,
    distance: 5,
    price: 6.5,
    amount: 50,
    roundTrip: true,
  }));

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
          <span>Price</span>
          <input
            type="range"
            list="price-list"
            min={PRICE_LIST[0]}
            max={PRICE_LIST[PRICE_LIST.length - 1]}
            value={String(filters.price)}
            onChange={useCallback<ChangeEventHandler<HTMLInputElement>>(
              ({ target }) =>
                setFilters((filters) => ({
                  ...filters,
                  price: Number(target.value),
                })),
              []
            )}
          />
          <datalist id="price-list">
            {PRICE_LIST.map((value) => (
              <option key={value} value={value}></option>
            ))}
          </datalist>
          <span>{`${filters.price} pln/l`}</span>
        </label>
        <label>
          <span>Amount</span>
          <input
            type="range"
            list="amount-list"
            min={AMOUNT_LIST[0]}
            max={AMOUNT_LIST[AMOUNT_LIST.length - 1]}
            value={String(filters.amount)}
            onChange={useCallback<ChangeEventHandler<HTMLInputElement>>(
              ({ target }) =>
                setFilters((filters) => ({
                  ...filters,
                  amount: Number(target.value),
                })),
              []
            )}
          />
          <datalist id="amount-list">
            {AMOUNT_LIST.map((value) => (
              <option key={value} value={value}></option>
            ))}
          </datalist>
          <span>{`${filters.amount} l`}</span>
        </label>
        <span>{`Fuel cost: ${new Intl.NumberFormat("pl-PL", {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        }).format(filters.price * filters.amount)} pln (${new Intl.NumberFormat(
          "pl-PL",
          {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          }
        ).format(
          filters.price * filters.amount +
            ((filters.roundTrip ? 2 : 1) *
              filters.price *
              filters.consumption *
              filters.distance) /
              100
        )} pln)`}</span>
      </div>
      <div>
        <label>
          <span>Distance</span>
          <input
            type="range"
            list="distance-list"
            min={DISTANCE_LIST[0]}
            max={DISTANCE_LIST[DISTANCE_LIST.length - 1]}
            value={String(filters.distance)}
            onChange={useCallback<ChangeEventHandler<HTMLInputElement>>(
              ({ target }) =>
                setFilters((filters) => ({
                  ...filters,
                  distance: Number(target.value),
                })),
              []
            )}
          />
          <datalist id="distance-list">
            {DISTANCE_LIST.map((value) => (
              <option key={value} value={value}></option>
            ))}
          </datalist>
          <span>{`${filters.distance} km`}</span>
        </label>
        <label>
          <span>Consumption</span>
          <input
            type="range"
            list="consumption-list"
            min={CONSUMPTION_LIST[0]}
            max={CONSUMPTION_LIST[CONSUMPTION_LIST.length - 1]}
            value={String(filters.consumption)}
            onChange={useCallback<ChangeEventHandler<HTMLInputElement>>(
              ({ target }) =>
                setFilters((filters) => ({
                  ...filters,
                  consumption: Number(target.value),
                })),
              []
            )}
          />
          <datalist id="consumption-list">
            {CONSUMPTION_LIST.map((value) => (
              <option key={value} value={value}></option>
            ))}
          </datalist>
          <span>{`${filters.consumption} l/100km`}</span>
        </label>
        <label>
          <input
            type="checkbox"
            checked={filters.roundTrip}
            onChange={useCallback<ChangeEventHandler<HTMLInputElement>>(
              ({ target }) =>
                setFilters((filters) => ({
                  ...filters,
                  roundTrip: target.checked,
                })),
              []
            )}
          />
          <span>Round trip</span>
        </label>
        <span>{`Cost of trip: ${filters.roundTrip ? "2 x " : ""}${
          (filters.consumption * filters.distance) / 100
        } l (${new Intl.NumberFormat("pl-PL", {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        }).format(
          ((filters.roundTrip ? 2 : 1) *
            filters.price *
            filters.consumption *
            filters.distance) /
            100
        )} pln)`}</span>
      </div>
    </fieldset>
  );
}

export default function Calculator({
  filters,
  setFilters,
}: {
  filters: FiltersState;
  setFilters: Dispatch<SetStateAction<FiltersState>>;
}) {
  return (
    <div className={styles.Calculator}>
      <Filters filters={filters} setFilters={setFilters} />
    </div>
  );
}
