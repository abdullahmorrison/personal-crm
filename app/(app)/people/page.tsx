import { Suspense } from "react";
import { Tiers } from "./tiers";

// Phones only: on desktop the layout already shows the arcs.
export default function PeoplePage() {
  return (
    <div className="desk:hidden">
      <Suspense>
        <Tiers />
      </Suspense>
    </div>
  );
}
