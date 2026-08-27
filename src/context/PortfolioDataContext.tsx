import React, { createContext, useEffect, useState } from "react";
import { PortfolioReleasePayload } from "../types/portfolio";
import { DEFAULT_PORTFOLIO_CONFIG } from "../constants/defaults";
import { fetchActiveRelease } from "../services/portfolioData";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export interface PortfolioDataContextType {
  data: PortfolioReleasePayload;
  isLoading: boolean;
  isRemoteLoaded: boolean;
  refreshData: () => Promise<void>;
}

export const PortfolioDataContext = createContext<PortfolioDataContextType>({
  data: DEFAULT_PORTFOLIO_CONFIG,
  isLoading: false,
  isRemoteLoaded: false,
  refreshData: async () => {},
});

export const PortfolioDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<PortfolioReleasePayload>(DEFAULT_PORTFOLIO_CONFIG);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRemoteLoaded, setIsRemoteLoaded] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const activeData = await fetchActiveRelease();
      setData(activeData);
      setIsRemoteLoaded(true);

      // Reconcile ScrollTrigger layout if remote data was populated
      if (typeof window !== "undefined" && ScrollTrigger) {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
        });
      }
    } catch {
      // Fallback silently remains active
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <PortfolioDataContext.Provider
      value={{
        data,
        isLoading,
        isRemoteLoaded,
        refreshData: loadData,
      }}
    >
      {children}
    </PortfolioDataContext.Provider>
  );
};
