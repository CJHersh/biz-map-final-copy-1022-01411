import { useState, useEffect } from "react";

export interface GlobalPolicies {
  communicationPolicy: string;
  triggerLogic: string;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  status: "published" | "draft";
  actionCount: number;
  domainId: string;
  communicationPolicy: string;
  eligibilityPolicy: string;
  triggerLogic: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Domain {
  id: string;
  name: string;
  description: string;
  status: "published" | "draft";
  communicationPolicy: string;
  eligibilityPolicy: string;
  triggerLogic: string;
  products: Product[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Action {
  id: string;
  name: string;
  description: string;
  businessGoal: 1 | 2 | 3 | 4 | 5;
  financialValue: number;
  availability: "always" | "not-available" | "date-range";
  availabilityStart?: Date;
  availabilityEnd?: Date;
  communicationPolicy: string;
  eligibilityPolicy: string;
  triggerLogic: string;
  status: "published" | "draft";
  productId: string;
  domainId: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  volume?: number;
  impressionRate?: number;
  conversionRate?: number;
}

const STORAGE_KEY = "business-map-data";

export const useBusinessMap = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [globalPolicies, setGlobalPolicies] = useState<GlobalPolicies>({
    communicationPolicy: "",
    triggerLogic: "",
    updatedAt: new Date(),
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setDomains(
        parsed.domains.map((d: Domain) => ({
          ...d,
          status: d.status || "draft",
          communicationPolicy: d.communicationPolicy || "",
          eligibilityPolicy: d.eligibilityPolicy || "",
          triggerLogic: d.triggerLogic || "",
          createdAt: new Date(d.createdAt),
          updatedAt: new Date(d.updatedAt),
          products: d.products.map((p: Product) => ({
            ...p,
            communicationPolicy: p.communicationPolicy || "",
            eligibilityPolicy: p.eligibilityPolicy || "",
            triggerLogic: p.triggerLogic || "",
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
          })),
        }))
      );
      setActions(
        parsed.actions.map((a: Action) => ({
          ...a,
          createdBy: a.createdBy || "System",
          triggerLogic: a.triggerLogic || "",
          createdAt: new Date(a.createdAt),
          updatedAt: new Date(a.updatedAt),
          availabilityStart: a.availabilityStart ? new Date(a.availabilityStart) : undefined,
          availabilityEnd: a.availabilityEnd ? new Date(a.availabilityEnd) : undefined,
        }))
      );
      if (parsed.globalPolicies) {
        setGlobalPolicies({
          ...parsed.globalPolicies,
          updatedAt: new Date(parsed.globalPolicies.updatedAt),
        });
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ domains, actions, globalPolicies }));
  }, [domains, actions, globalPolicies]);

  return {
    domains,
    setDomains,
    actions,
    setActions,
    globalPolicies,
    setGlobalPolicies,
  };
};
