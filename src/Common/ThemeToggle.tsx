import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/Common/theme-provider"
import PrimaryButton from "@/Common/PrimaryButton";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const handleToggle = (e: React.MouseEvent) => {
    const nextTheme = theme === "dark" ? "light" : "dark";

    // Calculate the center of the button
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    document.documentElement.style.setProperty("--x", `${x}px`);
    document.documentElement.style.setProperty("--y", `${y}px`);

    // Fallback for browsers that don't support View Transitions
    if (!(document as any).startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    // Add a class to indicate the direction of the transition
    document.documentElement.classList.add(
      nextTheme === "dark" ? "theme-to-dark" : "theme-to-light",
    );

    const transition = (document as any).startViewTransition(() => {
      setTheme(nextTheme);
    });

    // Clean up classes after the transition finishes
    transition.finished.finally(() => {
      document.documentElement.classList.remove(
        "theme-to-dark",
        "theme-to-light",
      );
    });
  };

  return (
    <PrimaryButton
      type="Outline"
      onClick={handleToggle}
      tooltip="Toggle theme"
      className="shrink-0 h-12 w-12 rounded-lg flex items-center justify-center relative cursor-pointer"
    >
      <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </PrimaryButton>
  )
}
