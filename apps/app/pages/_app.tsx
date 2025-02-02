import type { AppProps } from "next/app";
import Head from "next/head";
import { type LayoutProps, getLayout } from "@acme/ui";
import "@vercel/examples-ui/globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  const Layout = getLayout<LayoutProps>(Component);
  const title = "Price";

  return (
    <Layout
      title={title}
      links={[
        // "auto",
        "bike",
        "dyso",
        // "euro",
        "flat",
        "fuel",
        "moto",
        "petr",
        "plot",
        "prod",
        "prom",
        "prop",
        "rate",
        "real",
        "road",
        "ross",
        // "sale",
        "taur",
        "shot",
        // "xkom",
      ]}
      path="solutions/monorepo"
    >
      <Head>
        <title>{title}</title>
      </Head>{" "}
      <Component {...pageProps} />
    </Layout>
  );
}
