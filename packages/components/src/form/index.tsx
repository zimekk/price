import {
  type ChangeEventHandler,
  type ComponentProps,
  type ReactNode,
  useId,
} from "react";

export function Input({
  label,
  ...props
}: ComponentProps<"input"> & {
  label: ReactNode;
}) {
  return (
    <label>
      <span>{label}</span>
      <input {...props} />
    </label>
  );
}

export function Picker({
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
        {options.map((value, index) => (
          <option key={[index, value].join("-")} value={value}>
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

export function Range({
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
