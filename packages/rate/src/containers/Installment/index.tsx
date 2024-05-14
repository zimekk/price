import {
  type ChangeEventHandler,
  useCallback,
  useEffect,
  useState,
  useMemo,
} from "react";
import { Decimal } from "decimal.js";
import { InputNumber, ValueNumber } from "@acme/components";
import styles from "./styles.module.scss";

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 2,
  }).format(amount);

const parseAmount = (value: string) =>
  Number(value.replace(/[^\d\.,]/, "").replace(",", "."));

function Table({
  date,
  item,
}: {
  date: string;
  item: {
    name?: string;
    buy?: number;
    sell?: number;
    spread?: number;
    value: number;
    add: number;
    pay?: number;
    sum: number;
  };
}) {
  return (
    <table className={styles.Table}>
      <tbody>
        <tr
          tabIndex={0}
          onFocus={(e) => {
            const range = document.createRange();
            range.selectNode(e.target);
            ((selection) =>
              selection &&
              (selection.removeAllRanges(), selection.addRange(range)))(
              window.getSelection(),
            );
          }}
        >
          <td align="right" width="110">
            {date}
          </td>
          <td>{item.name}</td>
          <td align="right">
            {item.buy
              ? new Intl.NumberFormat("pl-PL", {
                  minimumFractionDigits: 4,
                }).format(item.buy)
              : ""}
          </td>
          <td align="right">
            {item.sell
              ? new Intl.NumberFormat("pl-PL", {
                  minimumFractionDigits: 4,
                }).format(item.sell)
              : ""}
          </td>
          <td align="right">
            {item.spread
              ? new Intl.NumberFormat("pl-PL", {
                  minimumFractionDigits: 4,
                }).format(item.spread)
              : ""}
          </td>
          <td align="right">
            {new Intl.NumberFormat("pl-PL", {
              minimumFractionDigits: 2,
            }).format(item.value)}
          </td>
          <td align="right">
            {new Intl.NumberFormat("pl-PL", {
              minimumFractionDigits: 2,
            }).format(item.add)}
          </td>
          <td align="right">
            {item.pay
              ? new Intl.NumberFormat("pl-PL", {
                  minimumFractionDigits: 2,
                }).format(item.pay)
              : ""}
          </td>
          <td align="right">
            {item.sum
              ? new Intl.NumberFormat("pl-PL", {
                  minimumFractionDigits: 2,
                }).format(item.sum)
              : ""}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function Installment({ date, rate }: { date: string; rate: number }) {
  const [values, setValues] = useState<{
    cache1?: string;
    cache2?: string;
    value1: number;
    value2: number;
  }>(() =>
    ((amount: number) => ({
      value1: amount,
      value2: new Decimal(amount).times(rate).add(60).toNumber(),
    }))(552.69),
  );

  useEffect(() => {
    setValues((values) =>
      ((amount) => ({
        ...values,
        value1: amount,
        value2: new Decimal(amount).times(rate).toNumber(),
      }))(values.value1),
    );
  }, [rate]);

  const item = useMemo(
    () =>
      (({ sell, value, pay, add }) => ({
        sell,
        value,
        add,
        pay,
        sum: pay + add,
      }))({
        sell: rate,
        value: values.value1,
        pay: Math.round(100 * values.value2) / 100,
        add: 60,
      }),
    [values],
  );

  return (
    <div>
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
                  }),
                ),
              [],
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
                          },
                    ),
                  ))(parseAmount(target.value)),
              [rate],
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
                  }),
                ),
              [],
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
                          },
                    ),
                  ))(parseAmount(target.value)),
              [rate],
            )}
          />
        </div>
      </ValueNumber>
      <Table date={date} item={item} />
    </div>
  );
}
