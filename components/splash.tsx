import { TemoryMark } from "@/components/temory-mark";

/** Launch screen: the mark draws itself, then lifts as the name fades in. */
export function Splash() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper">
      <div className="temory-splash flex flex-col items-center gap-[18px]">
        <TemoryMark size={168} motion="splash" />
        <span className="temory-splash-name text-[40px] leading-none font-medium tracking-[-0.01em]">Temory</span>
      </div>
    </div>
  );
}
