"use client";

import { Check, Copy } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";

function FilePathCopy({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(path);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can fail without permission
    }
  }, [path]);

  return (
    <span className="inline-flex items-center gap-0.5 align-baseline">
      <code className="bg-foreground/5 px-1 rounded">{path}</code>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="text-foreground/45 hover:text-foreground -my-0.5 shrink-0"
        onClick={copy}
        aria-label={`Kopier filsti: ${path}`}
      >
        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      </Button>
    </span>
  );
}

export function EmbeddingsTasks() {
  return (
    <div className="max-w-2xl space-y-4">
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
            UI
          </span>
          <span className="text-xs text-foreground/50">~5 min</span>
        </div>
        <h3 className="font-semibold text-sm mb-1">
          1. Semantisk magi
        </h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Søk etter &quot;filmer om ensomhet i verdensrommet&quot; og
          sammenlign semantisk vs keyword-resultater. Observer at semantisk
          finner relevante filmer selv uten eksakte ordmatcher, mens keyword
          kan komme tomhendt tilbake.
        </p>
        <p className="text-xs text-foreground/50 mt-2 italic">
          Læringsmål: Semantisk søk forstår mening, ikke bare ord.
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
            UI
          </span>
          <span className="text-xs text-foreground/50">~10 min</span>
        </div>
        <h3 className="font-semibold text-sm mb-1">
          2. Finn grensene
        </h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Prøv søk der keyword slår semantisk (f.eks. eksakt tittel,
          spesifikke årstall). Finn minst ett eksempel av hvert. Skriv ned:
          når er hvilken metode best?
        </p>
        <p className="text-xs text-foreground/50 mt-2 italic">
          Læringsmål: Begge tilnærminger har styrker; hybrid er ofte best i
          praksis.
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
            UI
          </span>
          <span className="text-xs text-foreground/50">~15 min</span>
        </div>
        <h3 className="font-semibold text-sm mb-1">
          3. 3D-utforskning og anbefalinger
        </h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Bruk 3D-visualiseringen til å identifisere klynger av filmer.
          Klikk på filmer i ulike deler av rommet og observer anbefalingene.
          Stemmer klyngene med sjanger, eller fanger de noe dypere?
        </p>
        <p className="text-xs text-foreground/50 mt-2 italic">
          Læringsmål: Embeddings fanger semantiske relasjoner som går utover
          sjanger — tematikk, tone, målgruppe.
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
            Kode
          </span>
          <span className="text-xs text-foreground/50">~30 min</span>
        </div>
        <h3 className="font-semibold text-sm mb-1">4. Reranking</h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Start med å få AI-assistenten din til å forklare konseptet{" "}
          <em>reranking</em>: Hva er det? Hvorfor er det nyttig i en
          søke-pipeline? Hvordan skiller det seg fra den opprinnelige
          scoringen (f.eks. cosine similarity)? Forstå hvorfor første-steg-søk
          (retrieval) ikke alltid gir optimal rangering.
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed mt-2">
          Implementer deretter et reranking-steg som tar de semantiske
          søkeresultatene og bruker en LLM til å vurdere og sortere dem på
          nytt basert på relevans til den opprinnelige spørringen. Vis de
          rerankede resultatene i en ny kolonne eller som en toggle i UI-et.
        </p>
        <p className="text-xs text-foreground/50 mt-2 italic">
          Læringsmål: Forstå hvorfor første-steg-søk (retrieval) ikke alltid
          gir optimal ranking, og hvordan en andre vurdering (reranking) kan
          forbedre relevansen.
        </p>
        <p className="text-xs text-foreground/50 mt-1">
          Filer:{" "}
          <FilePathCopy path="src/pages/api/embeddings/search.ts" /> for
          backend,{" "}
          <FilePathCopy path="src/pages/embeddings.tsx" /> for UI
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
            Kode
          </span>
          <span className="text-xs text-foreground/50">~60 min</span>
        </div>
        <h3 className="font-semibold text-sm mb-1">
          5. Anbefalingsforklaring
        </h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Bygg en &quot;Hvorfor denne anbefalingen?&quot;-komponent som
          vises når man klikker en anbefalt film. Bruk structured outputs (
          <code className="bg-foreground/5 px-1 rounded">
            generateObject
          </code>{" "}
          med et Zod-schema) til å generere en forklaring av likheten —
          felles temaer, lignende stemning, overlappende sjangre.
        </p>
        <p className="text-xs text-foreground/50 mt-2 italic">
          Læringsmål: Kombinere AI-features (embeddings + structured
          outputs), komponent-komposisjon, UX-design.
        </p>
        <p className="text-xs text-foreground/50 mt-1">
          Filer: Ny komponent i{" "}
          <FilePathCopy path="src/components/embeddings/" />, nytt schema i{" "}
          <FilePathCopy path="src/lib/schemas.ts" />, ny API-route eller
          utvid{" "}
          <FilePathCopy path="src/pages/api/embeddings/similar.ts" />
        </p>
      </div>
    </div>
  );
}
