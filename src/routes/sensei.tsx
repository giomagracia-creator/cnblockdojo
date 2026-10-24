import { createFileRoute } from "@tanstack/react-router";
import { SenseiDesk } from "@/components/dojo/sensei-desk";

export const Route = createFileRoute("/sensei")({
  component: SenseiDesk,
  head: () => ({
    meta: [{ title: "Sensei desk · BLOCKDOJO" }],
  }),
});
