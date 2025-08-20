import dayjs from "dayjs";

export interface TrialStatus {
  isActive: boolean;
  isExpired: boolean;
  daysRemaining: number;
  endDate: Date | null;
  startDate: Date | null;
}

export interface UserWithTrial {
  id: string;
  plan?: string | null;
  isInTrial?: boolean | null;
  trialStartDate?: Date | null;
  trialEndDate?: Date | null;
}

/**
 * Verifica o status completo do trial de um usuário
 */
export function getTrialStatus(user: UserWithTrial): TrialStatus {
  const now = new Date();

  // Se não está em trial, retorna status inativo
  if (!user.isInTrial || !user.trialEndDate) {
    return {
      isActive: false,
      isExpired: false,
      daysRemaining: 0,
      endDate: null,
      startDate: null,
    };
  }

  const endDate = new Date(user.trialEndDate);
  const startDate = user.trialStartDate ? new Date(user.trialStartDate) : null;
  const isExpired = now > endDate;
  const daysRemaining = Math.max(0, dayjs(endDate).diff(dayjs(now), "day"));

  return {
    isActive: !isExpired,
    isExpired,
    daysRemaining,
    endDate,
    startDate,
  };
}

/**
 * Verifica se o trial do usuário está ativo
 */
export function isTrialActive(user: UserWithTrial): boolean {
  return getTrialStatus(user).isActive;
}

/**
 * Verifica se o trial do usuário expirou
 */
export function isTrialExpired(user: UserWithTrial): boolean {
  return getTrialStatus(user).isExpired;
}

/**
 * Retorna quantos dias restam no trial
 */
export function getTrialDaysRemaining(user: UserWithTrial): number {
  return getTrialStatus(user).daysRemaining;
}

/**
 * Verifica se o usuário tem acesso completo (trial ativo ou plano pago)
 */
export function hasFullAccess(user: UserWithTrial): boolean {
  // Se tem plano pago e não está em trial
  if (user.plan && user.plan !== "Básico_trial" && !user.isInTrial) {
    return true;
  }

  // Se está em trial e o trial está ativo
  if (user.isInTrial && isTrialActive(user)) {
    return true;
  }

  return false;
}

/**
 * Verifica se o usuário deve ver alertas de trial próximo ao fim
 */
export function shouldShowTrialWarning(user: UserWithTrial): boolean {
  const status = getTrialStatus(user);
  return status.isActive && status.daysRemaining <= 3;
}

/**
 * Verifica se o usuário deve ver alertas urgentes de trial
 */
export function shouldShowUrgentTrialWarning(user: UserWithTrial): boolean {
  const status = getTrialStatus(user);
  return status.isActive && status.daysRemaining <= 1;
}

/**
 * Cria as datas de trial para um novo usuário (15 dias a partir de hoje)
 */
export function createTrialDates() {
  const now = new Date();
  const trialStartDate = now;
  const trialEndDate = dayjs(now).add(15, "days").toDate();

  return {
    trialStartDate,
    trialEndDate,
  };
}
