import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative w-14 h-8 rounded-full p-1 transition-all duration-500",
        "bg-muted hover:bg-muted/80",
        "focus:outline-none focus:ring-2 focus:ring-primary/50"
      )}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div
        className={cn(
          "absolute w-6 h-6 rounded-full transition-all duration-500 flex items-center justify-center",
          "bg-primary text-primary-foreground shadow-md",
          theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
        )}
      >
        {theme === 'light' ? (
          <Sun className="w-4 h-4 animate-spin-slow" />
        ) : (
          <Moon className="w-4 h-4 animate-pulse-soft" />
        )}
      </div>
    </button>
  );
}
