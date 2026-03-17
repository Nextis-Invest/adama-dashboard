"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type HeaderTab = "logements" | "transfert" | "services";

interface HeaderTabContextValue {
  activeTab: HeaderTab;
  setActiveTab: (tab: HeaderTab) => void;
}

const HeaderTabContext = createContext<HeaderTabContextValue>({
  activeTab: "logements",
  setActiveTab: () => {},
});

export function HeaderTabProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<HeaderTab>("logements");
  return (
    <HeaderTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </HeaderTabContext.Provider>
  );
}

export function useHeaderTab() {
  return useContext(HeaderTabContext);
}
