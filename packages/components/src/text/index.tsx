import { type ComponentProps, useCallback, useState } from "react";

export function Text({ children, style, ...props }: ComponentProps<"div">) {
  const [clamp, setClamp] = useState(true);

  const handleToggle = useCallback(() => setClamp((clamp) => !clamp), []);

  return (
    <div
      onClick={handleToggle}
      dangerouslySetInnerHTML={{ __html: String(children) }}
      style={{
        // https://stackoverflow.com/questions/53156266/reactjs-multiline-textarea-with-ellipsis
        cursor: "pointer",
        display: "-webkit-box",
        overflow: "hidden",
        WebkitBoxOrient: "vertical",
        WebkitLineClamp: clamp ? 2 : undefined,
        ...style,
      }}
      {...props}
    />
  );
}
