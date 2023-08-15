import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import L from "leaflet";
import {
  GeoJSON,
  LayersControl,
  Marker,
  MapContainer,
  TileLayer,
  Tooltip,
  WMSTileLayer,
} from "react-leaflet";
import * as Format from "ol/format";
// import wkx from 'wkx';
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import styles from "./styles.module.scss";

const { NEARBY_LAT = "52.1530829", NEARBY_LNG = "21.1104411" } = {};

export interface Point {
  id: string;
  position: [number, number];
  tooltip: string;
}

export function useBounds(points: { position: [number, number] }[]) {
  return useMemo(
    () =>
      L.featureGroup(
        points.map(({ position }) => L.marker(position))
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
  points,
  bounds,
  center,
  setCenter,
}: {
  points: Point[];
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

  const json = useMemo(() => {
    const wkt = new Format.WKT();
    const geo = new Format.GeoJSON();
    // https://uldk.gugik.gov.pl/?request=GetParcelById&id=141201_1.0001.1867/2&result=geom_wkt&srid=4326
    return geo.writeFeatureObject(
      wkt.readFeature(
        `POLYGON((21.5601774716005 52.1813863079739,21.5601462004348 52.1813295631524,21.5598530456068 52.181399352338,21.5597665101861 52.1812613495445,21.5593037893152 52.1813692414408,21.5592677100234 52.1813020932293,21.5592607092073 52.1813034745934,21.559218892055 52.1812334774476,21.559124871012 52.1812562129833,21.5590395975936 52.1811137097346,21.558749187608 52.1811808766958,21.5589984738911 52.181647065729,21.5595646456736 52.1815218771139,21.5601774716005 52.1813863079739))`
      )
    );
  }, []);

  const displayMap = useMemo(
    () => (
      <MapContainer
        bounds={bounds}
        // whenCreated={setMap}
        // zoom={13}
        className={styles.Map}
      >
        <LayersControl>
          <LayersControl.BaseLayer name="OpenStreetMap" checked>
            <TileLayer
              attribution='&amp;copy <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Esri WorldImagery">
            <TileLayer
              attribution='&copy; <a href="https://communitymaps.arcgis.com/" target="_blank" rel="noopener noreferrer">Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community</a> contributors'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="NASA Gibs Blue Marble">
            <TileLayer
              url="https://gibs-{s}.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default//EPSG3857_500m/{z}/{y}/{x}.jpeg"
              attribution="&copy; NASA Blue Marble, image service by OpenGeo"
              maxNativeZoom={8}
            />
          </LayersControl.BaseLayer>
          <LayersControl.Overlay name="Json" checked>
            <GeoJSON data={json} />
          </LayersControl.Overlay>
          <LayersControl.Overlay name="Plans">
            <WMSTileLayer
              url="https://mapy.geoportal.gov.pl/wss/ext/KrajowaIntegracjaMiejscowychPlanowZagospodarowaniaPrzestrzennego"
              // layers="plany,raster,wektor-str,wektor-lzb,wektor-pow,wektor-lin,wektor-pkt,granice"
              layers="plany,granice"
              format="image/png"
              transparent
            />
          </LayersControl.Overlay>
          <LayersControl.Overlay name="Study">
            <WMSTileLayer
              url="https://mapy.geoportal.gov.pl/wss/ext/KrajowaIntegracjaStudiumKierunkowZagospodarowaniaPrzestrzennego"
              layers="gminy,studium"
              format="image/png"
              transparent
            />
          </LayersControl.Overlay>
          <LayersControl.Overlay name="Plots">
            <WMSTileLayer
              url="https://integracja.gugik.gov.pl/cgi-bin/KrajowaIntegracjaEwidencjiGruntow"
              layers="dzialki,numery_dzialek,budynki"
              format="image/png"
              maxZoom={22}
              transparent
            />
          </LayersControl.Overlay>
          <LayersControl.Overlay name="Utils">
            <WMSTileLayer
              url="https://integracja.gugik.gov.pl/cgi-bin/KrajowaIntegracjaUzbrojeniaTerenu"
              layers="przewod_wodociagowy,przewod_kanalizacyjny,przewod_gazowy,przewod_elektroenergetyczny"
              format="image/png"
              maxZoom={22}
              transparent
            />
          </LayersControl.Overlay>
        </LayersControl>
        <DraggableMarker position={center} setPosition={setCenter}>
          {`${center.lat}, ${center.lng}`}
        </DraggableMarker>
        {points.map(({ id, position, tooltip }, i) => (
          <Marker
            key={i}
            position={new L.LatLng(...position)}
            eventHandlers={{
              click: () => {
                window.location.hash = `${id}`;
              },
            }}
          >
            <Tooltip>{tooltip}</Tooltip>
          </Marker>
        ))}
      </MapContainer>
    ),
    [center]
  );

  return <div>{displayMap}</div>;
}

export default function Map({ points }: { points: Point[] }) {
  const bounds = useBounds(
    [
      {
        position: [Number(NEARBY_LAT), Number(NEARBY_LNG)] as [number, number],
      },
    ].concat(points)
  );
  const [center, setCenter] = useState(() => bounds.getCenter());

  return (
    <div>
      <DisplayMap
        points={points}
        bounds={bounds}
        center={center}
        setCenter={setCenter}
      />
    </div>
  );
}
