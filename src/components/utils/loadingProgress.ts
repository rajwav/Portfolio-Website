export const setProgress = (setLoading: (value: number) => void) => {
  let percent = 0;
  let interval: ReturnType<typeof setInterval> | null = null;
  let isFinishing = false;
  let loadedPromise: Promise<number> | null = null;

  interval = setInterval(() => {
    if (isFinishing) return;
    if (percent <= 65) {
      const rand = Math.floor(Math.random() * 4) + 2;
      percent = Math.min(65, percent + rand);
      setLoading(percent);
    } else if (percent < 90) {
      percent += 1;
      setLoading(percent);
    }
  }, 80);

  // Safety fallback after 6 seconds so user is never stranded
  const safetyTimeout = setTimeout(() => {
    if (!isFinishing) {
      loaded();
    }
  }, 6000);

  function clear() {
    if (interval) clearInterval(interval);
    clearTimeout(safetyTimeout);
    isFinishing = true;
    percent = 100;
    setLoading(100);
  }

  function loaded(): Promise<number> {
    if (loadedPromise) return loadedPromise;
    isFinishing = true;
    if (interval) clearInterval(interval);
    clearTimeout(safetyTimeout);

    loadedPromise = new Promise<number>((resolve) => {
      const finishInterval = setInterval(() => {
        if (percent < 100) {
          const step = Math.max(2, Math.floor((100 - percent) * 0.35));
          percent = Math.min(100, percent + step);
          setLoading(percent);
        } else {
          clearInterval(finishInterval);
          setLoading(100);
          resolve(100);
        }
      }, 20);
    });

    return loadedPromise;
  }

  return { loaded, percent, clear };
};
