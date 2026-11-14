import type { AudioSpec } from "./audio";

export type ModeId = "classico" | "reverso" | "abafado" | "capa" | "relampago" | "ano";

export type Mode = {
  id: ModeId;
  name: string;
  tagline: string;
  howTo: string;
  kind: "ladder" | "rounds";
  rounds?: number;
};

export const MODES: Mode[] = [
  {
    id: "classico",
    name: "Clássico",
    tagline: "O trecho cresce a cada erro",
    howTo: "Começa com 1 segundo da música. Cada erro ou pulo libera mais: 1s, 2s, 4s, 7s, 11s e 16s. Seis chances.",
    kind: "ladder",
  },
  {
    id: "reverso",
    name: "Ao contrário",
    tagline: "A música tocada de trás pra frente",
    howTo: "Você ouve o trecho invertido, cada vez maior. Nas duas últimas chances ele toca do jeito certo.",
    kind: "ladder",
  },
  {
    id: "abafado",
    name: "Debaixo d'água",
    tagline: "O som vai ficando nítido",
    howTo: "A música começa toda abafada, como se tocasse na casa do vizinho. A cada tentativa o filtro abre um pouco mais.",
    kind: "ladder",
  },
  {
    id: "capa",
    name: "Capa pixelada",
    tagline: "Adivinhe pela capa do álbum",
    howTo: "Sem áudio: a capa aparece toda pixelada e ganha resolução a cada tentativa.",
    kind: "ladder",
  },
  {
    id: "relampago",
    name: "Relâmpago",
    tagline: "10 músicas, 4 opções, vale a velocidade",
    howTo: "A música começa a tocar e você escolhe entre 4 opções. Quanto mais rápido acertar, mais pontos (até 1000 por música).",
    kind: "rounds",
    rounds: 10,
  },
  {
    id: "ano",
    name: "Qual o ano?",
    tagline: "Acerte o ano em que a música estourou",
    howTo: "Você vê e ouve a música e chuta o ano em que ela estava nas paradas. Na mosca vale 100; cada ano de diferença tira pontos.",
    kind: "rounds",
    rounds: 5,
  },
];

export function getMode(id: string): Mode | undefined {
  return MODES.find((m) => m.id === id);
}

export type LadderStage = {
  label: string;
  audio?: AudioSpec;
  pixels?: number;
};

const hook = (window: number) => ({ start: "refrao" as const, hookWindow: window });

export function ladderStages(mode: ModeId): LadderStage[] {
  switch (mode) {
    case "classico":
      return [1, 2, 4, 7, 11, 16].map((d) => ({ label: `${d}s`, audio: { duration: d, ...hook(16) } }));
    case "reverso":
      return [
        ...[3, 6, 10, 16].map((d) => ({ label: `${d}s ao contrário`, audio: { duration: d, reverse: true, ...hook(16) } })),
        ...[2, 6].map((d) => ({ label: `${d}s normal`, audio: { duration: d, ...hook(16) } })),
      ];
    case "abafado":
      return [
        { label: "Muito abafado", audio: { duration: 10, lowpass: 180, ...hook(10) } },
        { label: "Abafado", audio: { duration: 10, lowpass: 350, ...hook(10) } },
        { label: "Meio abafado", audio: { duration: 10, lowpass: 700, ...hook(10) } },
        { label: "Quase nítido", audio: { duration: 10, lowpass: 1400, ...hook(10) } },
        { label: "Quase limpo", audio: { duration: 10, lowpass: 2400, ...hook(10) } },
        { label: "Limpo", audio: { duration: 10, ...hook(10) } },
      ];
    case "capa":
      return [4, 6, 9, 14, 22, 36].map((p) => ({ label: `${p}×${p}`, pixels: p }));
    default:
      return [];
  }
}

export function yearPoints(diff: number): number {
  const d = Math.abs(diff);
  if (d === 0) return 100;
  if (d === 1) return 70;
  if (d === 2) return 50;
  if (d === 3) return 30;
  if (d <= 5) return 10;
  return 0;
}

export const BLITZ_SECONDS = 15;

export function blitzPoints(elapsed: number): number {
  const left = Math.max(0, BLITZ_SECONDS - elapsed);
  return 100 + Math.round((900 * left) / BLITZ_SECONDS);
}
