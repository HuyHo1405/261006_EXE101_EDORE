import { apiClient } from "@/lib/fetcher";
import {
  SubscriptionPlanDTO,
  SubscriptionStatusResponseDTO,
  OrderResponseDTO,
  PaymentResponseDTO,
  CreatePaymentLinkResponseDTO,
  PageResponseDTO,
} from "@edore/types";

export const subscriptionService = {
  // Get public subscription plans
  getActivePlans: async (): Promise<SubscriptionPlanDTO[]> => {
    try {
      const res = await apiClient<SubscriptionPlanDTO[]>("/api/v1/subscription-plans");
      return res.result || [];
    } catch {
      return [];
    }
  },

  // Get current user's active subscription status & quotas
  getMySubscriptionStatus: async (): Promise<SubscriptionStatusResponseDTO | null> => {
    try {
      const res = await apiClient<SubscriptionStatusResponseDTO>("/api/v1/subscriptions/me");
      return res.result || null;
    } catch {
      return null;
    }
  },

  // Verify payment status after gateway redirect
  verifyPayment: async (orderCode: string): Promise<OrderResponseDTO> => {
    const res = await apiClient<OrderResponseDTO>(`/api/v1/orders/payment/verify?orderCode=${encodeURIComponent(orderCode)}`);
    if (!res.result) {
      throw new Error(res.message || "Không thể xác minh đơn hàng");
    }
    return res.result;
  },

  // Create order for a subscription plan
  createOrder: async (subscriptionPlanId: number): Promise<OrderResponseDTO> => {
    const res = await apiClient<OrderResponseDTO>("/api/v1/orders", {
      method: "POST",
      body: JSON.stringify({ subscriptionPlanId }),
    });
    if (!res.result) {
      throw new Error(res.message || "Tạo đơn hàng thất bại");
    }
    return res.result;
  },

  // Checkout order and get gateway payment link
  checkoutOrder: async (orderId: string, provider: string = "PAYOS"): Promise<CreatePaymentLinkResponseDTO> => {
    const res = await apiClient<CreatePaymentLinkResponseDTO>(`/api/v1/orders/${orderId}/checkout?provider=${provider}`, {
      method: "POST",
    });
    if (!res.result) {
      throw new Error(res.message || "Tạo liên kết thanh toán thất bại");
    }
    return res.result;
  },

  // Get user's own orders (paginated)
  getMyOrders: async (page: number = 0, size: number = 10, status?: string): Promise<PageResponseDTO<OrderResponseDTO>> => {
    const query = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...(status ? { status } : {}),
    });
    const res = await apiClient<PageResponseDTO<OrderResponseDTO>>(`/api/v1/orders/my?${query.toString()}`);
    return res.result || { content: [], pageNumber: 0, pageSize: size, totalElements: 0, totalPages: 0, isLast: true, isFirst: true };
  },

  // Get user's own payment transactions (paginated)
  getMyPayments: async (page: number = 0, size: number = 10, status?: string): Promise<PageResponseDTO<PaymentResponseDTO>> => {
    const query = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...(status ? { status } : {}),
    });
    const res = await apiClient<PageResponseDTO<PaymentResponseDTO>>(`/api/v1/orders/payments/my?${query.toString()}`);
    return res.result || { content: [], pageNumber: 0, pageSize: size, totalElements: 0, totalPages: 0, isLast: true, isFirst: true };
  },
};
