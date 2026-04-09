import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    href: "/prompting",
    number: 1,
    title: "Prompting",
    description:
      "Lær hvordan systemprompter former AI-ens oppførsel. Eksperimenter med ulike promptstrategier og parametere som temperatur for å styre hvordan AI-en anbefaler filmer.",
    concepts: ["Systemprompter", "Temperatur", "Maks tokens", "Promptmønstre"],
    color: "bg-teal-50 border-teal-300",
  },
  {
    href: "/structured-outputs",
    number: 2,
    title: "Strukturerte output",
    description:
      "Hent ut strukturert, typet JSON fra fritekst ved hjelp av Zod-schemas. Se hvordan AI-en pålitelig kan tolke filmbeskrivelser, anmeldelser og innhold til veldefinerte datastrukturer.",
    concepts: [
      "Zod Schemas",
      "Output.object()",
      "Typesikkerhet",
      "Datautvinning",
    ],
    color: "bg-information-25 border-information-300",
  },
  {
    href: "/embeddings",
    number: 3,
    title: "Embeddings og vektorsøk",
    description:
      "Forstå hvordan tekstembeddings fanger mening som vektorer. Sammenlign semantisk søk (finn filmer etter konsept) mot tradisjonell nøkkelordmatching side om side.",
    concepts: ["Embeddings", "Vektorlikhet", "sqlite-vec", "Kosinusavstand"],
    color: "bg-cornflower-100 border-cornflower-300",
  },
  {
    href: "/agent",
    number: 4,
    title: "Agent med verktøy",
    description:
      "Sett alt sammen med en samtalende agent som kan søke etter filmer, håndtere favoritter og finne anbefalinger — alt ved å bestemme hvilke verktøy den skal bruke og når.",
    concepts: ["Verktøykall", "Agent-løkke", "Flersteg", "Verktøykomposisjon"],
    color: "bg-tiger-lily-05 border-tiger-lily-200",
  },
];

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          AI i webutvikling
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Et praktisk kurs som utforsker fire viktige områder innen
          AI-integrasjon, bygget rundt en app for å oppdage filmer og TV-serier.
          Hver seksjon introduserer et konsept du kan eksperimentere med
          direkte.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => (
          <Link key={section.href} href={section.href} className="group">
            <Card
              className={`h-full transition-all hover:shadow-md border-2 ${section.color} group-hover:scale-[1.01]`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-muted-foreground/50">
                    {section.number}
                  </span>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {section.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {section.concepts.map((concept) => (
                    <Badge
                      key={concept}
                      variant="secondary"
                      className="text-xs"
                    >
                      {concept}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Card className="inline-block text-left">
          <CardContent className="py-4 px-6">
            <h3 className="font-semibold text-sm mb-2">Teknologier</h3>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Next.js 16",
                "TypeScript",
                "Vercel AI SDK",
                "Vercel AI Gateway",
                "SQLite + sqlite-vec",
                "Tailwind CSS",
                "shadcn/ui",
                "Zod",
              ].map((tech) => (
                <Badge key={tech} variant="outline" className="text-xs">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
