import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CategoryClient } from "@/components/CategoryClient";
import { CategoryHeader } from "@/components/CategoryHeader";
import { categorySize, getPool, getYearPool, hasExplicitContent, MIN_YEAR_POOL } from "@/lib/catalog.server";
import { categories, DIFFICULTIES, getCategory, type Difficulty } from "@/lib/categories";
import { MODES } from "@/lib/modes";

type Props = PageProps<"/categoria/[id]">;

export function generateStaticParams() {
  return categories.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = getCategory((await params).id);
  if (!category) return {};
  const title = `Adivinhe a música: ${category.name}`;
  const description = `Jogo de adivinhar músicas de ${category.name.toLowerCase()}: ${category.description.toLowerCase()}. Desafio novo todo dia em ${MODES.length} modos e 4 níveis de dificuldade.`;
  return {
    title,
    description,
    alternates: { canonical: `/categoria/${category.id}` },
    openGraph: { title, description, images: "/opengraph-image" },
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

  return (
    <>
      <CategoryHeader category={category} total={categorySize(id)} explicit={hasExplicitContent(id)} />
      <Suspense fallback={null}>
        <CategoryClient category={category} pools={pools} />
      </Suspense>
    </>
  );
}
