import { useEffect, useState } from "react";
import { Loading } from "@acme/components";

export function Hello() {
  const [data, setData] = useState<object | null>(null);

  useEffect(() => {
    fetch("/api/hello")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
      });
  }, []);

  if (data === null) return <Loading />;

  return <pre>{JSON.stringify(data)}</pre>;
}
