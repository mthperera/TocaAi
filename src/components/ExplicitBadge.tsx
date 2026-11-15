export function ExplicitBadge({ className = "" }: { className?: string }) {
  return (
    <span
      title="Letra explícita"
      aria-label="Letra explícita"
      className={`inline-grid size-4 shrink-0 place-items-center rounded-[3px] bg-fg font-mono text-[10px] leading-none font-bold text-bg ${className}`}
    >
      E
    </span>
  );
}
