export const PLAN_IDS = ['free', 'premium'] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export const PLAN_TIERS = ['free', 'premium'] as const;
export type PlanTier = (typeof PLAN_TIERS)[number];

export const PREMIUM_FEATURES = [
  'premiumVisualStyles',
  'longCampaignAccess',
  'duoModeAccess',
  'bookExportAccess',
  'premiumModelTurns',
] as const;

export type PremiumFeature = (typeof PREMIUM_FEATURES)[number];

export type FeatureAccess = Record<PremiumFeature, boolean>;

export interface UsageLimit {
  dailyTurnLimit: number;
  activeStoryLimit: number;
  dailyImageCreditLimit: number;
  dailyPremiumModelTurnLimit: number;
}

export interface CreditBalance {
  imageCredits: number;
  premiumModelCredits: number;
}

export interface UserPlan {
  planId: PlanId;
  planTier: PlanTier;
  featureAccess: FeatureAccess;
  usageLimit: UsageLimit;
  creditBalance: CreditBalance;
}
