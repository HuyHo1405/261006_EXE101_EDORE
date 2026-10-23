import { apiClient } from "@/lib/fetcher";
import { OrderResponseDTO, PaymentResponseDTO, PageResponseDTO } from "@edore/types";
export interface AdminUserResponse {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role?: string;
  status?: string;
  isActive?: boolean;
  plan?: string;
  createdAt?: string;
}

export interface AdminDashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  paidOrdersCount: number;
  pendingOrdersCount: number;
  cancelledOrdersCount: number;
  totalUsers: number;
  mrr: number;
  conversionRate: number;
  recentOrders: OrderResponseDTO[];
  recentPayments: PaymentResponseDTO[];
}

export const adminDashboardService = {
  // Get all orders (Admin)
  getAllOrders: async (page: number = 0, size: number = 20, status?: string): Promise<PageResponseDTO<OrderResponseDTO>> => {
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        ...(status && status !== "ALL" ? { status } : {}),
      });
      const res = await apiClient<PageResponseDTO<OrderResponseDTO>>(`/api/v1/admin/orders?${query.toString()}`);
      return res.result || { content: [], pageNumber: 0, pageSize: size, totalElements: 0, totalPages: 0, isLast: true, isFirst: true };
    } catch (err: any) {
      console.warn("[AdminService] API /api/v1/admin/orders lỗi:", err?.message || err);
      return { content: [], pageNumber: 0, pageSize: size, totalElements: 0, totalPages: 0, isLast: true, isFirst: true };
    }
  },

  // Get all payment transactions (Admin)
  getAllPayments: async (page: number = 0, size: number = 20, status?: string): Promise<PageResponseDTO<PaymentResponseDTO>> => {
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        ...(status && status !== "ALL" ? { status } : {}),
      });
      const res = await apiClient<PageResponseDTO<PaymentResponseDTO>>(`/api/v1/admin/orders/payments?${query.toString()}`);
      return res.result || { content: [], pageNumber: 0, pageSize: size, totalElements: 0, totalPages: 0, isLast: true, isFirst: true };
    } catch (err: any) {
      console.warn("[AdminService] API /api/v1/admin/orders/payments lỗi:", err?.message || err);
      return { content: [], pageNumber: 0, pageSize: size, totalElements: 0, totalPages: 0, isLast: true, isFirst: true };
    }
  },

  // Get all users (Admin)
  getAllUsers: async (page: number = 0, size: number = 20, search?: string, isActive?: boolean): Promise<PageResponseDTO<AdminUserResponse>> => {
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        ...(search ? { search } : {}),
        ...(isActive !== undefined ? { isActive: isActive.toString() } : {}),
      });
      const res = await apiClient<PageResponseDTO<AdminUserResponse>>(`/api/v1/admin/users?${query.toString()}`);
      return res.result || { content: [], pageNumber: 0, pageSize: size, totalElements: 0, totalPages: 0, isLast: true, isFirst: true };
    } catch (err: any) {
      console.warn("[AdminService] API /api/v1/admin/users lỗi:", err?.message || err);
      return { content: [], pageNumber: 0, pageSize: size, totalElements: 0, totalPages: 0, isLast: true, isFirst: true };
    }
  },

  // Aggregate metrics for Admin Dashboard Overview (Số liệu thực tế 100% từ Database)
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

      const totalOrdersCount = ordersPage.totalElements || orders.length;
      const conversionRate = totalOrdersCount > 0 ? Math.round((paidOrders.length / totalOrdersCount) * 100) : 0;
      const mrr = paidOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

      return {
        totalRevenue,
        totalOrders: totalOrdersCount,
        paidOrdersCount: paidOrders.length,
        pendingOrdersCount: pendingOrders.length,
        cancelledOrdersCount: cancelledOrders.length,
        totalUsers: usersPage.totalElements || users.length,
        mrr,
        conversionRate,
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
        mrr: 0,
        conversionRate: 0,
        recentOrders: [],
        recentPayments: [],
      };
    }
  },
};

