type Props = { as?: "h2" | "legend" | "span"; className?: string; children: React.ReactNode };

/** Small uppercase heading for a section of a page or form ("Notes", "How close"). */
export function SectionLabel({ as: Tag = "h2", className = "", children }: Props) {
  return <Tag className={`text-[0.6875rem] font-medium tracking-[0.12em] text-muted uppercase ${className}`}>{children}</Tag>;
}
