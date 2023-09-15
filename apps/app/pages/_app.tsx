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
        "auto",
        "euro",
        "flat",
        "fuel",
        "moto",
        "plot",
        "prod",
        "prop",
        "rate",
        "real",
        "road",
        "ross",
        "sale",
        "shot",
        "xkom",
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
