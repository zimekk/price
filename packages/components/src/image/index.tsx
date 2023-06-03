import { Suspense, useEffect, useRef, useState } from "react";
import cx from "clsx";
import { createAsset } from "use-asset";
import { Spinner } from "../spinner";
import styles from "./styles.module.scss";

const imgSrcFallback = () => "";

const image = createAsset(
  async (src): Promise<string> =>
    new Promise((resolve) => {
      const img = new Image();
      Object.assign(img, {
        onload: () => resolve(src),
        onerror: () => resolve(imgSrcFallback()),
        src,
      });
    })
);

export function Img({ src, ...props }: { src: string; srcSet?: string }) {
  const img = image.read(src);
  return <img src={img} {...props} referrerPolicy="no-referrer" />;
}

function Loader() {
  return (
    <div className={styles.Loader}>
      <Spinner />
    </div>
  );
}

export function LazyImage({
  className,
  src,
}: {
  className?: string;
  src: string;
}) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleObserve: IntersectionObserverCallback = ([
      { isIntersecting },
    ]) => {
      if (isIntersecting) {
        setInView(true);
      }
    };
    if (ref.current instanceof HTMLElement) {
      const observer = new IntersectionObserver(handleObserve, {
        root: null,
        rootMargin: "0px",
        threshold: 1.0,
      });
      observer.observe(ref.current);
      return () => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      };
    }
  }, [ref]);

  return (
    <div ref={ref} className={cx(className, styles.Image)}>
      {inView && (
        <Suspense fallback={<Loader />}>
          <Img src={src} />
        </Suspense>
      )}
    </div>
  );
}
