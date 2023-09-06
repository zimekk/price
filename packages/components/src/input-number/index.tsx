import { type ComponentProps } from "react";
import styles from "./styles.module.scss";

export function InputNumber({ ...props }: ComponentProps<"input">) {
  return <input className={styles.Input} {...props} />;
}

export function ValueNumber({ ...props }: ComponentProps<"div">) {
  return <div className={styles.Value} {...props} />;
}
