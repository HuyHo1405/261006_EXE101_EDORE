export type OrderStatus = "PENDING" | "PAID" | "CANCELLED" | "EXPIRED" | "FAILED";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED" | "CANCELLED";

export interface SubscriptionPlanDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  maxCourses?: number;
  maxScriptsPerCourse?: number;
  maxStudentsPerClass?: number;
  isActive: boolean;
  features: string[];
}

export interface SubscriptionStatusResponseDTO {
  planName: string;
  planDescription: string;
  maxCourses: number;
  maxScriptsPerCourse: number;
  currentCourseCount: number;
  startDate: string;
  endDate: string;
  status: string;
}

export interface OrderResponseDTO {
  id: string;
  userId: string;
  subscriptionPlanId: number;
  subscriptionPlanName: string;
  amount: number;
  status: OrderStatus;
  gatewayOrderCode: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentResponseDTO {
  id: string;
  orderId: string;
  userId: string;
  subscriptionPlanId: number;
  subscriptionPlanName: string;
  provider: string;
  transactionId?: string;
  amount: number;
  status: PaymentStatus;
  paidAt?: string;
  createdAt: string;
}

export interface CreatePaymentLinkResponseDTO {
  checkoutUrl: string;
  orderCode: number;
  amount: number;
  provider: string;
}

export interface UserProfileResponse {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  username?: string;
  avatarUrl?: string;
  role?: string;
  createdAt?: string;
}

export interface UserSettingsResponse {
  userId: string;
  enableFactCheckVerification: boolean;
  theme?: string;
  language?: string;
}

export interface UserSettingsUpdateRequest {
  enableFactCheckVerification?: boolean;
  theme?: string;
  language?: string;
}

export interface UserUpdateRequest {
  fullName?: string;
  phone?: string;
}

