import { BackLink } from "@/components/back-link";
import { SectionLabel } from "@/components/section-label";
import { ThemePicker } from "@/components/theme";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-xl px-7 pt-14 pb-10 desk:pt-8">
      <BackLink href="/people" label="Back to people" />
      <h1 className="mt-6 text-2xl font-medium desk:mt-0 desk:text-[28px]">Settings</h1>
      <section className="mt-10">
        <SectionLabel className="mb-3">Appearance</SectionLabel>
        <ThemePicker />
      </section>
    </div>
  );
}
