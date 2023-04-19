import { useEffect,useMemo, useState,  } from 'react'
import {z} from 'zod'

function Loading() {
  return <div>Loading...</div>;
}

interface Item {
  id:number;
  item:string;
}

export function List({list}: {
  list: Item[]
}) {
  const [show, setShow] = useState(false);

  return (
    <ul>
    {(show ? list : list.slice(0, 1)).map((item) => (
      <li key={item.id}>
        <pre>{JSON.stringify(item, null, 2)}</pre>
</li>
))}
{!show && list.length > 1 && (
  <li><a href="#" onClick={e => (e.preventDefault(), setShow(true))}><pre>[...]</pre></a></li>
)}
</ul>
)
}

export function Price(
  ) {
  const [data, setData] = useState<{result: Item[]} | null>(null);

  useEffect(() => {
    fetch("/api/price")
      .then((res) => res.json())
      .then((data) => {
        setData(z.object({
          result: z.object({
id: z.number(),
item: z.string(),
data: z.object({
  name: z.string().optional(),
  unit: z.string(),
  brand: z.string(),
  caption: z.string(),
  category: z.string(),
  availability: z.string(),
  pricePerUnit: z.string(),
  promotion: z.unknown(),
  promotionTo: z.string().optional(),
  promotionFrom: z.string().optional(),
  price: z.number(),
  oldPrice: z.number().optional(),
  lastLowestPrice: z.number().optional(),
  })
  ,
created: z.string(),
checked: z.string().nullable(),
          })
          .array()
        })
        .parse(data));
      });
  }, []);

  const grouped = useMemo(
    () =>
    (data ?data.result:[]).reduce(
        (list, item) =>
          Object.assign(list, {
            [item.item]: (list[item.item] || []).concat(item),
          }),
        {} as Record<string, Item[]>
      ),
    [data]
  );

  if (data === null) return <Loading />;

  return (
    <section>
      <ol>
      {Object.entries(grouped).map(([id, list]) => (
                              <li key={id}>
                              [{id}]
                              <List list={list}/>
              </li>
        ))}
      </ol>
    </section>
  )
}
