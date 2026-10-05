import { apiClient } from "@/lib/fetcher";
import { OrderResponseDTO, PaymentResponseDTO, PageResponseDTO } from "@edore/types";

export interface AdminUserResponse {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role?: string;
  status?: string;
  createdAt?: string;
}

export interface AdminDashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  paidOrdersCount: number;
  pendingOrdersCount: number;
  cancelledOrdersCount: number;
  totalUsers: number;
  recentOrders: OrderResponseDTO[];
  recentPayments: PaymentResponseDTO[];
}

export const adminDashboardService = {
  // Get all orders (Admin)
  getAllOrders: async (page: number = 0, size: number = 20, status?: string): Promise<PageResponseDTO<OrderResponseDTO>> => {
    const query = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...(status ? { status } : {}),
    });
    const res = await apiClient<PageResponseDTO<OrderResponseDTO>>(`/api/v1/admin/orders?${query.toString()}`);
    return res.result || { content: [], pageNumber: 0, pageSize: size, totalElements: 0, totalPages: 0, isLast: true, isFirst: true };
  },

  // Get all payment transactions (Admin)
  getAllPayments: async (page: number = 0, size: number = 20, status?: string): Promise<PageResponseDTO<PaymentResponseDTO>> => {
    const query = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...(status ? { status } : {}),
    });
    const res = await apiClient<PageResponseDTO<PaymentResponseDTO>>(`/api/v1/admin/orders/payments?${query.toString()}`);
    return res.result || { content: [], pageNumber: 0, pageSize: size, totalElements: 0, totalPages: 0, isLast: true, isFirst: true };
  },

  // Get all users (Admin)
  getAllUsers: async (page: number = 0, size: number = 20): Promise<PageResponseDTO<AdminUserResponse>> => {
    const query = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    const res = await apiClient<PageResponseDTO<AdminUserResponse>>(`/api/v1/admin/users?${query.toString()}`);
    return res.result || { content: [], pageNumber: 0, pageSize: size, totalElements: 0, totalPages: 0, isLast: true, isFirst: true };
  },

  // Aggregate metrics for Admin Dashboard Overview
  getMetrics: async (): Promise<AdminDashboardMetrics> => {
    try {
      const [ordersPage, paymentsPage, usersPage] = await Promise.all([
        adminDashboardService.getAllOrders(0, 100),
        adminDashboardService.getAllPayments(0, 100),
        adminDashboardService.getAllUsers(0, 100),
      ]);

      const orders = ordersPage.content || [];
      const payments = paymentsPage.content || [];
      const users = usersPage.content || [];

      const paidOrders = orders.filter((o) => o.status === "PAID");
      const pendingOrders = orders.filter((o) => o.status === "PENDING");
      const cancelledOrders = orders.filter((o) => o.status === "CANCELLED" || o.status === "FAILED" || o.status === "EXPIRED");

      const totalRevenue = payments
        .filter((p) => p.status === "SUCCESS")
        .reduce((sum, p) => sum + (p.amount || 0), 0) || paidOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

      return {
        totalRevenue,
        totalOrders: ordersPage.totalElements || orders.length,
        paidOrdersCount: paidOrders.length,
        pendingOrdersCount: pendingOrders.length,
        cancelledOrdersCount: cancelledOrders.length,
        totalUsers: usersPage.totalElements || users.length,
        recentOrders: orders.slice(0, 5),
        recentPayments: payments.slice(0, 5),
      };
    } catch {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        paidOrdersCount: 0,
        pendingOrdersCount: 0,
        cancelledOrdersCount: 0,
        totalUsers: 0,
        recentOrders: [],
        recentPayments: [],
      };
    }
  },
};
