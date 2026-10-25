import { Suspense } from "react";
import { Tiers } from "./tiers";

// On desktop the arcs stay on screen for every /people route, with profiles and forms in a panel
// beside them. Keeping them in this layout means they don't re-render between people.
export default function PeopleLayout({ children }: LayoutProps<"/people">) {
  return (
    <div className="desk:flex">
      <div className="hidden min-w-0 flex-1 desk:block">
        <Suspense>
          <Tiers />
        </Suspense>
      </div>
      {children}
    </div>
  );
}
