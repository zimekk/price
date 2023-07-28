import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import L from "leaflet";
import { Marker, MapContainer, TileLayer, Tooltip } from "react-leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import styles from "./styles.module.scss";

const { NEARBY_LAT = "52.1530829", NEARBY_LNG = "21.1104411" } = {};

export function useBounds(list: { position: L.LatLng }[]) {
  return useMemo(
    () =>
      L.featureGroup(
        list.map(({ position: { lat, lng } }) => L.marker([lat, lng]))
      ).getBounds(),
    []
  );
}

export function DraggableMarker({
  position,
  children,
  setPosition,
}: {
  position: L.LatLng;
  children: React.ReactNode;
  setPosition: Function;
}) {
  const markerRef = useRef<L.Marker>(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          setPosition(marker.getLatLng());
        }
      },
    }),
    []
  );

  return (
    <Marker
      draggable
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    >
      <Tooltip>{children}</Tooltip>
    </Marker>
  );
}

export function DisplayMap({
  bounds,
  center,
  setCenter,
}: {
  bounds: L.LatLngBounds;
  center: L.LatLng;
  setCenter: Dispatch<SetStateAction<L.LatLng>>;
}) {
  useEffect(() => {
    // delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x.src,
      iconUrl: markerIcon.src,
      shadowUrl: markerShadow.src,
    });
  }, []);

  const displayMap = useMemo(
    () => (
      <MapContainer
        bounds={bounds}
        // whenCreated={setMap}
        // zoom={13}
        className={styles.Map}
      >
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DraggableMarker position={center} setPosition={setCenter}>
          {`${center.lat}, ${center.lng}`}
        </DraggableMarker>
      </MapContainer>
    ),
    [center]
  );

  return <div>{displayMap}</div>;
}

export default function Map() {
  const bounds = useBounds([
    {
      position: new L.LatLng(Number(NEARBY_LAT), Number(NEARBY_LNG)),
    },
  ]);
  const [center, setCenter] = useState(() => bounds.getCenter());

  return (
    <div>
      <DisplayMap bounds={bounds} center={center} setCenter={setCenter} />
    </div>
  );
}
