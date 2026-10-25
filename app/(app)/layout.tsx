import { LogButton, Sidebar, TabBar } from "@/components/nav";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <main className="min-w-0 flex-1 pb-28 desk:pb-0">{children}</main>
      <LogButton className="fixed right-4 bottom-[calc(max(env(safe-area-inset-bottom),12px)+76px)] z-20 desk:hidden" />
      <TabBar />
    </div>
  );
}
