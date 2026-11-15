import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CategoryClient } from "@/components/CategoryClient";
import { CategoryHeader } from "@/components/CategoryHeader";
import { JsonLd } from "@/components/JsonLd";
import { categorySize, getPool, getYearPool, hasExplicitContent, MIN_YEAR_POOL } from "@/lib/catalog.server";
import {
  categories,
  categoryArtists,
  DIFFICULTIES,
  getCategory,
  type Category,
  type Difficulty,
} from "@/lib/categories";
import { MODES } from "@/lib/modes";
import { breadcrumbJsonLd } from "@/lib/site";

type Props = PageProps<"/categoria/[id]">;

export function generateStaticParams() {
  return categories.map((c) => ({ id: c.id }));
}

function categoryTitle(category: Category) {
  return category.id === "mix" ? "Jogo de adivinhar música: mix de tudo" : `Jogo de adivinhar música de ${category.name}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = getCategory((await params).id);
  if (!category) return {};
  const artists = categoryArtists(category.id, 3).map((a) => a.name);
  const title = categoryTitle(category);
  const description = `Quiz de ${category.name.toLowerCase()}: ouça um trecho e adivinhe a música. ${categorySize(category.id)} músicas com ${artists.join(", ")} e mais. Desafio novo todo dia, grátis.`;
  return {
    title,
    description,
    alternates: { canonical: `/categoria/${category.id}` },
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export default function CategoryPage({ params }: Props) {
  return (
    <Suspense fallback={null}>
      <CategoryContent params={params} />
    </Suspense>
  );
}

async function CategoryContent({ params }: { params: Props["params"] }) {
  const { id } = await params;
  const category = getCategory(id);
  if (!category) notFound();

  const pools = Object.fromEntries(
    DIFFICULTIES.map((d) => [
      d.id,
      { size: getPool(id, d.id).length, yearMode: getYearPool(id, d.id).length >= MIN_YEAR_POOL },
    ]),
  ) as Record<Difficulty, { size: number; yearMode: boolean }>;
  const artists = categoryArtists(id, 12).map((a) => a.name);
  const modes = MODES.filter((m) => m.id !== "ano" || pools.todas.yearMode);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Início", path: "/" },
          { name: categoryTitle(category), path: `/categoria/${id}` },
        ])}
      />
      <CategoryHeader category={category} total={categorySize(id)} explicit={hasExplicitContent(id)} />
      <Suspense fallback={<div className="min-h-screen" />}>
        <CategoryClient category={category} pools={pools} />
      </Suspense>
      <section className="mt-16 max-w-3xl border-t-2 border-line pt-8 text-sm text-muted">
        <h2 className="font-semibold text-fg">Sobre o quiz de {category.name}</h2>
        <p className="mt-2">
          No quiz de {category.name.toLowerCase()} você ouve um trecho e tenta adivinhar a música. Aparecem músicas de{" "}
          {artists.slice(0, -1).join(", ")} e {artists.at(-1)}, entre {categorySize(id)} faixas. Dá para jogar{" "}
          {modes.map((m, i) => (
            <span key={m.id}>
              <Link href={`/jogar/${id}/${m.id}`} className="font-semibold text-fg underline-offset-4 hover:text-accent hover:underline">
                {m.name.toLowerCase()}
              </Link>
              {i < modes.length - 2 ? ", " : i === modes.length - 2 ? " e " : "."}
            </span>
          ))}
        </p>
      </section>
    </>
  );
}
