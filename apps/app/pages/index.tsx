import { useState, useEffect } from "react";
import Link from "next/link";
import { Layout, Page, Text } from "@vercel/examples-ui";
import { Hello } from "@acme/hello";
import { Button } from "@acme/ui";
import { matchingTextColor, randomColor } from "@acme/utils";

export default function Index() {
  const [bgColor, setBgColor] = useState("");
  const [textColor, setTextColor] = useState("");
  const changeColor = () => {
    const bg = randomColor();
    setBgColor(bg);
    setTextColor(matchingTextColor(bg));
  };

  useEffect(changeColor, []);

  return (
    <Page>
      <Text variant="h1" className="mb-6">
        Monorepo
      </Text>
      {bgColor && textColor && (
        <>
          <Button
            style={{
              backgroundColor: bgColor,
              color: textColor,
              borderColor: textColor,
            }}
            onClick={changeColor}
          >
            Change Color
          </Button>
        </>
      )}
      |<Link href="/ross">ross</Link>|<Link href="/auto">auto</Link>|
      <Link href="/euro">euro</Link>|<Link href="/xkom">xkom</Link>
      <Hello />
    </Page>
  );
}

Index.Layout = Layout;
