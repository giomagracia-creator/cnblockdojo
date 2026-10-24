import { useEffect } from "react";
import { CODE_KEY, useDojo } from "@/lib/dojo/store";
import { GATE_EVENT } from "@/lib/dojo/gate";

export function DojoProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let stop = false;
    const tick = async () => {
      if (stop) return;
      const role = window.location.pathname.startsWith("/sensei") ? "sensei" : "display";
      await useDojo.getState().refresh(role);
    };
    void tick();
    let timer = 0;
    const loop = () => {
      timer = window.setTimeout(async () => {
        await tick();
        if (!stop) loop();
      }, document.hidden ? 4000 : 1000);
    };
    loop();
    const onStorage = (event: StorageEvent) => {
      if (event.key === CODE_KEY) void tick();
    };
    const onGate = () => void tick();
    window.addEventListener("storage", onStorage);
    window.addEventListener(GATE_EVENT, onGate);
    return () => {
      stop = true;
      window.clearTimeout(timer);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(GATE_EVENT, onGate);
    };
  }, []);
  return children;
}