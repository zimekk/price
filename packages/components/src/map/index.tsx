import dynamic from "next/dynamic";
import { type ComponentProps, useMemo, useCallback, useState } from "react";
import { type Point } from "./Map";

export function DisplayMap({ points }: { points: Point[] }) {
  const Map = useMemo(() => dynamic(() => import("./Map"), { ssr: false }), []);

  return <Map points={points} />;
}

export function Map({
  points,
  ...props
}: ComponentProps<"div"> & {
  points: Point[];
}) {
  const [open, setOpen] = useState(false);

  const handleToggle = useCallback(() => setOpen((open) => !open), []);

  return (
    <div {...props}>
      <button onClick={handleToggle}>{open ? "Hide map" : "Show map"}</button>
      {open && <DisplayMap points={points} />}
    </div>
  );
}
