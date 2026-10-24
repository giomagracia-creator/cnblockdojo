import { createFileRoute } from "@tanstack/react-router";
import { TvScreen } from "@/components/dojo/tv-screen";

export const Route = createFileRoute("/")({
  component: TvScreen,
});
