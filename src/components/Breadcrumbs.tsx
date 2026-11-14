import Link from "next/link";
import { Fragment } from "react";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items, back }: { items: Crumb[]; back?: { href: string; label: string } }) {
  return (
    <nav aria-label="Você está em" className="flex items-center gap-3">
      {back && (
        <Link
          href={back.href}
          aria-label={back.label}
          title={back.label}
          className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-fg transition hover:bg-fg hover:text-bg"
        >
          <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden>
            <path d="M13 8H3M7.5 3.5 3 8l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      )}
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        {items.map((item, i) => (
          <Fragment key={item.label}>
            {i > 0 && (
              <li aria-hidden className="text-muted">
                /
              </li>
            )}
            <li>
              {item.href ? (
                <Link href={item.href} className="font-semibold underline-offset-4 hover:text-accent hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-muted">
                  {item.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
