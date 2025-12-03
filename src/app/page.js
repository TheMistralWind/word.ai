"use client";

import { useState } from "react";
import ContextPanel from "./components/ContextPanel";
import Editor from "./components/Editor";

export default function Home() {
  const [context, setContext] = useState("");

  return (
    <main className="container">
      <ContextPanel context={context} setContext={setContext} />
      <Editor context={context} />
    </main>
  );
}
