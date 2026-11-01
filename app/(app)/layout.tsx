import { FloatingLogButton, Sidebar, TabBar } from "@/components/nav";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-viewport">
      <Sidebar />
      <main className="min-w-0 flex-1 pb-28 desk:pb-0">{children}</main>
      <FloatingLogButton />
      <TabBar />
    </div>
  );
}
