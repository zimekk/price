import { type ComponentProps, type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  // faCrosshairs,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "../link";
import styles from "./styles.module.scss";

// https://stackoverflow.com/questions/2660201/what-parameters-should-i-use-in-a-google-maps-url-to-go-to-a-lat-lon
export function getLocationLink(location: string, zoom = 0) {
  const [latitude, longitude] = location.split(",");
  return `//www.google.com/maps?t=k&q=loc:${latitude}+${longitude}&hl=pl${
    zoom ? `&z=${zoom}` : ""
  }`;
}

function getLocationHref({
  lat,
  lon,
  zoom,
}: {
  lat: number;
  lon: number;
  zoom: number;
}) {
  return getLocationLink(`${lat},${lon}`, zoom);
}

export function LocationLink({
  children,
  href,
  ...props
}: ComponentProps<"div"> & {
  children: ReactNode;
  href: string;
}) {
  return (
    <div className={styles.Location} {...props}>
      <Link href={href}>
        <FontAwesomeIcon icon={faMapMarkerAlt} /> {children}
      </Link>
    </div>
  );
}

export function Location({
  children,
  lat,
  lon,
  zoom,
  show_detailed,
}: {
  children: ReactNode;
  lat: number;
  lon: number;
  zoom: number;
  show_detailed: boolean;
}) {
  return (
    <LocationLink
      style={show_detailed ? { fontWeight: "bold" } : {}}
      children={children}
      href={getLocationHref({ lat, lon, zoom })}
    />
  );
}
