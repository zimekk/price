import { useCallback, useEffect, useMemo, useRef } from "react";
// https://github.com/vercel/examples/blob/main/internal/packages/ui/src/nav.tsx
import { Button, Link } from "@vercel/examples-ui";
import { DeployButton, type DeployButtonProps } from "./deploy-button";

const REPO_URL = "https://github.com/vercel/examples/tree/main";

export interface NavProps {
  title: string;
  links: string[];
  path: string;
  deployButton?: Partial<DeployButtonProps>;
}

export const Nav = ({ title, links, path, deployButton }: NavProps) => {
  const repositoryUrl = deployButton?.repositoryUrl || `${REPO_URL}/${path}`;

  const ref = useRef<HTMLDivElement>(null);

  const offset = useRef(100);
  const recent = useRef(0);

  useEffect(() => {
    // https://muhammetaydinn.medium.com/hide-header-when-scrolling-down-in-react-native-without-package-2bc74c35e23
    // https://stackoverflow.com/questions/65321989/how-in-rxjs-bubble-a-scroll-event
    // fromEvent(window, 'scroll', { capture: true }).subscribe(console.log);
    function handleScroll() {
      if (ref.current) {
        const y = Math.max(0, window.scrollY);
        const delta = ref.current.clientHeight + 1;

        // https://www.codemzy.com/blog/react-sticky-header-disappear-scroll
        if (y > recent.current + offset.current) {
          const current = y - recent.current;
          if (current > delta) {
            offset.current = delta;
            recent.current = y - delta;
          } else {
            offset.current = current;
          }
        } else if (y < recent.current + offset.current) {
          const delta = 0;
          const current = y - recent.current;
          if (current < delta) {
            offset.current = delta;
            recent.current = y - delta;
          } else {
            offset.current = current;
          }
        }

        ref.current.style.transform = `translateY(${-offset.current}px)`;
      }
    }

    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [offset, recent, ref]);

  return (
    <nav
      ref={ref}
      style={{
        position: "sticky",
        top: 0,
      }}
      className="border-b border-gray-200 py-5 relative z-20 bg-background shadow-[0_0_15px_0_rgb(0,0,0,0.1)]"
    >
      <div className="flex items-center lg:px-6 px-8 mx-auto max-w-7xl">
        <div className="flex flex-row items-center">
          <Link href="/">
            <span>
              <svg height="26" viewBox="0 0 75 65" fill="#000">
                <title>{title}</title>
                <path d="M37.59.25l36.95 64H.64l36.95-64z"></path>
              </svg>
            </span>
          </Link>
          <ul className="flex items-center content-center">
            <li className="ml-2 text-gray-200">
              <svg
                viewBox="0 0 24 24"
                width="32"
                height="32"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                shapeRendering="geometricPrecision"
              >
                <path d="M16.88 3.549L7.12 20.451"></path>
              </svg>
            </li>
            <li className="font-medium" style={{ letterSpacing: ".01px" }}>
              {links.map((link) => (
                <Link
                  key={link}
                  href={`/${link}`}
                  style={{ marginRight: ".5em" }}
                >
                  {link}
                </Link>
              ))}
            </li>
          </ul>
        </div>
        <div className="flex-1 justify-end hidden md:flex">
          <nav className="flex-row inline-flex items-center">
            <span className="ml-2 h-full flex items-center cursor-not-allowed text-accents-5">
              <Button
                variant="ghost"
                Component="a"
                href="https://github.com/vercel/examples/tree/main"
                target="_blank"
                rel="noreferrer"
              >
                More Examples →
              </Button>
            </span>
            <span className="ml-2 h-full flex items-center cursor-not-allowed text-accents-5">
              <DeployButton
                {...deployButton}
                repositoryUrl={repositoryUrl}
                projectName={deployButton?.projectName || path}
                repositoryName={deployButton?.repositoryName || path}
              />
            </span>
          </nav>
        </div>
      </div>
    </nav>
  );
};
