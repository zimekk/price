// https://github.com/vercel/examples/blob/main/internal/packages/ui/src/layout.tsx
import type { ReactNode, ComponentType } from "react";
import { Nav, type NavProps } from "../nav";
import Vercel from "@vercel/examples-ui/icons/vercel";

export interface LayoutProps extends NavProps {
  children?: ReactNode;
}

const Noop = ({ children }: { children?: ReactNode }) => <>{children}</>;

export const getLayout = <LP extends {} = LayoutProps>(
  Component: any
): ComponentType<LP> => Component?.Layout || Noop;

export const Layout = ({ children, ...props }: LayoutProps) => (
  <div className="mx-auto min-h-screen flex flex-col">
    <Nav {...props} />

    <div className="px-8 bg-accents-0">{children}</div>

    <footer className="py-10 w-full mt-auto border-t flex items-center justify-center bg-accents-1 z-20">
      <span className="text-primary">Created by</span>
      <a
        href="https://vercel.com"
        aria-label="Vercel.com Link"
        target="_blank"
        rel="noreferrer"
        className="text-black"
      >
        <Vercel
          className="inline-block h-6 ml-3 text-primary"
          alt="Vercel.com Logo"
        />
      </a>
    </footer>
  </div>
);
