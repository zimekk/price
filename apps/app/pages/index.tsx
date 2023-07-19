import { useState, useEffect } from "react";
import { Hello } from "@acme/hello";
import { Button, Layout, Page, Text } from "@acme/ui";
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
      <Hello />
    </Page>
  );
}

Index.Layout = Layout;
