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
      // Clipboard can fail without permission; no toast in this UI
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

export function PromptingTasks() {
  return (
    <div className="max-w-2xl space-y-4">
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="mb-2">
          <span className="text-xs font-semibold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
            UI
          </span>
        </div>
        <h3 className="font-semibold text-sm mb-1">1. Rolle-eksperiment</h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Bytt mellom de fire prompt-presetene (Standard assistent,
          Filmkritiker, Spoilerfri guide, Sjangerekspert) med{" "}
          <em>samme spørsmål</em>. Observer hvordan AI-ens tone, detaljer og
          perspektiv endres.
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-5">
        <div className="mb-2">
          <span className="text-xs font-semibold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
            UI
          </span>
        </div>
        <h3 className="font-semibold text-sm mb-1">2. Temperatur-lab</h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Send samme spørsmål 3 ganger med temperatur 0.1, deretter 3 ganger med
          1.5. Sammenlign variasjon og kreativitet mellom kjøringene.
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-5">
        <div className="mb-2">
          <span className="text-xs font-semibold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
            UI
          </span>
        </div>
        <h3 className="font-semibold text-sm mb-1">3. Jailbreak og forsvar</h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Prøv å få AI-en til å bryte ut av sin rolle (f.eks. snakke om noe helt
          annet enn film). Deretter skriv en systemprompt som motstår angrepet.
          Test den igjen.
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-5">
        <div className="mb-2">
          <span className="text-xs font-semibold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
            UI
          </span>
        </div>
        <h3 className="font-semibold text-sm mb-1">
          4. Vinner den &laquo;beste&raquo; modellen alltid?
        </h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Bruk Modellsammenligning med 3–4 modeller. Test med ulike typer
          filmspørsmål — et faktabasert (f.eks. &laquo;Hvilke filmer vant
          Gullpalmen på 2020-tallet?&raquo;), et kreativt (f.eks. &laquo;Pitch
          en originalfilm som blander noir og sci-fi&raquo;) og et som krever et
          kort, konsist svar (f.eks. &laquo;Anbefal én skrekk&shy;film på under
          90 minutter&raquo;). Kjør judge for hvert. Vinner den
          &laquo;sterkeste&raquo; modellen hver gang, eller avhenger det av
          oppgavetypen?
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-5">
        <div className="mb-2">
          <span className="text-xs font-semibold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
            UI
          </span>
        </div>
        <h3 className="font-semibold text-sm mb-1">5. Dommer-bias</h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Spør om en filmanbefaling i Modellsammenligning og kjør judge — noter
          rangeringen. Bytt deretter judge-modell og kjør på nytt med de samme
          svarene. Er rangeringen den samme? Reflekter over hva forskjellene
          sier om dommerens egne biaser.
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-5">
        <div className="mb-2">
          <span className="text-xs font-semibold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
            UI
          </span>
        </div>
        <h3 className="font-semibold text-sm mb-1">
          6. Er du enig med dommeren?
        </h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Be om filmanbefalinger i Modellsammenligning. Les svarene selv og lag
          din egen rangering <em>før</em> du trykker &laquo;Kjør judge&raquo;.
          Hvilken modell ga de beste filmtipsene? Sammenlign din vurdering med
          dommerens — hvor er dere enige og uenige? Prøv å formulere hvorfor
          dommeren vurderte annerledes.
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-5">
        <div className="mb-2">
          <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
            Kode
          </span>
        </div>
        <h3 className="font-semibold text-sm mb-1">7. Ny prompt-preset</h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Legg til en ny prompt-preset med en kreativ persona (f.eks.
          &quot;Filmhistoriker fra 1920-tallet&quot; eller &quot;Overdramatisk
          filmelsker&quot;). Legg den til i preset-listen og test at den
          fungerer i UI-et.
        </p>
        <p className="text-xs text-foreground/50 mt-2">
          Hint: Presetene er definert som et objekt i{" "}
          <FilePathCopy path="src/pages/prompting.tsx" />
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-5">
        <div className="mb-2">
          <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
            Kode
          </span>
        </div>
        <h3 className="font-semibold text-sm mb-1">
          8. Egendefinerte evalueringskriterier for LLM-dommer
        </h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Utvid LLM-as-judge med et felt der brukeren skriver inn hva dommeren
          skal vurdere (f.eks. &quot;humor&quot;, &quot;nøyaktighet&quot;,
          &quot;kreativitet&quot;). Send kriteriene med i judge-prompten og vis
          dem i resultatet.
        </p>
        <p className="text-xs text-foreground/50 mt-2 flex flex-wrap items-baseline gap-x-1 gap-y-1">
          <span>Filer:</span>
          <FilePathCopy path="src/components/prompting/JudgePanel.tsx" />
          <span aria-hidden>,</span>
          <FilePathCopy path="src/app/api/prompting/judge/route.ts" />
        </p>
      </div>
    </div>
  );
}
