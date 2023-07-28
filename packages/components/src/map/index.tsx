import dynamic from "next/dynamic";
import { type ComponentProps, useMemo, useCallback, useState } from "react";

export function DisplayMap() {
  const Map = useMemo(() => dynamic(() => import("./Map"), { ssr: false }), []);

  return <Map />;
}

export function Map({ ...props }: ComponentProps<"div">) {
  const [open, setOpen] = useState(false);

  const handleToggle = useCallback(() => setOpen((open) => !open), []);

  return (
    <div {...props}>
      <button onClick={handleToggle}>{open ? "Hide map" : "Show map"}</button>
      {open && <DisplayMap />}
    </div>
  );
}
