"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { clinicsTable } from "@/db/schema";

type Business = typeof clinicsTable.$inferSelect;

interface ActiveBusinessContextType {
  activeBusiness: Business | null;
  setActiveBusiness: (business: Business) => void;
  businesses: Business[];
  setBusinesses: (businesses: Business[]) => void;
  isLoading: boolean;
  getActiveBusinessId: () => string | null;
}

const ActiveBusinessContext = createContext<
  ActiveBusinessContextType | undefined
>(undefined);

interface ActiveBusinessProviderProps {
  children: ReactNode;
}

export function ActiveBusinessProvider({
  children,
}: ActiveBusinessProviderProps) {
  const [activeBusiness, setActiveBusinessState] = useState<Business | null>(
    null,
  );
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar empresa ativa do localStorage na inicialização
  useEffect(() => {
    const savedBusinessId = localStorage.getItem("activeBusinessId");
    if (savedBusinessId && businesses.length > 0) {
      const savedBusiness = businesses.find((b) => b.id === savedBusinessId);
      if (savedBusiness) {
        setActiveBusinessState(savedBusiness);
      } else if (businesses.length > 0) {
        // Se a empresa salva não existe mais, usar a primeira disponível
        setActiveBusinessState(businesses[0]);
        localStorage.setItem("activeBusinessId", businesses[0].id);
      }
    } else if (businesses.length > 0) {
      // Se não há empresa salva, usar a primeira
      setActiveBusinessState(businesses[0]);
      localStorage.setItem("activeBusinessId", businesses[0].id);
    }
    setIsLoading(false);
  }, [businesses]);

  const setActiveBusiness = (business: Business) => {
    setActiveBusinessState(business);
    localStorage.setItem("activeBusinessId", business.id);

    // Não recarregar a página, apenas atualizar o contexto
    // A página será responsável por recarregar os dados
  };

  const getActiveBusinessId = () => {
    return activeBusiness?.id || localStorage.getItem("activeBusinessId");
  };

  return (
    <ActiveBusinessContext.Provider
      value={{
        activeBusiness,
        setActiveBusiness,
        businesses,
        setBusinesses,
        isLoading,
        getActiveBusinessId,
      }}
    >
      {children}
    </ActiveBusinessContext.Provider>
  );
}

export function useActiveBusiness() {
  const context = useContext(ActiveBusinessContext);
  if (context === undefined) {
    throw new Error(
      "useActiveBusiness must be used within an ActiveBusinessProvider",
    );
  }
  return context;
}
