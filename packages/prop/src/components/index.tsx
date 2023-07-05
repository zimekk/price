import { type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { Link } from "@acme/components";
import styles from "./styles.module.scss";

export function getLocationLink(location: string, zoom = 0) {
  return `//www.google.com/maps?t=k&q=${encodeURIComponent(location)}&hl=pl${
    zoom ? `&z=${zoom}` : ""
  }`;
}

export function Location({
  children,
  value,
}: {
  children: ReactNode;
  value: string;
}) {
  return (
    <div className={styles.Location}>
      <Link href={getLocationLink(value)}>
        <FontAwesomeIcon icon={faMapMarkerAlt} /> {children}
      </Link>
    </div>
  );
}
