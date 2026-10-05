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
} from "lucide-react";
import { adminDashboardService, AdminDashboardMetrics } from "@/features/admin/api/adminDashboardService";
import { OrderResponseDTO, PaymentResponseDTO } from "@edore/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const revenueData = [
  { name: "T2", revenue: 12000000 },
  { name: "T3", revenue: 15000000 },
  { name: "T4", revenue: 8000000 },
  { name: "T5", revenue: 22000000 },
  { name: "T6", revenue: 19000000 },
  { name: "T7", revenue: 25000000 },
  { name: "CN", revenue: 30000000 },
];

const pieData = [
  { name: "Starter (Free)", value: 600 },
  { name: "Pro Plan", value: 300 },
  { name: "Team Plan", value: 100 },
];
const COLORS = ["#f28c0f", "#034ce4", "#12ab83"];

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [allOrders, setAllOrders] = useState<OrderResponseDTO[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<OrderResponseDTO | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [met, ordersPage] = await Promise.all([
        adminDashboardService.getMetrics(),
        adminDashboardService.getAllOrders(0, 50),
      ]);
      setMetrics(met);
      setAllOrders(ordersPage.content || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  // Filter orders by status and search query
  const filteredOrders = allOrders.filter((ord) => {
    const matchesStatus = statusFilter === "ALL" || ord.status === statusFilter;
    const matchesQuery =
      !searchQuery ||
      (ord.gatewayOrderCode && ord.gatewayOrderCode.toString().includes(searchQuery)) ||
      (ord.subscriptionPlanName && ord.subscriptionPlanName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ord.id && ord.id.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50,#fafafa)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Admin */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-mono font-bold text-gray-500 uppercase">ADMIN DASHBOARD</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold font-header text-gray-900 tracking-tight uppercase">
              TỔNG HỢP THÔNG TIN THỰC TẾ
            </h1>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2.5 rounded-[var(--radius-md,8px)] bg-white border border-gray-200 text-[var(--color-primary-600,#0240c0)] font-bold text-sm hover:bg-gray-50 flex items-center justify-center gap-2 shadow-sm transition-all whitespace-nowrap"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Làm mới dữ liệu
          </button>
        </div>

        {/* Real KPI Metrics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Revenue */}
          <div className="p-6 rounded-[var(--radius-lg,12px)] bg-white border border-[var(--color-neutral-200,#d9d9d9)] shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold text-gray-500">TỔNG DOANH THU THỰC TẾ</span>
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-[var(--color-tertiary-500,#12ab83)] flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold font-mono text-gray-900 tracking-tight">
                {loading ? "..." : formatCurrency(metrics?.totalRevenue || 0)}
              </h3>
              <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Doanh thu thực nhận từ đơn PAID
              </p>
            </div>
          </div>

          {/* Card 2: Total Orders */}
          <div className="p-6 rounded-[var(--radius-lg,12px)] bg-white border border-[var(--color-neutral-200,#d9d9d9)] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold text-gray-500">TỔNG SỐ ĐƠN HÀNG</span>
              <div className="w-10 h-10 rounded-full bg-blue-50 text-[var(--color-primary-500,#034ce4)] flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold font-mono text-gray-900 tracking-tight">
                {loading ? "..." : metrics?.totalOrders || 0}
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-1">
                Thành công: <strong className="text-emerald-600">{metrics?.paidOrdersCount || 0}</strong> | Chờ:{" "}
                <strong className="text-amber-600">{metrics?.pendingOrdersCount || 0}</strong>
              </p>
            </div>
          </div>

          {/* Card 3: Total Users */}
          <div className="p-6 rounded-[var(--radius-lg,12px)] bg-white border border-[var(--color-neutral-200,#d9d9d9)] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold text-gray-500">TỔNG NGƯỜI DÙNG</span>
              <div className="w-10 h-10 rounded-full bg-amber-50 text-[var(--color-secondary-500,#f28c0f)] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold font-mono text-gray-900 tracking-tight">
                {loading ? "..." : metrics?.totalUsers || 0}
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-1">Tài khoản quản lý toàn hệ thống</p>
            </div>
          </div>

          {/* Card 4: Paid Conversion Rate */}
          <div className="p-6 rounded-[var(--radius-lg,12px)] bg-white border border-[var(--color-neutral-200,#d9d9d9)] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold text-gray-500">ĐƠN HOÀN TẤT (PAID)</span>
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold font-mono text-gray-900 tracking-tight">
                {loading
                  ? "..."
                  : metrics?.totalOrders
                  ? `${Math.round(((metrics.paidOrdersCount || 0) / metrics.totalOrders) * 100)}%`
                  : "0%"}
              </h3>
              <p className="text-xs text-indigo-600 font-medium mt-1">Tỷ lệ thanh toán thành công</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Bar Chart: Doanh thu 7 ngày */}
          <div className="bg-white p-6 rounded-[var(--radius-lg,12px)] border border-[var(--color-neutral-200,#d9d9d9)] shadow-sm flex flex-col">
            <h3 className="text-sm font-bold font-header uppercase text-gray-900 mb-4">Doanh Thu 7 Ngày Qua (Mock)</h3>
            <div className="flex-1 min-h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} tickFormatter={(value) => `${value / 1000000}M`} />
                  <RechartsTooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    formatter={(value: number) => [formatCurrency(value), "Doanh thu"]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="revenue" fill="var(--color-primary-500,#034ce4)" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart: Phân bố gói cước */}
          <div className="bg-white p-6 rounded-[var(--radius-lg,12px)] border border-[var(--color-neutral-200,#d9d9d9)] shadow-sm flex flex-col">
            <h3 className="text-sm font-bold font-header uppercase text-gray-900 mb-4">Phân Bố Gói Cước Người Dùng (Mock)</h3>
            <div className="flex-1 min-h-[260px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: number) => [`${value} người dùng`, "Số lượng"]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Custom Legend */}
              <div className="flex flex-wrap items-center justify-center gap-4 absolute bottom-0 left-0 right-0">
                {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    {entry.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Order Transactions Management Table */}
        <div className="bg-white rounded-[var(--radius-lg,12px)] border border-[var(--color-neutral-200,#d9d9d9)] p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-xl font-bold font-header uppercase tracking-wide text-gray-900">
                QUẢN LÝ ĐƠN HÀNG THỰC TẾ (REAL ORDERS)
              </h3>
              <p className="text-xs text-gray-500">
                Theo dõi chi tiết danh sách tất cả các đơn hàng mua gói dịch vụ từ người dùng.
              </p>
            </div>

            {/* Filter & Search Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Mã đơn hàng, tên gói..."
                  className="pl-9 pr-3 py-1.5 rounded-[var(--radius-sm,6px)] border border-gray-300 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500,#034ce4)] w-52"
                />
              </div>

              {/* Filter tabs */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-[var(--radius-md,8px)] text-xs font-semibold">
                {["ALL", "PAID", "PENDING", "CANCELLED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-[var(--radius-sm,6px)] transition-all ${
                      statusFilter === st ? "bg-white text-gray-900 shadow-sm font-bold" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {st === "ALL" ? "Tất cả" : st === "PAID" ? "Thành công" : st === "PENDING" ? "Chờ xử lý" : "Hủy/Lỗi"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-gray-500">Đang tải dữ liệu đơn hàng...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-medium">Không tìm thấy đơn hàng nào khớp với tìm kiếm.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-[var(--radius-md,8px)] border border-gray-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-mono uppercase text-gray-500">
                    <th className="py-3 px-4">Mã đơn hàng</th>
                    <th className="py-3 px-4">User ID</th>
                    <th className="py-3 px-4">Gói cước</th>
                    <th className="py-3 px-4">Số tiền (VNĐ)</th>
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
                        {ord.userId ? ord.userId.substring(0, 8) + "..." : "System"}
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
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PAID
                          </span>
                        ) : ord.status === "PENDING" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" /> PENDING
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

      {/* Modal View Admin Order Detail */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[var(--radius-xl,16px)] max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h4 className="text-lg font-bold font-header uppercase text-gray-900">
                ĐƠN HÀNG #{selectedOrder.gatewayOrderCode || selectedOrder.id.substring(0, 8)}
              </h4>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 font-mono text-xs">ID Đơn hàng:</span>
                <span className="font-mono text-xs text-gray-900">{selectedOrder.id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 font-mono text-xs">ID Người dùng:</span>
                <span className="font-mono text-xs text-gray-900">{selectedOrder.userId}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 font-mono text-xs">Tên gói cước:</span>
                <span className="font-bold text-gray-900">{selectedOrder.subscriptionPlanName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 font-mono text-xs">Giá trị thanh toán:</span>
                <span className="font-mono font-bold text-[var(--color-primary-500,#034ce4)]">
                  {formatCurrency(selectedOrder.amount)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-500 font-mono text-xs">Trạng thái:</span>
                <span className="font-bold text-emerald-600">{selectedOrder.status}</span>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-[var(--radius-md,8px)] bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs"
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
