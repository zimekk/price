import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { z } from "zod";

function Loading() {
  return <div>Loading...</div>;
}

const DataSchema = z.object({
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
  pictures: z
    .object({
      small: z.string(),
    })
    .array(),
});

const ItemSchema = z.object({
  id: z.number(),
  item: z.string(),
  data: DataSchema,
  created: z.string(),
  checked: z.string().nullable(),
});

type Data = z.infer<typeof DataSchema>;

type Item = z.infer<typeof ItemSchema>;

function Gallery({ data }: { data: Data }) {
  return (
    <div style={{ marginRight: "1em" }}>
      {data.pictures.slice(0, 1).map((item, key) => (
        <img key={key} src={item.small} referrerPolicy="no-referrer" />
      ))}
    </div>
  );
}

function Summary({ data }: { data: Data }) {
  return (
    <div>
      <strong>{data.brand}</strong>
      {data.name && <i>{` ${data.name}`}</i>}
      <div>{data.caption}</div>
    </div>
  );
}

function Details({
  data,
  created,
  checked,
}: {
  data: Data;
  created: string;
  checked: string | null;
}) {
  return (
    <div style={{ borderTop: "1px solid lightgray", marginTop: ".25em" }}>
      <div style={{ float: "right" }}>
        <small>{dayjs(created).format("MMM D, YYYY H:mm")}</small>
        {checked && (
          <small> / {dayjs(checked).format("MMM D, YYYY H:mm")}</small>
        )}
      </div>
      <strong>
        {data.oldPrice && (
          <span>
            <span
              style={{ color: "lightgray", textDecoration: "line-through" }}
            >
              {data.oldPrice}
            </span>{" "}
          </span>
        )}
        <span
          style={{
            color: data.oldPrice ? "orangered" : "darkslateblue",
          }}
        >
          {data.price}
        </span>
      </strong>
      {data.pricePerUnit && <span>{` ${data.pricePerUnit}`}</span>}
      {data.lastLowestPrice && (
        <small>{` (last lowest price: ${data.lastLowestPrice})`}</small>
      )}
    </div>
  );
}

export function List({ list }: { list: Item[] }) {
  const [show, setShow] = useState(false);

  return (
    <div style={{ display: "flex", margin: "1em 0" }}>
      {list.slice(0, 1).map((item) => (
        <Gallery key={item.id} data={item.data} />
      ))}
      <div style={{ flexGrow: 1 }}>
        {(show ? list : list.slice(0, 1)).map((item, key) => (
          <div key={item.id}>
            {!key && <Summary data={item.data} />}
            <Details
              data={item.data}
              created={item.created}
              checked={item.checked}
            />
            {!show && list.length > 1 && (
              <div>
                <a
                  href="#"
                  onClick={(e) => (e.preventDefault(), setShow(true))}
                >
                  <pre>[...]</pre>
                </a>
              </div>
            )}
            {/* <pre>{JSON.stringify(item, null, 2)}</pre> */}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Price() {
  const [data, setData] = useState<{ result: Item[] } | null>(null);

  useEffect(() => {
    fetch("/api/price")
      .then((res) => res.json())
      .then((data) => {
        setData(
          z
            .object({
              result: ItemSchema.array(),
            })
            .parse(data)
        );
      });
  }, []);

  const grouped = useMemo(
    () =>
      Object.entries(
        (data ? data.result : [])
          .sort((a, b) => b.created.localeCompare(a.created))
          .reduce(
            (list, item) =>
              Object.assign(list, {
                [item.item]: (list[item.item] || []).concat(item),
              }),
            {} as Record<string, Item[]>
          )
      ).sort((a, b) => b[1][0].created.localeCompare(a[1][0].created)),
    [data]
  );

  if (data === null) return <Loading />;

  return (
    <section>
      <ol>
        {grouped.map(([id, list]) => (
          <li key={id}>
            <List list={list} />
          </li>
        ))}
      </ol>
    </section>
  );
}
