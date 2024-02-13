import { useState } from "react";
import type { MetaFunction } from "@remix-run/node";

import { Button } from "@/components/ui/button";
import { toggleTheme } from "@/components/ui/theme-switcher";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const [, rerender] = useState({});

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Welcome to Remix</h1>
      <p>
        This is demoing using a way of theme switching I saw from
        <a
          href="https://twitter.com/devongovett/status/1757131288144663027"
          rel="noopener noreferrer"
        >
          Devon Govett
        </a>{" "}
        on the twitters.
      </p>
      <Button
        onClick={() => {
          toggleTheme();
          rerender({});
        }}
      >
        Toggle Theme
      </Button>
      <Button
        variant="secondary"
        onClick={() => {
          rerender({});
        }}
      >
        Rerender for no real reason to make sure theme sticks.
      </Button>
    </div>
  );
}
