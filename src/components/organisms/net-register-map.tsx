import Head from "next/head";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import type {
  MapContainerProps,
  MarkerProps,
  PopupProps,
  TileLayerProps,
} from "react-leaflet";

const MapContainer = dynamic<MapContainerProps>(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse bg-muted/20" />
    ),
  }
);
const TileLayer = dynamic<TileLayerProps>(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic<MarkerProps>(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic<PopupProps>(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

export type NetRegisterLike = {
  netId: number | string;
  netNumber: string | number;
  netLat: unknown;
  netLong: unknown;
  meshSize?: unknown;
  netLength?: unknown;
};

export type NetRegisterMapProps<TNet extends NetRegisterLike = NetRegisterLike> =
  {
    nets: readonly TNet[];
    className?: string;
    heightPx?: number;
    scrollWheelZoom?: boolean;
    zoomSingle?: number;
    zoomMultiple?: number;
    tileUrl?: string;
    tileAttribution?: string;
    renderPopup?: (net: TNet) => ReactNode;
  };

type NetPoint<TNet extends NetRegisterLike> = {
  net: TNet;
  lat: number;
  lng: number;
};

const parseCoord = (value: unknown) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return Number.NaN;
    return Number(trimmed.replace(",", "."));
  }
  return Number.NaN;
};

const isValidLatLng = (lat: number, lng: number) => {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;
  if (lat === 0 && lng === 0) return false;
  return true;
};

export default function NetRegisterMap<TNet extends NetRegisterLike>({
  nets,
  className,
  heightPx = 360,
  scrollWheelZoom = false,
  zoomSingle = 15,
  zoomMultiple = 12,
  tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  tileAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  renderPopup,
}: NetRegisterMapProps<TNet>) {
  const points: Array<NetPoint<TNet>> = nets
    .map((net) => {
      const lat = parseCoord(net.netLat);
      const lng = parseCoord(net.netLong);
      return { net, lat, lng };
    })
    .filter((p) => isValidLatLng(p.lat, p.lng));

  if (points.length === 0) return null;

  const bounds =
    points.length > 1
      ? ([
          [
            Math.min(...points.map((p) => p.lat)),
            Math.min(...points.map((p) => p.lng)),
          ],
          [
            Math.max(...points.map((p) => p.lat)),
            Math.max(...points.map((p) => p.lng)),
          ],
        ] as [[number, number], [number, number]])
      : undefined;

  const center: [number, number] = [points[0]!.lat, points[0]!.lng];

  return (
    <div className={className}>
      <Head>
        <link
          key="leaflet-css"
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha384-sHL9NAb7lN7rfvG5lfHpm643Xkcjzp4jFvuavGOndn6pjVqS6ny56CAt3nsEVT4H"
          crossOrigin=""
        />
      </Head>

      <div
        className="w-full overflow-hidden rounded-md border bg-background"
        style={{ height: `${heightPx}px` }}
      >
        <MapContainer
          className="h-full w-full"
          center={center}
          zoom={points.length === 1 ? zoomSingle : zoomMultiple}
          bounds={bounds}
          boundsOptions={{ padding: [24, 24] as [number, number] }}
          scrollWheelZoom={scrollWheelZoom}
        >
          <TileLayer
            url={tileUrl}
            attribution={tileAttribution}
          />

          {points.map(({ net, lat, lng }) => (
            <Marker
              key={net.netId}
              position={[lat, lng] as [number, number]}
            >
              <Popup>
                {renderPopup ? (
                  renderPopup(net)
                ) : (
                  <div className="text-sm">
                    <div className="font-semibold">Rede {net.netNumber}</div>
                    <div>
                      {lat}, {lng}
                    </div>
                  </div>
                )}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
