import { useContext } from "react";
import { PortfolioDataContext, PortfolioDataContextType } from "./PortfolioDataContext";

export const usePortfolioData = (): PortfolioDataContextType => {
  return useContext(PortfolioDataContext);
};
