// useKeyboardShortcuts.ts
import { useEffect, useRef, DependencyList } from "react";
import { CellAddress } from "./DataTableUtils";

interface KeyboardShortcutsOptions {
  selectedCell: CellAddress | null;
  onUndo: () => void;
  onRedo: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onArrowKey: (direction: "up" | "down" | "left" | "right") => void;
  onEnter: () => void;
  onEscape: () => void;
  canNavigate: boolean;
  headersCount: number;
  filteredDataCount: number;
}

export const useKeyboardShortcuts = (
  options: KeyboardShortcutsOptions,
  deps: DependencyList
) => {
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, deps);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const {
        selectedCell,
        onUndo,
        onRedo,
        onCopy,
        onPaste,
        onArrowKey,
        onEnter,
        onEscape,
        canNavigate,
        headersCount,
        filteredDataCount,
      } = optionsRef.current;

      // Don't handle shortcuts when user is typing in an input field
      if (
        e.target instanceof HTMLInputElement &&
        ![
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "Escape",
          "Enter",
        ].includes(e.key)
      ) {
        return;
      }

      // Undo (Ctrl+Z)
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        onUndo();
      }

      // Redo (Ctrl+Y or Ctrl+Shift+Z)
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        onRedo();
      }

      // Copy (Ctrl+C)
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        e.preventDefault();
        onCopy();
      }

      // Paste (Ctrl+V)
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        e.preventDefault();
        onPaste();
      }

      // Arrow key navigation
      if (
        selectedCell &&
        canNavigate &&
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
          e.key
        )
      ) {
        e.preventDefault();
        const { row, col } = selectedCell;

        switch (e.key) {
          case "ArrowUp":
            if (row > 0) onArrowKey("up");
            break;
          case "ArrowDown":
            if (row < filteredDataCount - 1) onArrowKey("down");
            break;
          case "ArrowLeft":
            if (col > 0) onArrowKey("left");
            break;
          case "ArrowRight":
            if (col < headersCount - 1) onArrowKey("right");
            break;
        }
      }

      // Enter key to edit
      if (e.key === "Enter") {
        e.preventDefault();
        onEnter();
      }

      // Escape to deselect
      if (e.key === "Escape") {
        e.preventDefault();
        onEscape();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () =>
      document.removeEventListener("keydown", handleKeyDown);
  }, []);
};
