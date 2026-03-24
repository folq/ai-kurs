import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    href: "/prompting",
    number: 1,
    title: "Prompting",
    description:
      "Learn how system prompts shape AI behavior. Experiment with different prompt strategies and parameters like temperature to control how the AI recommends movies.",
    concepts: [
      "System Prompts",
      "Temperature",
      "Max Tokens",
      "Prompt Patterns",
    ],
    color: "bg-blue-500/10 border-blue-500/20",
  },
  {
    href: "/structured-outputs",
    number: 2,
    title: "Structured Outputs",
    description:
      "Extract structured, typed JSON from free-form text using Zod schemas. See how the AI can reliably parse movie descriptions, reviews, and content into well-defined data structures.",
    concepts: [
      "Zod Schemas",
      "Output.object()",
      "Type Safety",
      "Data Extraction",
    ],
    color: "bg-green-500/10 border-green-500/20",
  },
  {
    href: "/embeddings",
    number: 3,
    title: "Embeddings & Vector Search",
    description:
      "Understand how text embeddings capture meaning as vectors. Compare semantic search (finding movies by concept) against traditional keyword matching side-by-side.",
    concepts: [
      "Embeddings",
      "Vector Similarity",
      "sqlite-vec",
      "Cosine Distance",
    ],
    color: "bg-purple-500/10 border-purple-500/20",
  },
  {
    href: "/agent",
    number: 4,
    title: "Agent with Tools",
    description:
      "Bring it all together with a conversational agent that can search movies, manage favorites, and find recommendations — all by deciding which tools to call and when.",
    concepts: ["Tool Calling", "Agent Loop", "Multi-step", "Tool Composition"],
    color: "bg-orange-500/10 border-orange-500/20",
  },
];

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          AI in Web Development
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A hands-on course exploring four key areas of AI integration, built
          around a movie and TV show discovery app. Each section introduces a
          concept you can experiment with directly.
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
            <h3 className="font-semibold text-sm mb-2">Tech Stack</h3>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Next.js 16",
                "TypeScript",
                "Vercel AI SDK",
                "Azure OpenAI",
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
