"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface VisibilityContextType {
  isValueVisible: boolean;
  toggleVisibility: () => void;
}

const VisibilityContext = createContext<VisibilityContextType | undefined>(
  undefined
);

export function VisibilityProvider({ children }: { children: ReactNode }) {
  const [isValueVisible, setIsValueVisible] = useState(true);

  const toggleVisibility = () => {
    setIsValueVisible((prev) => !prev);
  };

  return (
    <VisibilityContext.Provider value={{ isValueVisible, toggleVisibility }}>
      {children}
    </VisibilityContext.Provider>
  );
}

export function useVisibility() {
  const context = useContext(VisibilityContext);
  if (context === undefined) {
    throw new Error("useVisibility must be used within a VisibilityProvider");
  }
  return context;
}
