export function PromptingTasks() {
  return (
    <div className="max-w-2xl space-y-4">
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
            UI
          </span>
          <span className="text-xs text-foreground/50">~5 min</span>
        </div>
        <h3 className="font-semibold text-sm mb-1">1. Rolle-eksperiment</h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Bytt mellom de fire prompt-presetene (Standard assistent,
          Filmkritiker, Spoilerfri guide, Sjangerekspert) med{" "}
          <em>samme spørsmål</em>. Observer hvordan AI-ens tone, detaljer og
          perspektiv endres.
        </p>
        <p className="text-xs text-foreground/50 mt-2 italic">
          Læringsmål: System prompts setter rammene for AI-ens oppførsel — som
          en stillingsbeskrivelse.
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
            UI
          </span>
          <span className="text-xs text-foreground/50">~10 min</span>
        </div>
        <h3 className="font-semibold text-sm mb-1">2. Temperatur-lab</h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Send samme spørsmål 3 ganger med temperatur 0.1, deretter 3 ganger med
          1.5. Sammenlign variasjon og kreativitet mellom kjøringene.
        </p>
        <p className="text-xs text-foreground/50 mt-2 italic">
          Læringsmål: Temperatur styrer tilfeldighet og kreativitet. Lav =
          forutsigbar, høy = variert.
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
            UI
          </span>
          <span className="text-xs text-foreground/50">~15 min</span>
        </div>
        <h3 className="font-semibold text-sm mb-1">3. Jailbreak og forsvar</h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Prøv å få AI-en til å bryte ut av sin rolle (f.eks. snakke om noe helt
          annet enn film). Deretter skriv en systemprompt som motstår angrepet.
          Test den igjen.
        </p>
        <p className="text-xs text-foreground/50 mt-2 italic">
          Læringsmål: Prompt engineering for sikkerhet og guardrails.
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
            Kode
          </span>
          <span className="text-xs text-foreground/50">~30 min</span>
        </div>
        <h3 className="font-semibold text-sm mb-1">4. Ny prompt-preset</h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Legg til en ny prompt-preset med en kreativ persona (f.eks.
          &quot;Filmhistoriker fra 1920-tallet&quot; eller &quot;Overdramatisk
          filmelsker&quot;). Legg den til i preset-listen og test at den
          fungerer i UI-et.
        </p>
        <p className="text-xs text-foreground/50 mt-2 italic">
          Læringsmål: Hvordan systemprompter struktureres i kode; React-state og
          UI-komponenter.
        </p>
        <p className="text-xs text-foreground/50 mt-1">
          Hint: Presetene er definert som et objekt i{" "}
          <code className="bg-foreground/5 px-1 rounded">
            src/pages/prompting.tsx
          </code>
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
            Kode
          </span>
          <span className="text-xs text-foreground/50">~45 min</span>
        </div>
        <h3 className="font-semibold text-sm mb-1">
          5. Egendefinerte evalueringskriterier for LLM-dommer
        </h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Utvid LLM-as-judge med et felt der brukeren skriver inn hva dommeren
          skal vurdere (f.eks. &quot;humor&quot;, &quot;nøyaktighet&quot;,
          &quot;kreativitet&quot;). Send kriteriene med i judge-prompten og vis
          dem i resultatet.
        </p>
        <p className="text-xs text-foreground/50 mt-2 italic">
          Læringsmål: Prompt engineering for evaluering, API-design, skjema-UX.
        </p>
        <p className="text-xs text-foreground/50 mt-1">
          Filer:{" "}
          <code className="bg-foreground/5 px-1 rounded">
            src/components/prompting/JudgePanel.tsx
          </code>
          ,{" "}
          <code className="bg-foreground/5 px-1 rounded">
            src/app/api/prompting/judge/route.ts
          </code>
        </p>
      </div>
    </div>
  );
}
