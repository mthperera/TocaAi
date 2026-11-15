import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { preload } from "react-dom";
import { Suspense } from "react";
import { GameClient, GameNav } from "@/components/game/GameClient";
import { GameTitle } from "@/components/game/GameTitle";
import { categories, getCategory } from "@/lib/categories";
import { CATALOG_URL } from "@/lib/catalog";
import { getMode, MODES } from "@/lib/modes";

type Props = PageProps<"/jogar/[categoria]/[modo]">;

export function generateStaticParams() {
  return categories.flatMap((c) => MODES.map((m) => ({ categoria: c.id, modo: m.id })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria, modo } = await params;
  const category = getCategory(categoria);
  const mode = getMode(modo);
  if (!category || !mode) return {};
  const title = `${mode.name} · Adivinhe a música de ${category.name}`;
  const description = `${mode.howTo} Músicas de ${category.name.toLowerCase()}, com desafio novo todo dia.`;
  return {
    title,
    description,
    alternates: { canonical: `/jogar/${category.id}/${mode.id}` },
    openGraph: { title, description, images: "/opengraph-image" },
  };
}

export default function GamePage({ params }: Props) {
  return (
    <Suspense fallback={null}>
      <GameContent params={params} />
    </Suspense>
  );
}

async function GameContent({ params }: { params: Props["params"] }) {
  const { categoria, modo } = await params;
  const category = getCategory(categoria);
  const mode = getMode(modo);
  if (!category || !mode) notFound();
  preload(CATALOG_URL, { as: "fetch", crossOrigin: "anonymous" });
  return (
    <>
      <Suspense fallback={<div className="h-12" />}>
        <GameNav categoryId={categoria} modeId={modo} />
      </Suspense>
      <GameTitle category={category} mode={mode} />
      <Suspense fallback={<div className="min-h-screen" />}>
        <GameClient categoryId={categoria} modeId={modo} />
      </Suspense>
    </>
  );
}
