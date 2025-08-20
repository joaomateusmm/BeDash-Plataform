"use client";

import { useEffect, useState } from "react";
import { useAction } from "next-safe-action/hooks";

import { checkUserAccess, AccessLevel } from "@/actions/check-user-access";
import { authClient } from "@/lib/auth-client";

interface TrialLimits {
  maxClients: number;
  maxDoctors: number;
  maxAppointmentsPerMonth: number;
  maxFunctions: number;
}

interface TrialUsage {
  currentClients: number;
  currentDoctors: number;
  currentAppointmentsThisMonth: number;
  currentFunctions: number;
}

export interface TrialMonitor {
  access: AccessLevel | null;
  limits: TrialLimits;
  usage: TrialUsage;
  isLoading: boolean;
  isNearLimit: (resource: keyof TrialUsage) => boolean;
  isAtLimit: (resource: keyof TrialUsage) => boolean;
  getUsagePercentage: (resource: keyof TrialUsage) => number;
}

/**
 * Hook para monitorar o status do trial e limites de uso
 */
export function useTrialMonitor(): TrialMonitor {
  const [access, setAccess] = useState<AccessLevel | null>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);
  const { data: session } = authClient.useSession();

  // Limites do plano Básico (trial)
  const limits: TrialLimits = {
    maxClients: 100,
    maxDoctors: 10,
    maxAppointmentsPerMonth: 100,
    maxFunctions: 10,
  };

  // Estado do uso atual
  const [usage, setUsage] = useState<TrialUsage>({
    currentClients: 0,
    currentDoctors: 0,
    currentAppointmentsThisMonth: 0,
    currentFunctions: 0,
  });

  const { execute: checkAccess, isExecuting: isCheckingAccess } = useAction(
    checkUserAccess,
    {
      onSuccess: ({ data }) => {
        if (data) {
          setAccess(data);
        }
      },
    },
  );

  const fetchUsage = async () => {
    if (!session?.user?.id) return;

    setIsLoadingUsage(true);
    try {
      const response = await fetch("/api/trial-usage");
      if (response.ok) {
        const data = await response.json();
        setUsage({
          currentClients: data.currentClients || 0,
          currentDoctors: data.currentDoctors || 0,
          currentAppointmentsThisMonth: data.currentAppointmentsThisMonth || 0,
          currentFunctions: data.currentFunctions || 0,
        });
      }
    } catch (error) {
      console.error("Erro ao buscar dados de uso:", error);
    } finally {
      setIsLoadingUsage(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      checkAccess({});
      fetchUsage();

      // Atualizar a cada 2 minutos
      const interval = setInterval(
        () => {
          checkAccess({});
          fetchUsage();
        },
        2 * 60 * 1000,
      );

      return () => clearInterval(interval);
    }
  }, [checkAccess, session?.user?.id]);

  const isNearLimit = (resource: keyof TrialUsage): boolean => {
    const percentage = getUsagePercentage(resource);
    return percentage >= 80; // 80% do limite
  };

  const isAtLimit = (resource: keyof TrialUsage): boolean => {
    const percentage = getUsagePercentage(resource);
    return percentage >= 100;
  };

  const getUsagePercentage = (resource: keyof TrialUsage): number => {
    const currentUsage = usage[resource];
    const maxLimit = limits[getCorrespondingLimit(resource)];
    return Math.min((currentUsage / maxLimit) * 100, 100);
  };

  const getCorrespondingLimit = (
    resource: keyof TrialUsage,
  ): keyof TrialLimits => {
    const mapping: Record<keyof TrialUsage, keyof TrialLimits> = {
      currentClients: "maxClients",
      currentDoctors: "maxDoctors",
      currentAppointmentsThisMonth: "maxAppointmentsPerMonth",
      currentFunctions: "maxFunctions",
    };
    return mapping[resource];
  };

  return {
    access,
    limits,
    usage,
    isLoading: isCheckingAccess || isLoadingUsage,
    isNearLimit,
    isAtLimit,
    getUsagePercentage,
  };
}
