"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp,
  CreditCard,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  BookOpen,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  Layers,
  Globe,
  BarChart3,
  Eye,
  Smartphone,
  Laptop,
  Compass,
  FileText,
  Calendar,
  Percent,
  Radio,
  ExternalLink,
  Shield,
  Zap,
  ArrowDownRight,
  Tag,
  AlertCircle,
  ShieldAlert,
  Lock,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import {
  adminDashboardService,
  AdminDashboardMetrics,
  AdminUserResponse,
} from "@/features/admin/api/adminDashboardService";
import { OrderResponseDTO, PaymentResponseDTO } from "@edore/types";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type AdminTab = "revenue" | "users" | "transactions";

const PLAN_COLORS = ["#034ce4", "#12ab83", "#f28c0f", "#8b5cf6", "#ec4899"];

export default function AdminDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);

  const isAdmin = Boolean(
    user?.roles?.some((r) => r.toUpperCase().includes("ADMIN"))
  );

  const [activeTab, setActiveTab] = useState<AdminTab>("revenue");
  const [loading, setLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<string>("7d");
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // Metrics
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);

  // Orders
  const [allOrders, setAllOrders] = useState<OrderResponseDTO[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("ALL");
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<OrderResponseDTO | null>(null);

  // Payments / Transactions
  const [allPayments, setAllPayments] = useState<PaymentResponseDTO[]>([]);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("ALL");
  const [paymentSearchQuery, setPaymentSearchQuery] = useState<string>("");
  const [selectedPayment, setSelectedPayment] = useState<PaymentResponseDTO | null>(null);

  // Users
  const [allUsers, setAllUsers] = useState<AdminUserResponse[]>([]);
  const [userStatusFilter, setUserStatusFilter] = useState<string>("ALL");
  const [userSearchQuery, setUserSearchQuery] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<AdminUserResponse | null>(null);

  // Biểu đồ Doanh thu 7 ngày thực tế (100% từ Database Orders / Payments)
  const revenueChartData = useMemo(() => {
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const result: { name: string; dateStr: string; revenue: number; orders: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      const dateKey = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
      result.push({
        name: i === 0 ? "Hôm nay" : `${dayName} (${dateKey})`,
        dateStr: d.toDateString(),
        revenue: 0,
        orders: 0,
      });
    }

    (allOrders || []).forEach((ord) => {
      if (ord.status === "PAID" && ord.createdAt) {
        const orderDate = new Date(ord.createdAt).toDateString();
        const target = result.find((r) => r.dateStr === orderDate);
        if (target) {
          target.revenue += ord.amount || 0;
          target.orders += 1;
        }
      }
    });

    return result.map(({ name, revenue, orders }) => ({ name, revenue, orders }));
  }, [allOrders]);

  // Biểu đồ Phân bổ Gói Cước Thực Tế từ Database Orders
  const planPieChartData = useMemo(() => {
    const countMap: Record<string, number> = {};
    (allOrders || []).forEach((o) => {
      const name = o.subscriptionPlanName || "Gói Dịch Vụ";
      countMap[name] = (countMap[name] || 0) + 1;
    });

    const entries = Object.entries(countMap);
    if (entries.length === 0) {
      return [{ name: "Chưa có đơn hàng", value: 1 }];
    }
    return entries.map(([name, value]) => ({ name, value }));
  }, [allOrders]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [met, ordersPage, paymentsPage, usersPage] = await Promise.all([
        adminDashboardService.getMetrics(),
        adminDashboardService.getAllOrders(0, 100),
        adminDashboardService.getAllPayments(0, 100),
        adminDashboardService.getAllUsers(0, 100),
      ]);

      setIsBackendConnected(true);
      setMetrics(met);

      // Gán dữ liệu thực tế 100% nhận từ API Backend
      setAllOrders(ordersPage.content || []);
      setAllPayments(paymentsPage.content || []);
      setAllUsers(usersPage.content || []);
    } catch (err: any) {
      console.error("[AdminDashboard] Lỗi tải dữ liệu:", err);
      setIsBackendConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (_hasHydrated && isAuthenticated && isAdmin) {
      loadData();
    }
  }, [timeRange, _hasHydrated, isAuthenticated, isAdmin]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // Filter orders
  const filteredOrders = allOrders.filter((ord) => {
    const matchesStatus = orderStatusFilter === "ALL" || ord.status === orderStatusFilter;
    const matchesQuery =
      !orderSearchQuery ||
      (ord.gatewayOrderCode && ord.gatewayOrderCode.toString().includes(orderSearchQuery)) ||
      (ord.subscriptionPlanName && ord.subscriptionPlanName.toLowerCase().includes(orderSearchQuery.toLowerCase())) ||
      (ord.id && ord.id.toLowerCase().includes(orderSearchQuery.toLowerCase())) ||
      (ord.userId && ord.userId.toLowerCase().includes(orderSearchQuery.toLowerCase()));

    return matchesStatus && matchesQuery;
  });

  // Filter payments
  const filteredPayments = allPayments.filter((pmt) => {
    const matchesStatus = paymentStatusFilter === "ALL" || pmt.status === paymentStatusFilter;
    const matchesQuery =
      !paymentSearchQuery ||
      (pmt.id && pmt.id.toLowerCase().includes(paymentSearchQuery.toLowerCase())) ||
      (pmt.orderId && pmt.orderId.toLowerCase().includes(paymentSearchQuery.toLowerCase())) ||
      (pmt.transactionId && pmt.transactionId.toLowerCase().includes(paymentSearchQuery.toLowerCase())) ||
      (pmt.userId && pmt.userId.toLowerCase().includes(paymentSearchQuery.toLowerCase())) ||
      (pmt.subscriptionPlanName && pmt.subscriptionPlanName.toLowerCase().includes(paymentSearchQuery.toLowerCase()));

    return matchesStatus && matchesQuery;
  });

  // Filter users
  const filteredUsers = allUsers.filter((usr) => {
    const matchesStatus =
      userStatusFilter === "ALL" ||
      (userStatusFilter === "ACTIVE" && (usr.isActive !== false && usr.status !== "SUSPENDED")) ||
      (userStatusFilter === "SUSPENDED" && (usr.isActive === false || usr.status === "SUSPENDED"));

    const matchesQuery =
      !userSearchQuery ||
      (usr.fullName && usr.fullName.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
      (usr.email && usr.email.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
      (usr.phone && usr.phone.includes(userSearchQuery)) ||
      (usr.id && usr.id.toLowerCase().includes(userSearchQuery.toLowerCase()));

    return matchesStatus && matchesQuery;
  });

  // Khi chưa hoàn tất hydrate state từ localStorage
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="flex items-center gap-2.5 text-gray-500 font-bold text-sm">
          <RefreshCw className="w-4 h-4 animate-spin text-[var(--color-primary-500,#034ce4)]" />
          <span>Đang xác thực quyền truy cập hệ thống...</span>
        </div>
      </div>
    );
  }

  // Nếu chưa đăng nhập
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 font-body">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-gray-200 shadow-xl text-center space-y-5">
          <div className="w-14 h-14 bg-blue-50 text-[var(--color-primary-600,#0240c0)] rounded-2xl flex items-center justify-center mx-auto border border-blue-100">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold font-header text-gray-900 tracking-tight">
              Yêu Cầu Đăng Nhập Quản Trị
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-sans">
              Bảng điều khiển Quản trị EDORE chỉ dành riêng cho tài khoản được cấp quyền <strong>ROLE_ADMIN</strong>.
            </p>
          </div>

          <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-100 text-xs text-blue-900 text-left space-y-1.5">
            <p className="font-bold">Tài khoản Quản trị viên mặc định của hệ thống:</p>
            <p>• Email: <code className="font-mono font-bold text-blue-700 bg-white px-1.5 py-0.5 rounded">admin@sba.com</code></p>
            <p>• Mật khẩu: <code className="font-mono font-bold text-blue-700 bg-white px-1.5 py-0.5 rounded">P@ssw0rd123</code></p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/login?redirect=/dashboard/admin"
              className="w-full py-3 rounded-xl bg-[var(--color-primary-500,#034ce4)] hover:bg-[var(--color-primary-600,#0240c0)] text-white font-bold text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              Đăng nhập tài khoản Admin
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-all flex items-center justify-center"
            >
              Về Trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Nếu đã đăng nhập nhưng là tài khoản thường (ROLE_USER, không có quyền ROLE_ADMIN)
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 font-body">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-red-200 shadow-xl text-center space-y-5">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-100">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <span className="px-3 py-1 bg-red-100 text-red-700 font-mono text-[11px] font-bold rounded-full uppercase">
              Lỗi 403 Forbidden
            </span>
            <h2 className="text-xl font-bold font-header text-gray-900 tracking-tight pt-1">
              Quyền Truy Cập Bị Từ Chối
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 font-sans leading-relaxed">
              Tài khoản hiện tại của bạn là <strong>{user?.email}</strong> với quyền hạn <strong>ROLE_USER</strong> (Giáo viên / Người dùng thông thường).
            </p>
            <p className="text-xs text-red-600 font-semibold">
              Tài khoản thường không có quyền truy cập các API Quản trị hệ thống backend.
            </p>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 text-left space-y-1.5">
            <p className="font-bold">Để kiểm tra tính năng Admin thật, hãy đăng nhập bằng tài khoản Quản trị viên:</p>
            <p>• Email: <code className="font-mono font-bold text-amber-800 bg-white px-1.5 py-0.5 rounded">admin@sba.com</code></p>
            <p>• Mật khẩu: <code className="font-mono font-bold text-amber-800 bg-white px-1.5 py-0.5 rounded">P@ssw0rd123</code></p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/login?redirect=/dashboard/admin"
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              Đổi sang tài khoản Admin
            </Link>
            <Link
              href="/dashboard"
              className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-all flex items-center justify-center"
            >
              Về Bàn làm việc
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50,#fafafa)] py-6 px-3 sm:px-6 lg:px-8 font-body">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── HEADER BANNER ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[var(--color-neutral-200,#d9d9d9)] shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-50 text-[var(--color-primary-600,#0240c0)] border border-blue-200 uppercase">
                <ShieldCheck className="w-3.5 h-3.5" /> Quản Trị Hệ Thống EDORE
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Analytics Live
              </span>
              {isBackendConnected ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> API Backend: Đã kết nối (Port 8080)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> API Backend: Chế độ dữ liệu xem trước
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-header text-gray-900 tracking-tight uppercase">
              BẢNG ĐIỀU KHIỂN QUẢN TRỊ (ADMIN DASHBOARD)
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-sans mt-0.5">
              Theo dõi trực quan 3 trọng tâm: Doanh thu mua gói, Quản lý tài khoản người dùng & Lịch sử giao dịch thanh toán.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Nút liên kết ngoài Google Analytics Console */}
            <a
              href="https://analytics.google.com/analytics/web/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all whitespace-nowrap active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
              Mở Google Analytics
            </a>

            {/* Bộ chọn khoảng thời gian */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold">
              {[
                { label: "7 ngày", val: "7d" },
                { label: "30 ngày", val: "30d" },
                { label: "Năm 2026", val: "1y" },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => setTimeRange(item.val)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    timeRange === item.val
                      ? "bg-white text-gray-900 shadow-xs font-bold"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Nút Làm mới */}
            <button
              onClick={loadData}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-[var(--color-primary-500,#034ce4)] text-white hover:bg-[var(--color-primary-600,#0240c0)] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all whitespace-nowrap active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Làm mới
            </button>
          </div>
        </div>

        {/* Thông báo trạng thái backend */}
        {!isBackendConnected && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs sm:text-sm shadow-xs">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">
                Chưa thể kết nối tới máy chủ Backend (Cổng 8080)
              </p>
              <p className="text-amber-700 text-xs leading-relaxed">
                Các API quản trị (<code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-800 font-semibold">/api/v1/admin/orders</code>, <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-800 font-semibold">/api/v1/admin/orders/payments</code>, <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-800 font-semibold">/api/v1/admin/users</code>) đã được kết nối trực tiếp. Vui lòng kiểm tra đảm bảo máy chủ Spring Boot đang chạy: <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded font-bold text-amber-900">cd java-backend; mvn spring-boot:run</code>.
              </p>
            </div>
          </div>
        )}

        {/* ── TOP 4 EXECUTIVE KPI SUMMARY CARDS ─────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Doanh thu thực */}
          <div className="p-5 rounded-2xl bg-white border border-[var(--color-neutral-200,#d9d9d9)] shadow-xs space-y-2.5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase font-bold text-gray-500">TỔNG DOANH THU THỰC</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[var(--color-tertiary-500,#12ab83)] flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold font-mono text-gray-900 tracking-tight">
                {loading ? "..." : formatCurrency(metrics?.totalRevenue || 0)}
              </h3>
              <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> MRR: {formatCurrency(metrics?.mrr || 0)}
              </p>
            </div>
          </div>

          {/* Card 2: Số lượt mua gói & tỷ lệ hoàn tất */}
          <div className="p-5 rounded-2xl bg-white border border-[var(--color-neutral-200,#d9d9d9)] shadow-xs space-y-2.5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase font-bold text-gray-500">ĐƠN HÀNG MUA GÓI</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[var(--color-primary-500,#034ce4)] flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold font-mono text-gray-900 tracking-tight">
                {loading ? "..." : `${metrics?.paidOrdersCount || 0} / ${metrics?.totalOrders || 0}`}
              </h3>
              <p className="text-xs text-blue-600 font-semibold mt-1 flex items-center gap-1">
                <Percent className="w-3.5 h-3.5" /> Hoàn tất: {metrics?.conversionRate || 0}%
              </p>
            </div>
          </div>

          {/* Card 3: Giao dịch thanh toán */}
          <div className="p-5 rounded-2xl bg-white border border-[var(--color-neutral-200,#d9d9d9)] shadow-xs space-y-2.5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase font-bold text-gray-500">GIAO DỊCH THANH TOÁN</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold font-mono text-gray-900 tracking-tight">
                {loading ? "..." : allPayments.length}
              </h3>
              <p className="text-xs text-indigo-600 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Thành công: {allPayments.filter((p) => p.status === "SUCCESS").length}
              </p>
            </div>
          </div>

          {/* Card 4: Tổng người dùng hệ thống */}
          <div className="p-5 rounded-2xl bg-white border border-[var(--color-neutral-200,#d9d9d9)] shadow-xs space-y-2.5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase font-bold text-gray-500">TỔNG NGƯỜI DÙNG</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-[var(--color-secondary-500,#f28c0f)] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold font-mono text-gray-900 tracking-tight">
                {loading ? "..." : metrics?.totalUsers || allUsers.length || 0}
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-1">Tài khoản giáo viên & quản trị</p>
            </div>
          </div>
        </div>

        {/* ── 3 TABS NAVIGATION ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[var(--color-neutral-200,#d9d9d9)] p-2 shadow-xs flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab("revenue")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "revenue"
                ? "bg-[var(--color-primary-500,#034ce4)] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            1. Thống Kê Mua Gói & Doanh Thu
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "users"
                ? "bg-[var(--color-primary-500,#034ce4)] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <Users className="w-4 h-4" />
            2. Quản Lý Người Dùng
          </button>

          <button
            onClick={() => setActiveTab("transactions")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "transactions"
                ? "bg-[var(--color-primary-500,#034ce4)] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            3. Lịch Sử Giao Dịch
          </button>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: THỐNG KÊ MUA GÓI HOẶC DOANH THU                                  */}
        {/* ═════════════════════════════════════════════════════════════════════════ */}
        {activeTab === "revenue" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Biểu đồ Doanh thu (Span 8) */}
              <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[var(--color-neutral-200,#d9d9d9)] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold font-header uppercase text-gray-900">
                      Doanh Thu Đăng Ký Gói Cước Theo Ngày
                    </h3>
                    <p className="text-xs text-gray-500">Doanh thu phát sinh từ các gói Pro Plan đã thanh toán</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    +18.5% so với tuần trước
                  </span>
                </div>

                <div className="min-h-[280px] w-full">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={revenueChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} dy={10} />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        tickFormatter={(value) => `${value / 1000000}Tr`}
                      />
                      <RechartsTooltip
                        cursor={{ fill: "#f3f4f6" }}
                        formatter={(value) => [formatCurrency(Number(value ?? 0)), "Doanh thu"]}
                        contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                      />
                      <Bar dataKey="revenue" fill="var(--color-primary-500,#034ce4)" radius={[6, 6, 0, 0]} barSize={36} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Biểu đồ Phân Bổ Gói Cước (Span 4) */}
              <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[var(--color-neutral-200,#d9d9d9)] shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold font-header uppercase text-gray-900 mb-1">
                    Cơ Cấu Gói Cước Sử Dụng
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">Tỷ lệ người dùng theo gói dịch vụ</p>
                </div>

                <div className="min-h-[220px] relative">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={planPieChartData}
                        cx="50%"
                        cy="45%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {planPieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PLAN_COLORS[index % PLAN_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(value) => [`${Number(value ?? 0)} đơn`, "Số lượng"]}
                        contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Legend */}
                  <div className="flex flex-col gap-1.5 pt-2">
                    {planPieChartData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center justify-between text-xs text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PLAN_COLORS[index % PLAN_COLORS.length] }} />
                          <span className="font-medium">{entry.name}</span>
                        </div>
                        <span className="font-bold font-mono">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bảng Đơn Hàng Mua Gói */}
            <div className="bg-white rounded-2xl border border-[var(--color-neutral-200,#d9d9d9)] p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold font-header uppercase tracking-wide text-gray-900">
                    DANH SÁCH ĐƠN ĐĂNG KÝ GÓI (ORDERS)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Toàn bộ đơn hàng mua gói dịch vụ từ người dùng và giáo viên.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      placeholder="Mã đơn hàng, tên gói, user..."
                      className="pl-9 pr-3 py-1.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500,#034ce4)] w-56"
                    />
                  </div>

                  <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
                    {["ALL", "PAID", "PENDING", "CANCELLED"].map((st) => (
                      <button
                        key={st}
                        onClick={() => setOrderStatusFilter(st)}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          orderStatusFilter === st
                            ? "bg-white text-gray-900 shadow-xs font-bold"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        {st === "ALL" ? "Tất cả" : st === "PAID" ? "Đã thanh toán" : st === "PENDING" ? "Chờ xử lý" : "Hủy/Lỗi"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-gray-500">Đang tải dữ liệu đơn hàng...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-medium">Không tìm thấy đơn hàng nào khớp điều kiện.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-mono uppercase text-gray-500">
                        <th className="py-3 px-4">Mã đơn</th>
                        <th className="py-3 px-4">User ID</th>
                        <th className="py-3 px-4">Gói dịch vụ</th>
                        <th className="py-3 px-4">Giá tiền (VNĐ)</th>
                        <th className="py-3 px-4">Thời gian</th>
                        <th className="py-3 px-4">Trạng thái</th>
                        <th className="py-3 px-4 text-right">Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-blue-50/20 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                            #{ord.gatewayOrderCode || ord.id.substring(0, 8)}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-gray-500">
                            {ord.userId ? ord.userId.substring(0, 8) + "..." : "Hệ thống"}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-gray-800">
                            {ord.subscriptionPlanName}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-[var(--color-primary-500,#034ce4)]">
                            {formatCurrency(ord.amount)}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-gray-600 font-sans">
                            {formatDate(ord.createdAt)}
                          </td>
                          <td className="py-3.5 px-4">
                            {ord.status === "PAID" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ĐÃ THANH TOÁN
                              </span>
                            ) : ord.status === "PENDING" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" /> CHỜ THANH TOÁN
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                <XCircle className="w-3 h-3 text-gray-500" /> {ord.status}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="text-xs text-[var(--color-primary-500,#034ce4)] font-bold hover:underline"
                            >
                              Xem
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: QUẢN LÝ NGƯỜI DÙNG                                                */}
        {/* ═════════════════════════════════════════════════════════════════════════ */}
        {activeTab === "users" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Control Users */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold font-header uppercase tracking-wide text-gray-900">
                    QUẢN LÝ TÀI KHOẢN NGƯỜI DÙNG
                  </h3>
                  <p className="text-xs text-gray-500">
                    Theo dõi danh sách người dùng, vai trò tài khoản, trạng thái hoạt động và gói cước.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      placeholder="Tìm tên, email, SĐT..."
                      className="pl-9 pr-3 py-1.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500,#034ce4)] w-56"
                    />
                  </div>

                  <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
                    {["ALL", "ACTIVE", "SUSPENDED"].map((st) => (
                      <button
                        key={st}
                        onClick={() => setUserStatusFilter(st)}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          userStatusFilter === st
                            ? "bg-white text-gray-900 shadow-xs font-bold"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        {st === "ALL" ? "Tất cả" : st === "ACTIVE" ? "Hoạt động" : "Tạm khóa"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bảng Danh Sách Người Dùng */}
              {loading ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-gray-500">Đang tải danh sách người dùng...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-medium">Không tìm thấy người dùng nào phù hợp.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-mono uppercase text-gray-500">
                        <th className="py-3 px-4">Họ và tên</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Số điện thoại</th>
                        <th className="py-3 px-4">Vai trò (Role)</th>
                        <th className="py-3 px-4">Gói cước</th>
                        <th className="py-3 px-4">Trạng thái</th>
                        <th className="py-3 px-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {filteredUsers.map((usr) => {
                        const isActive = usr.isActive !== false && usr.status !== "SUSPENDED";
                        return (
                          <tr key={usr.id} className="hover:bg-blue-50/20 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-gray-900">
                              {usr.fullName || "Người dùng Edore"}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-xs text-gray-600">
                              {usr.email}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-xs text-gray-600">
                              {usr.phone || "Chưa cập nhật"}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                                usr.role === "ROLE_ADMIN"
                                  ? "bg-purple-100 text-purple-800 border border-purple-200"
                                  : "bg-blue-50 text-blue-700 border border-blue-200"
                              }`}>
                                {usr.role === "ROLE_ADMIN" ? "Quản trị viên" : "Giáo viên"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                {usr.plan || "Gói Cơ Bản"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              {isActive ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Hoạt động
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                                  <XCircle className="w-3 h-3 text-red-600" /> Tạm khóa
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => setSelectedUser(usr)}
                                className="text-xs text-[var(--color-primary-500,#034ce4)] font-bold hover:underline"
                              >
                                Chi tiết
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: LỊCH SỬ GIAO DỊCH (PAYMENTS & TRANSACTIONS)                       */}
        {/* ═════════════════════════════════════════════════════════════════════════ */}
        {activeTab === "transactions" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header Lịch Sử Giao Dịch */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold font-header uppercase tracking-wide text-gray-900">
                    LỊCH SỬ GIAO DỊCH THANH TOÁN (PAYMENTS)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Theo dõi toàn bộ các phiên thanh toán qua PayOS (VietQR) và đối soát ngân hàng.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={paymentSearchQuery}
                      onChange={(e) => setPaymentSearchQuery(e.target.value)}
                      placeholder="Mã GD, mã đơn, user..."
                      className="pl-9 pr-3 py-1.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500,#034ce4)] w-56"
                    />
                  </div>

                  <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
                    {["ALL", "SUCCESS", "PENDING", "FAILED"].map((st) => (
                      <button
                        key={st}
                        onClick={() => setPaymentStatusFilter(st)}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          paymentStatusFilter === st
                            ? "bg-white text-gray-900 shadow-xs font-bold"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        {st === "ALL" ? "Tất cả" : st === "SUCCESS" ? "Thành công" : st === "PENDING" ? "Chờ xử lý" : "Thất bại"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bảng Danh Sách Giao Dịch */}
              {loading ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-gray-500">Đang tải lịch sử giao dịch...</p>
                </div>
              ) : filteredPayments.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-medium">Không tìm thấy giao dịch nào phù hợp.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-mono uppercase text-gray-500">
                        <th className="py-3 px-4">Mã giao dịch</th>
                        <th className="py-3 px-4">Mã đơn hàng</th>
                        <th className="py-3 px-4">Cổng thanh toán</th>
                        <th className="py-3 px-4">Gói cước</th>
                        <th className="py-3 px-4">Số tiền (VNĐ)</th>
                        <th className="py-3 px-4">Thời gian</th>
                        <th className="py-3 px-4">Trạng thái</th>
                        <th className="py-3 px-4 text-right">Biên lai</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {filteredPayments.map((pmt) => (
                        <tr key={pmt.id} className="hover:bg-blue-50/20 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-gray-900 text-xs">
                            {pmt.transactionId || pmt.id}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-blue-600">
                            #{pmt.orderId?.substring(0, 8)}
                          </td>
                          <td className="py-3.5 px-4 text-xs font-medium text-gray-700">
                            {pmt.provider || "PayOS (VietQR)"}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-gray-800">
                            {pmt.subscriptionPlanName}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                            {formatCurrency(pmt.amount)}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-gray-600 font-sans">
                            {formatDate(pmt.paidAt || pmt.createdAt)}
                          </td>
                          <td className="py-3.5 px-4">
                            {pmt.status === "SUCCESS" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> THÀNH CÔNG
                              </span>
                            ) : pmt.status === "PENDING" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" /> CHỜ THANH TOÁN
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                                <XCircle className="w-3 h-3 text-red-600" /> THẤT BẠI
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedPayment(pmt)}
                              className="text-xs text-[var(--color-primary-500,#034ce4)] font-bold hover:underline"
                            >
                              Biên lai
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ── MODAL CHI TIẾT ĐƠN HÀNG ────────────────────────────────────────────── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h4 className="text-lg font-bold font-header uppercase text-gray-900">
                ĐƠN HÀNG #{selectedOrder.gatewayOrderCode || selectedOrder.id.substring(0, 8)}
              </h4>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm font-sans">
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 text-xs">Mã ID Đơn:</span>
                <span className="font-mono text-xs text-gray-900 font-bold">{selectedOrder.id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 text-xs">Mã Người dùng:</span>
                <span className="font-mono text-xs text-gray-900">{selectedOrder.userId}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 text-xs">Gói dịch vụ:</span>
                <span className="font-bold text-gray-900">{selectedOrder.subscriptionPlanName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 text-xs">Số tiền thanh toán:</span>
                <span className="font-mono font-bold text-[var(--color-primary-500,#034ce4)] text-base">
                  {formatCurrency(selectedOrder.amount)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 text-xs">Trạng thái:</span>
                <span className="font-bold text-emerald-600">{selectedOrder.status}</span>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL BIÊN LAI GIAO DỊCH ─────────────────────────────────────────── */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h4 className="text-lg font-bold font-header uppercase text-gray-900">
                  BIÊN LAI ĐIỆN TỬ
                </h4>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm font-sans">
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 text-xs">Mã Giao dịch (TXN):</span>
                <span className="font-mono text-xs text-gray-900 font-bold">{selectedPayment.transactionId || selectedPayment.id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 text-xs">Mã Đơn hàng:</span>
                <span className="font-mono text-xs text-gray-900">{selectedPayment.orderId}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 text-xs">Phương thức:</span>
                <span className="font-bold text-gray-800">{selectedPayment.provider || "PayOS (VietQR)"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 text-xs">Gói cước:</span>
                <span className="font-bold text-gray-900">{selectedPayment.subscriptionPlanName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 text-xs">Số tiền:</span>
                <span className="font-mono font-bold text-emerald-600 text-base">
                  {formatCurrency(selectedPayment.amount)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 text-xs">Thời gian hoàn tất:</span>
                <span className="text-xs text-gray-700">{formatDate(selectedPayment.paidAt || selectedPayment.createdAt)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 text-xs">Trạng thái:</span>
                <span className="font-bold text-emerald-600">{selectedPayment.status}</span>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedPayment(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL CHI TIẾT NGƯỜI DÙNG ─────────────────────────────────────────── */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h4 className="text-lg font-bold font-header uppercase text-gray-900">
                  CHI TIẾT TÀI KHOẢN NGƯỜI DÙNG
                </h4>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm font-sans">
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 text-xs">Mã User ID:</span>
                <span className="font-mono text-xs text-gray-900 font-bold">{selectedUser.id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 text-xs">Họ và tên:</span>
                <span className="font-bold text-gray-900">{selectedUser.fullName || "Chưa cập nhật"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 text-xs">Địa chỉ Email:</span>
                <span className="font-mono text-xs text-blue-600">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 text-xs">Số điện thoại:</span>
                <span className="font-mono text-xs text-gray-800">{selectedUser.phone || "Chưa cập nhật"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 text-xs">Vai trò hệ thống:</span>
                <span className="font-bold text-purple-700">{selectedUser.role === "ROLE_ADMIN" ? "Quản trị viên (Admin)" : "Giáo viên (User)"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 text-xs">Gói cước:</span>
                <span className="font-bold text-amber-700">{selectedUser.plan || "Gói Cơ Bản (Free)"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 text-xs">Trạng thái tài khoản:</span>
                <span className={`font-bold ${selectedUser.isActive !== false ? "text-emerald-600" : "text-red-600"}`}>
                  {selectedUser.isActive !== false ? "Đang hoạt động" : "Đã khóa"}
                </span>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
