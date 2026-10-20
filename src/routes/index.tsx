import { createFileRoute } from "@tanstack/react-router";
import { HtmlRuntimeApp } from "@/components/html-runtime/app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <HtmlRuntimeApp />;
}
