import { useSyncExternalStore } from "react";
import { caveAudio } from "@/lib/dojo/audio";

export function SoundToggle() {
  const mode = useSyncExternalStore(caveAudio.subscribe, caveAudio.snapshot, () => "waiting");
  const label = mode === "off" ? "Sound off" : mode === "on" ? "Sound on" : "Tap for sound";
  return (
    <button
      type="button"
      data-sound-toggle
      onClick={() => caveAudio.press()}
      aria-pressed={mode === "on"}
      className="inline-flex min-h-11 items-center rounded-md border-2 border-border bg-bg/85 px-3 font-extrabold text-fg shadow-lg"
    >
      {label}
    </button>
  );
}
