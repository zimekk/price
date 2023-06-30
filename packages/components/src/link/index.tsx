import { type ComponentPropsWithoutRef } from "react";

export function Link({ href = "#", ...props }: ComponentPropsWithoutRef<"a">) {
  const hash = href[0] === "#";

  return (
    <a
      href={href}
      target={hash ? undefined : "_blank"}
      rel={hash ? undefined : "noopener noreferrer"}
      {...props}
    />
  );
}
