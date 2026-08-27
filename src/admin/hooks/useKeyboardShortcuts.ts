import { useEffect } from "react";

interface ShortcutHandlers {
  onSave?: () => void;
  onPublish?: () => void;
  onPreview?: () => void;
  onCloseModal?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;

      if (isMeta && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handlers.onSave?.();
      } else if (isMeta && e.key.toLowerCase() === "p" && e.shiftKey) {
        e.preventDefault();
        handlers.onPublish?.();
      } else if (isMeta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        handlers.onPreview?.();
      } else if (e.key === "Escape") {
        handlers.onCloseModal?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlers]);
}
