import { categoryArtists, type Category } from "@/lib/categories";
import { Breadcrumbs } from "./Breadcrumbs";
import { Sleeve } from "./Sleeve";
import { ExplicitBadge } from "./ExplicitBadge";

export function CategoryHeader({ category, total, explicit }: { category: Category; total: number; explicit: boolean }) {
  const artists = categoryArtists(category.id, 6);
  return (
    <section className="mb-12 grid items-end gap-8 sm:grid-cols-[220px_1fr] sm:gap-16">
      <div className="w-44 sm:w-auto">
        <Sleeve category={category} artists={artists} peek sizes="120px" />
      </div>
      <div>
        <Breadcrumbs
          back={{ href: "/", label: "Voltar para o início" }}
          items={[{ label: "Início", href: "/" }, { label: category.name }]}
        />
        <h1 className="display mt-3 text-6xl sm:text-8xl">{category.name}</h1>
        <p className="mt-3 text-lg text-muted">
          Adivinhe músicas de {category.name}: {category.description.toLowerCase()}
        </p>
        <p className="mt-1 text-sm text-muted">
          {total} músicas · com {artists.slice(0, 3).map((a) => a.name).join(", ")} e mais
        </p>
        {explicit && (
          <p className="mt-3 inline-flex items-center gap-2 text-sm text-muted">
            <ExplicitBadge /> Muitas músicas daqui têm letra explícita (palavrão, conteúdo adulto).
          </p>
        )}
      </div>
    </section>
  );
}
