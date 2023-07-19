import type { AppProps } from "next/app";
import { type LayoutProps, getLayout } from "@acme/ui";
import "@vercel/examples-ui/globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  const Layout = getLayout<LayoutProps>(Component);

  return (
    <Layout
      title="Price"
      links={[
        "auto",
        "euro",
        "moto",
        "plot",
        "prod",
        "prop",
        "rate",
        "real",
        "ross",
        "sale",
        "shot",
        "xkom",
      ]}
      path="solutions/monorepo"
    >
      <Component {...pageProps} />
    </Layout>
  );
}
