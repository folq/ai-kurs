import Link from "next/link";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/prompting", label: "1. Prompting" },
  { href: "/structured-outputs", label: "2. Structured Outputs" },
  { href: "/embeddings", label: "3. Embeddings" },
  { href: "/agent", label: "4. Agent" },
];

export function Navigation() {
  const router = useRouter();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex h-14 items-center gap-6">
          <Link
            href="/"
            className="font-heading font-bold text-lg tracking-tight text-teal-1200"
          >
            AI-Kurs
          </Link>
          <div className="flex gap-1">
            {navItems.slice(1).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  router.pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
