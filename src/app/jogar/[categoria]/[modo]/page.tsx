import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { preload } from "react-dom";
import { Suspense } from "react";
import { GameClient, GameNav } from "@/components/game/GameClient";
import { GameTitle } from "@/components/game/GameTitle";
import { categories, getCategory } from "@/lib/categories";
import { JsonLd } from "@/components/JsonLd";
import { getMode, modeSearchTitle, MODES, type Mode } from "@/lib/modes";
import { CATALOG_URL } from "@/lib/catalog";
import { breadcrumbJsonLd } from "@/lib/site";

type Props = PageProps<"/jogar/[categoria]/[modo]">;

export function generateStaticParams() {
  return categories.flatMap((c) => MODES.map((m) => ({ categoria: c.id, modo: m.id })));
}

function gameTitle(categoryId: string, categoryName: string, mode: Mode) {
  return modeSearchTitle(mode, categoryId === "mix" ? null : categoryName);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria, modo } = await params;
  const category = getCategory(categoria);
  const mode = getMode(modo);
  if (!category || !mode) return {};
  const title = gameTitle(category.id, category.name, mode);
  const quiz = category.id === "mix" ? "Músicas de todos os estilos" : `Quiz de ${category.name.toLowerCase()}`;
  const description = `${mode.howTo} ${quiz}, com desafio novo todo dia. Grátis e sem cadastro.`;
  const image = category.id === "mix" ? "/opengraph-image" : `/categoria/${category.id}/opengraph-image`;
  return {
    title,
    description,
    alternates: { canonical: `/jogar/${category.id}/${mode.id}` },
    openGraph: { title, description, images: image },
    twitter: { title, description, images: image },
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
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Início", path: "/" },
          { name: category.name, path: `/categoria/${category.id}` },
          { name: gameTitle(category.id, category.name, mode), path: `/jogar/${category.id}/${mode.id}` },
        ])}
      />
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
