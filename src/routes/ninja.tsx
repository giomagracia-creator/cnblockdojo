import { createFileRoute } from "@tanstack/react-router";
import { NinjaHall } from "@/components/dojo/ninja-hall";

export const Route = createFileRoute("/ninja")({
  component: NinjaHall,
  head: () => ({
    meta: [{ title: "Ninja games · BLOCKDOJO" }],
  }),
});
