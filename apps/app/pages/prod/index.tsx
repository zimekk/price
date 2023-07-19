import { Layout, Page } from "@acme/ui";
import { Price } from "@acme/prod";

export default function Index() {
  return (
    <Page>
      <Price />
    </Page>
  );
}

Index.Layout = Layout;
