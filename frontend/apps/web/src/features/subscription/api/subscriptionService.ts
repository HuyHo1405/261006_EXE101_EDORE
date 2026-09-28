import { apiClient } from "@/lib/fetcher";

export interface SubscriptionPlanDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  maxCourses?: number;
  maxStudentsPerClass?: number;
  isActive: boolean;
  features: string[];
}

export const subscriptionService = {
  getActivePlans: async (): Promise<SubscriptionPlanDTO[]> => {
    try {
      const res = await apiClient<SubscriptionPlanDTO[]>("/api/v1/subscription-plans");
      return res.result || [];
    } catch {
      return [];
    }
  },
};
