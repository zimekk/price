import {
  type ChangeEventHandler,
  type Dispatch,
  type SetStateAction,
  useCallback,
} from "react";
import { Input, Picker } from "@acme/components";

export interface FiltersState {
  network: string;
  search: string;
}

export interface OptionsState {
  network: string[];
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
          label="Network"
          options={[""].concat(options.network)}
          value={filters.network}
          onChange={useCallback(
            ({ target }) =>
              setFilters((filters) => ({
                ...filters,
                network: target.value,
              })),
            []
          )}
        />
        <Input
          label="Address"
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
      </div>
    </fieldset>
  );
}
