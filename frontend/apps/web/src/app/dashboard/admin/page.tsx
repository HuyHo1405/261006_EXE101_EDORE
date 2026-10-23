"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import {
  adminDashboardService,
  AdminDashboardMetrics,
  GoogleAnalyticsMetrics,
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

type AdminTab = "revenue" | "analytics" | "users" | "transactions";

const revenueDataMock = [
  { name: "T2", revenue: 12000000, orders: 12 },
  { name: "T3", revenue: 15000000, orders: 15 },
  { name: "T4", revenue: 8000000, orders: 8 },
  { name: "T5", revenue: 22000000, orders: 24 },
  { name: "T6", revenue: 19000000, orders: 19 },
  { name: "T7", revenue: 25000000, orders: 26 },
  { name: "CN", revenue: 30000000, orders: 32 },
];

const pieDataMock = [
  { name: "Gói Cơ Bản (Free)", value: 620 },
  { name: "Gói Chuyên Nghiệp (Pro)", value: 340 },
  { name: "Gói Đội Ngũ (Team)", value: 85 },
];
const PLAN_COLORS = ["#f28c0f", "#034ce4", "#12ab83"];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("revenue");
  const [loading, setLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<string>("7d");
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // Metrics
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [gaData, setGaData] = useState<GoogleAnalyticsMetrics | null>(null);

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

  const loadData = async () => {
    try {
      setLoading(true);
      const [met, ordersPage, paymentsPage, usersPage, ga] = await Promise.all([
        adminDashboardService.getMetrics(),
        adminDashboardService.getAllOrders(0, 100),
        adminDashboardService.getAllPayments(0, 100),
        adminDashboardService.getAllUsers(0, 100),
        adminDashboardService.getGoogleAnalyticsMetrics(timeRange),
      ]);

      const isLive = Boolean(
        (ordersPage.content && ordersPage.content.length > 0) ||
        (usersPage.content && usersPage.content.length > 0) ||
        (paymentsPage.content && paymentsPage.content.length > 0)
      );
      setIsBackendConnected(isLive);

      setMetrics(met);
      setGaData(ga);

      // Orders: if backend returns data use it, otherwise provide rich fallback
      if (ordersPage.content && ordersPage.content.length > 0) {
        setAllOrders(ordersPage.content);
      } else {
        setAllOrders([
          {
            id: "ord-94821-vn",
            userId: "usr_nguyenvana",
            subscriptionPlanId: 2,
            subscriptionPlanName: "Gói Chuyên Nghiệp (Pro)",
            amount: 199000,
            status: "PAID",
            gatewayOrderCode: 8492019,
            createdAt: new Date(Date.now() - 3600000 * 2.5).toISOString(),
            updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          },
          {
            id: "ord-94822-vn",
            userId: "usr_tranthib",
            subscriptionPlanId: 2,
            subscriptionPlanName: "Gói Chuyên Nghiệp (Pro)",
            amount: 199000,
            status: "PAID",
            gatewayOrderCode: 8492020,
            createdAt: new Date(Date.now() - 3600000 * 8.2).toISOString(),
            updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
          },
          {
            id: "ord-94819-vn",
            userId: "usr_levanc",
            subscriptionPlanId: 2,
            subscriptionPlanName: "Gói Chuyên Nghiệp (Pro)",
            amount: 199000,
            status: "PENDING",
            gatewayOrderCode: 8492015,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: "ord-94815-vn",
            userId: "usr_phamthid",
            subscriptionPlanId: 2,
            subscriptionPlanName: "Gói Chuyên Nghiệp (Pro)",
            amount: 199000,
            status: "CANCELLED",
            gatewayOrderCode: 8492002,
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          },
        ]);
      }

      // Payments: if backend has data use it, otherwise provide rich fallback
      const fetchedPayments = paymentsPage.content || [];
      if (fetchedPayments.length > 0) {
        setAllPayments(fetchedPayments);
      } else if (ordersPage.content && ordersPage.content.length > 0) {
        // Derive payment records from orders
        const derivedPayments: PaymentResponseDTO[] = ordersPage.content.map((o) => ({
          id: `PAY-${o.id.substring(0, 8)}`,
          orderId: o.id,
          userId: o.userId,
          subscriptionPlanId: o.subscriptionPlanId,
          subscriptionPlanName: o.subscriptionPlanName,
          provider: "PayOS (VietQR)",
          transactionId: `TXN-${o.gatewayOrderCode || Math.floor(Math.random() * 900000 + 100000)}`,
          amount: o.amount,
          status: o.status === "PAID" ? "SUCCESS" : o.status === "PENDING" ? "PENDING" : "FAILED",
          paidAt: o.status === "PAID" ? o.updatedAt || o.createdAt : undefined,
          createdAt: o.createdAt,
        }));
        setAllPayments(derivedPayments);
      } else {
        // Demo transaction mock
        setAllPayments([
          {
            id: "PAY-20261023-01",
            orderId: "ORD-94821",
            userId: "usr_nguyenvana",
            subscriptionPlanId: 2,
            subscriptionPlanName: "Gói Chuyên Nghiệp (Pro)",
            provider: "PayOS (VietQR)",
            transactionId: "TXN-8492019",
            amount: 199000,
            status: "SUCCESS",
            paidAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            createdAt: new Date(Date.now() - 3600000 * 2.5).toISOString(),
          },
          {
            id: "PAY-20261023-02",
            orderId: "ORD-94822",
            userId: "usr_tranthib",
            subscriptionPlanId: 2,
            subscriptionPlanName: "Gói Chuyên Nghiệp (Pro)",
            provider: "PayOS (VietQR)",
            transactionId: "TXN-8492020",
            amount: 199000,
            status: "SUCCESS",
            paidAt: new Date(Date.now() - 3600000 * 8).toISOString(),
            createdAt: new Date(Date.now() - 3600000 * 8.2).toISOString(),
          },
          {
            id: "PAY-20261022-03",
            orderId: "ORD-94819",
            userId: "usr_levanc",
            subscriptionPlanId: 2,
            subscriptionPlanName: "Gói Chuyên Nghiệp (Pro)",
            provider: "PayOS (VietQR)",
            transactionId: "TXN-8492015",
            amount: 199000,
            status: "PENDING",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: "PAY-20261021-04",
            orderId: "ORD-94815",
            userId: "usr_phamthid",
            subscriptionPlanId: 2,
            subscriptionPlanName: "Gói Chuyên Nghiệp (Pro)",
            provider: "PayOS (VietQR)",
            transactionId: "TXN-8492002",
            amount: 199000,
            status: "FAILED",
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          },
        ]);
      }

      // Users
      const fetchedUsers = usersPage.content || [];
      if (fetchedUsers.length > 0) {
        setAllUsers(fetchedUsers);
      } else {
        // Fallback user mock for demonstration
        setAllUsers([
          {
            id: "u-101",
            fullName: "Nguyễn Văn An",
            email: "an.nguyen@edore.vn",
            phone: "0912345678",
            role: "ROLE_ADMIN",
            status: "ACTIVE",
            isActive: true,
            plan: "Pro Plan",
            createdAt: "2026-09-01T08:00:00Z",
          },
          {
            id: "u-102",
            fullName: "Trần Thị Bích",
            email: "bich.tran@gmail.com",
            phone: "0987654321",
            role: "ROLE_USER",
            status: "ACTIVE",
            isActive: true,
            plan: "Pro Plan",
            createdAt: "2026-09-12T14:30:00Z",
          },
          {
            id: "u-103",
            fullName: "Lê Hoàng Nam",
            email: "nam.le@thcs-chuvanan.edu.vn",
            phone: "0903112233",
            role: "ROLE_USER",
            status: "ACTIVE",
            isActive: true,
            plan: "Free Plan",
            createdAt: "2026-10-02T10:15:00Z",
          },
          {
            id: "u-104",
            fullName: "Phạm Thu Hương",
            email: "huong.pham@thpt-chuyen.edu.vn",
            phone: "0934556677",
            role: "ROLE_USER",
            status: "ACTIVE",
            isActive: true,
            plan: "Pro Plan",
            createdAt: "2026-10-15T09:20:00Z",
          },
          {
            id: "u-105",
            fullName: "Võ Minh Đức",
            email: "duc.vo@gmail.com",
            phone: "0945667788",
            role: "ROLE_USER",
            status: "SUSPENDED",
            isActive: false,
            plan: "Free Plan",
            createdAt: "2026-10-18T16:45:00Z",
          },
        ]);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [timeRange]);

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
              Theo dõi trực quan 4 trọng tâm: Doanh thu mua gói, Google Analytics, Quản lý tài khoản & Lịch sử giao dịch.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
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
                Đang hiển thị dữ liệu mô phỏng do Backend (Spring Boot port 8080) chưa khởi động
              </p>
              <p className="text-amber-700 text-xs leading-relaxed">
                Các API quản trị (<code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-800 font-semibold">/api/v1/admin/orders</code>, <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-800 font-semibold">/api/v1/admin/orders/payments</code>, <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-800 font-semibold">/api/v1/admin/users</code>) đã được kết nối hoàn chỉnh trên giao diện. Khi bạn khởi động backend bằng lệnh: <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded font-bold text-amber-900">cd java-backend; mvn spring-boot:run</code>, bảng điều khiển sẽ tự động đồng bộ dữ liệu thực tế từ cơ sở dữ liệu.
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

          {/* Card 3: Google Analytics Traffic */}
          <div className="p-5 rounded-2xl bg-white border border-[var(--color-neutral-200,#d9d9d9)] shadow-xs space-y-2.5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase font-bold text-gray-500">LƯỢNG TRUY CẬP (GA4)</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold font-mono text-gray-900 tracking-tight">
                {loading ? "..." : `${gaData?.pageViews?.toLocaleString("vi-VN") || 0}`}
              </h3>
              <p className="text-xs text-indigo-600 font-semibold mt-1 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-500" /> Đang online: {gaData?.activeUsersRealtime || 0} người
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

        {/* ── 4 TABS NAVIGATION ─────────────────────────────────────────────────── */}
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
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === "analytics"
                ? "bg-[var(--color-primary-500,#034ce4)] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            2. Lưu Lượng Website (Web Analytics)
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
            3. Quản Lý Người Dùng
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
            4. Lịch Sử Giao Dịch
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
                    <BarChart data={revenueDataMock} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                        data={pieDataMock}
                        cx="50%"
                        cy="45%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieDataMock.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PLAN_COLORS[index % PLAN_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(value) => [`${Number(value ?? 0)} người dùng`, "Số lượng"]}
                        contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Legend */}
                  <div className="flex flex-col gap-1.5 pt-2">
                    {pieDataMock.map((entry, index) => (
                      <div key={entry.name} className="flex items-center justify-between text-xs text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PLAN_COLORS[index] }} />
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
        {/* TAB 2: GOOGLE ANALYTICS METRICS                                         */}
        {/* ═════════════════════════════════════════════════════════════════════════ */}
        {activeTab === "analytics" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Status Bar GA4 */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                  <BarChart3 className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold font-header text-lg uppercase tracking-wide">
                      HỆ THỐNG PHÂN TÍCH LƯU LƯỢNG TRUY CẬP (WEB ANALYTICS)
                    </h3>
                    <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold uppercase rounded-full">
                      TÍCH HỢP TRỰC TIẾP
                    </span>
                  </div>
                  <p className="text-xs text-blue-200/80">
                    Chế độ: <code className="font-mono font-bold text-white bg-white/10 px-1.5 py-0.5 rounded">{gaData?.measurementId || "Bộ đếm phân tích nội bộ (In-house Analytics)"}</code> • Tự động theo dõi trên tên miền của bạn
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                <div className="flex items-center gap-4 bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                  <div className="text-right">
                    <span className="text-[10px] text-blue-200 block uppercase font-mono">Đang online (Realtime)</span>
                    <span className="text-lg font-bold font-mono text-emerald-400 flex items-center gap-1.5 justify-end">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      {gaData?.activeUsersRealtime || 38} người
                    </span>
                  </div>
                </div>

                <a
                  href="https://analytics.google.com/analytics/web/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 rounded-xl bg-white text-gray-900 hover:bg-gray-100 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap active:scale-95"
                >
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                  Mở GA4 Console
                </a>
              </div>
            </div>

            {/* 4 Cards Chỉ số GA4 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-2">
                <span className="text-[11px] font-mono uppercase font-bold text-gray-500">TỔNG LƯỢT XEM TRANG</span>
                <h4 className="text-2xl font-bold font-mono text-gray-900">{gaData?.pageViews?.toLocaleString("vi-VN") || "14.850"}</h4>
                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +22.4% so với tuần trước
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-2">
                <span className="text-[11px] font-mono uppercase font-bold text-gray-500">SỐ PHIÊN TRUY CẬP (SESSIONS)</span>
                <h4 className="text-2xl font-bold font-mono text-gray-900">{gaData?.sessions?.toLocaleString("vi-VN") || "5.290"}</h4>
                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +15.8% số phiên mới
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-2">
                <span className="text-[11px] font-mono uppercase font-bold text-gray-500">THỜI GIAN TƯƠNG TÁC TB</span>
                <h4 className="text-2xl font-bold font-mono text-gray-900">{gaData?.avgEngagementTime || "3m 42s"}</h4>
                <p className="text-xs text-blue-600 font-semibold">Tập trung cao vào soạn kịch bản</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-2">
                <span className="text-[11px] font-mono uppercase font-bold text-gray-500">TỶ LỆ THOÁT (BOUNCE RATE)</span>
                <h4 className="text-2xl font-bold font-mono text-gray-900">{gaData?.bounceRate || "34.2%"}</h4>
                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <ArrowDownRight className="w-3.5 h-3.5" /> Giảm 4.2% (Tương tác tốt)
                </p>
              </div>
            </div>

            {/* Biểu đồ Lưu Lượng Theo Ngày */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold font-header uppercase text-gray-900">
                    Xu Hướng Lưu Lượng Truy Cập 7 Ngày Qua
                  </h3>
                  <p className="text-xs text-gray-500">Số lượng người dùng và số lượt xem trang theo từng ngày</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-blue-600">
                    <span className="w-3 h-3 rounded-full bg-blue-600" /> Lượt xem trang
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-600">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" /> Người dùng
                  </span>
                </div>
              </div>

              <div className="min-h-[260px] w-full">
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={gaData?.dailyTraffic || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#034ce4" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#034ce4" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                    <RechartsTooltip
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                    />
                    <Area type="monotone" dataKey="pageViews" name="Lượt xem" stroke="#034ce4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPageViews)" />
                    <Area type="monotone" dataKey="users" name="Người dùng" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUsers)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2 Cột: Nguồn Traffic & Thiết Bị */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Nguồn Lưu Lượng */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold font-header uppercase text-gray-900">
                    Kênh & Nguồn Truy Cập (Traffic Channels)
                  </h3>
                  <Compass className="w-4 h-4 text-gray-400" />
                </div>

                <div className="space-y-3.5">
                  {gaData?.trafficSources.map((src) => (
                    <div key={src.name} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-gray-700">{src.name}</span>
                        <span className="text-gray-900 font-mono font-bold">
                          {src.percentage}% ({src.visits.toLocaleString()} lượt)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${src.percentage}%`, backgroundColor: src.fill }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phân Bố Thiết Bị */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold font-header uppercase text-gray-900">
                    Thiết Bị Truy Cập (Device Breakdown)
                  </h3>
                  <Laptop className="w-4 h-4 text-gray-400" />
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-center space-y-1">
                    <Laptop className="w-6 h-6 text-blue-600 mx-auto" />
                    <span className="text-xs text-gray-600 block font-medium">Máy tính</span>
                    <span className="text-xl font-extrabold font-mono text-blue-700">67%</span>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center space-y-1">
                    <Smartphone className="w-6 h-6 text-emerald-600 mx-auto" />
                    <span className="text-xs text-gray-600 block font-medium">Di động</span>
                    <span className="text-xl font-extrabold font-mono text-emerald-700">30%</span>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-center space-y-1">
                    <Layers className="w-6 h-6 text-amber-600 mx-auto" />
                    <span className="text-xs text-gray-600 block font-medium">Tablet</span>
                    <span className="text-xl font-extrabold font-mono text-amber-700">3%</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed font-body">
                  Hầu hết giáo viên sử dụng máy tính để thiết kế bài giảng trên studio và dùng điện thoại hoặc máy tính bảng khi thao tác quay vòng quay trả bài trong lớp học.
                </p>
              </div>
            </div>

            {/* Bảng Top Trang Được Xem Nhiều Nhất */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold font-header uppercase text-gray-900">
                Top Trang Được Xem Nhiều Nhất (Top Visited Pages)
              </h3>

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-mono uppercase text-gray-500">
                      <th className="py-3 px-4">Đường dẫn trang (URL)</th>
                      <th className="py-3 px-4">Tên trang</th>
                      <th className="py-3 px-4 text-right">Lượt xem (Views)</th>
                      <th className="py-3 px-4 text-right">Tăng trưởng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {gaData?.topPages.map((pg) => (
                      <tr key={pg.path} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600 text-xs">
                          {pg.path}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-gray-800">
                          {pg.title}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-right text-gray-900">
                          {pg.views.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 text-xs">
                          {pg.change}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: QUẢN LÝ NGƯỜI DÙNG                                                */}
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
