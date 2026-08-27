import { ScrollSmoother } from "gsap/ScrollSmoother";

export let smoother: ScrollSmoother | null = null;

export const setSmootherInstance = (instance: ScrollSmoother | null) => {
  smoother = instance;
};

export const getSmootherInstance = () => {
  return smoother;
};
