import {
  type ChangeEventHandler,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Decimal } from "decimal.js";
import { InputNumber, ValueNumber } from "@acme/components";

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 2,
  }).format(amount);

const parseAmount = (value: string) =>
  Number(value.replace(/[^\d\.,]/, "").replace(",", "."));

export function Calculator({ rate }: { rate: number }) {
  const [values, setValues] = useState<{
    cache1?: string;
    cache2?: string;
    value1: number;
    value2: number;
  }>(() =>
    ((amount: number) => ({
      value1: amount,
      value2: new Decimal(amount).times(rate).toNumber(),
    }))(100)
  );

  useEffect(() => {
    setValues((values) =>
      ((amount) => ({
        ...values,
        value1: amount,
        value2: new Decimal(amount).times(rate).toNumber(),
      }))(values.value1)
    );
  }, [rate]);

  return (
    <ValueNumber>
      <span>
        <InputNumber
          style={{ width: "8em", textAlign: "right" }}
          value={
            "cache1" in values
              ? String(values.cache1)
              : formatAmount(values.value1)
          }
          onBlur={useCallback(
            () =>
              setValues(({ cache1, ...values }) =>
                Object.assign({
                  ...values,
                })
              ),
            []
          )}
          onChange={useCallback<ChangeEventHandler<HTMLInputElement>>(
            ({ target }) =>
              ((amount: number) =>
                setValues((values) =>
                  Object.assign(
                    {
                      ...values,
                      cache1: target.value,
                    },
                    isNaN(amount)
                      ? {}
                      : {
                          value1: amount,
                          value2: new Decimal(amount).times(rate).toNumber(),
                        }
                  )
                ))(parseAmount(target.value)),
            [rate]
          )}
        />
      </span>
      {" * "}
      <span>
        <InputNumber
          style={{ width: "4em" }}
          value={formatAmount(rate)}
          readOnly
        />
      </span>
      {" = "}
      <div>
        <InputNumber
          style={{ width: "8em", textAlign: "right" }}
          value={
            "cache2" in values
              ? String(values.cache2)
              : formatAmount(values.value2)
          }
          onBlur={useCallback(
            () =>
              setValues(({ cache2, ...values }) =>
                Object.assign({
                  ...values,
                })
              ),
            []
          )}
          onChange={useCallback<ChangeEventHandler<HTMLInputElement>>(
            ({ target }) =>
              ((amount: number) =>
                setValues((values) =>
                  Object.assign(
                    {
                      ...values,
                      cache2: target.value,
                    },
                    isNaN(amount)
                      ? {}
                      : {
                          value1: new Decimal(amount).div(rate).toNumber(),
                          value2: amount,
                        }
                  )
                ))(parseAmount(target.value)),
            [rate]
          )}
        />
      </div>
    </ValueNumber>
  );
}
