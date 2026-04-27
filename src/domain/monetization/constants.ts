import type { CreditBalance, FeatureAccess, UserPlan, UsageLimit } from './types';

export const FREE_PLAN_FEATURE_ACCESS: FeatureAccess = {
  premiumVisualStyles: false,
  longCampaignAccess: false,
  duoModeAccess: false,
  bookExportAccess: false,
  premiumModelTurns: false,
};

export const FREE_PLAN_USAGE_LIMIT: UsageLimit = {
  dailyTurnLimit: 20,
  activeStoryLimit: 2,
  dailyImageCreditLimit: 0,
  dailyPremiumModelTurnLimit: 0,
};

export const FREE_PLAN_DEFAULT_CREDITS: CreditBalance = {
  imageCredits: 0,
  premiumModelCredits: 0,
};

export const DEFAULT_FREE_USER_PLAN: UserPlan = {
  planId: 'free',
  planTier: 'free',
  featureAccess: FREE_PLAN_FEATURE_ACCESS,
  usageLimit: FREE_PLAN_USAGE_LIMIT,
  creditBalance: FREE_PLAN_DEFAULT_CREDITS,
};

export function getDefaultPlanAccess(): UserPlan {
  return DEFAULT_FREE_USER_PLAN;
}
