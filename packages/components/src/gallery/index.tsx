import { LazyImage } from "../image";

export function Gallery({ images }: { images: string[] }) {
  return (
    <div style={{ width: 120, height: 120, marginRight: "1em" }}>
      {images.slice(0, 1).map((url, key) => (
        <LazyImage key={key} src={url} />
      ))}
    </div>
  );
}
