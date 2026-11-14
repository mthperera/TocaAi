import { textOn, type Category } from "@/lib/categories";
import type { Mode } from "@/lib/modes";
import { ModeIcon } from "../ui";

export function GameTitle({ category, mode }: { category: Category; mode: Mode }) {
  return (
    <div className="mt-8 mb-10">
      <div className="flex items-center gap-4">
        <span
          className="grid size-14 shrink-0 place-items-center rounded-full"
          style={{ background: category.color, color: textOn(category.color) }}
        >
          <ModeIcon mode={mode.id} className="size-7" />
        </span>
        <h1 className="display min-w-0 text-5xl sm:text-6xl">{mode.name}</h1>
      </div>
      <p className="mt-4 max-w-2xl text-muted">{mode.howTo}</p>
    </div>
  );
}
