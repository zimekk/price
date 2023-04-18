import { useState, useEffect } from 'react'

function Loading() {
  return <div>Loading...</div>;
}

export function Price(
) {
  const [data, setData] = useState<object | null>(null);

  useEffect(() => {
    fetch("/api/hello")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
      });
  }, []);

  if (data === null) return <Loading />;

  return (
<pre>{JSON.stringify(data)}</pre>
  )
}
