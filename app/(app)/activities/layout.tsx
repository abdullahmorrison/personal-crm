import { Suspense } from "react";
import { ActivityList } from "./list";

// On desktop the list stays on screen for every /activities route, with an activity or a form in a
// panel beside it. Keeping it in this layout means it doesn't re-render between activities.
export default function ActivitiesLayout({ children }: LayoutProps<"/activities">) {
  return (
    <div className="desk:flex">
      <div className="hidden min-w-0 flex-1 desk:block">
        <Suspense>
          <ActivityList />
        </Suspense>
      </div>
      {children}
    </div>
  );
}
