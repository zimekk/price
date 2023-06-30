import styles from "./styles.module.scss";

export function Color({
  children,
  color,
}: {
  children: string;
  color: string;
}) {
  return (
    <span className={styles.Color} style={{ color }} title={children}></span>
  );
}
