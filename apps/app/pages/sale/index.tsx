import { Layout, Page } from "@vercel/examples-ui";
import { Price } from "@acme/sale";

export default function Index() {
  return (
    <Page>
      <Price />
    </Page>
  );
}

Index.Layout = Layout;
