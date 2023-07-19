import { Layout, Page } from "@acme/ui";
import { Price } from "@acme/auto";

export default function Index() {
  return (
    <Page>
      <Price />
    </Page>
  );
}

Index.Layout = Layout;
