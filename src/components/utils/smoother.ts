import { ScrollSmoother } from "gsap-trial/ScrollSmoother";

export let smoother: ScrollSmoother | null = null;

export const setSmootherInstance = (instance: ScrollSmoother | null) => {
  smoother = instance;
};

export const getSmootherInstance = () => {
  return smoother;
};
