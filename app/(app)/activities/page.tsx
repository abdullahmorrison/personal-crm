import { Suspense } from "react";
import { ActivityList } from "./list";

// Phones only: on desktop the layout already shows the list.
export default function ActivitiesPage() {
  return (
    <div className="desk:hidden">
      <Suspense>
        <ActivityList />
      </Suspense>
    </div>
  );
}
