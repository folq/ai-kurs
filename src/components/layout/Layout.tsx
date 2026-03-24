import { Navigation } from "./Navigation";
import { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>{children}</main>
    </div>
  );
}
