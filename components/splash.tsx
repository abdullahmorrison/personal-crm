import { TemoryMark } from "@/components/temory-mark";

/** Launch screen: the mark grows in, then lifts as the name fades in. */
export function Splash() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper">
      <div className="temory-splash flex flex-col items-center gap-[22px]">
        <TemoryMark size={96} motion="splash" />
        <span className="temory-splash-name text-[40px] leading-none font-medium tracking-[-0.01em]">Temory</span>
      </div>
    </div>
  );
}
