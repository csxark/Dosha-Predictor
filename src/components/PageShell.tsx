import { motion } from "framer-motion";
import { Leaf } from "lucide-react";
import type { ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
  onNavigate?: (page: string) => void;
}

export function PageShell({ children, onNavigate }: PageShellProps) {
  const handleLogoClick = () => {
    if (onNavigate) {
      onNavigate("landing");
    } else {
      // Fallback: reload page
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="top-0 z-30">
        <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2 group hover:opacity-80 transition-opacity cursor-pointer"
          >
            <span className="grid place-items-center h-9 w-9 rounded-xl glass">
              <Leaf className="h-4 w-4 text-accent" />
            </span>
            <span className="font-display text-lg tracking-tight">
              Dosha<span className="text-accent">Predict</span>
            </span>
          </button>
          <span className="text-xs text-muted-foreground hidden sm:block">
            Educational wellness tool — not medical advice
          </span>
        </div>
      </header>
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex-1"
      >
        {children}
      </motion.main>
      <footer className="mx-auto max-w-7xl w-full px-6 py-8 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Dosha Prediction AI · Ancient wisdom, modern intelligence
      </footer>
    </div>
  );
}
