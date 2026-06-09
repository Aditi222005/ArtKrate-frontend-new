import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  IndianRupee,
  ShoppingBag,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Clock,
  Plus,
  Upload,
  Image as ImageIcon,
  X,
  RefreshCw,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import SalesChart from "@/components/SalesChart";
import VerificationForm from "@/components/VerificationForm";
import MyArtwork from "@/components/MyArtwork";
import AIChatPopup from "@/components/AIChatPopup";
import axios from "axios";
import { toast } from "sonner";

const SellerDashboard = () => {
  const [verificationStatus, setVerificationStatus] = useState("not_submitted");
  const [selectedFiles, setSelectedFiles] = useState<{ file: File; preview: string }[]>([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const salesStats = {
    totalSales: 47,
    monthlyRevenue: 124500,
    totalRevenue: 458900,
    avgOrderValue: 26400,
  };

  const monthlyData = [
    { month: "Jan", sales: 8, revenue: 21000 },
    { month: "Feb", sales: 12, revenue: 32000 },
    { month: "Mar", sales: 15, revenue: 41000 },
    { month: "Apr", sales: 10, revenue: 28000 },
    { month: "May", sales: 18, revenue: 49500 },
    { month: "Jun", sales: 22, revenue: 58000 },
  ];

  const isVerified = verificationStatus === "verified";

  // ── Verification badge ──────────────────────────────────────────────────
  const VerificationBadge = () => {
    const configs = {
      verified: { label: "Verified Artist", class: "badge-verified", Icon: CheckCircle },
      pending: { label: "Verification Pending", class: "badge-pending", Icon: Clock },
      rejected: { label: "Verification Rejected", class: "badge-rejected", Icon: AlertCircle },
      not_submitted: { label: "Not Verified", class: "bg-surface border border-surface-border text-cream-subtle", Icon: AlertCircle },
    };
    const config = configs[verificationStatus as keyof typeof configs] || configs.not_submitted;
    const { label, class: cls, Icon } = config;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cls}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  // ── AI analysis ────────────────────────────────────────────────────────
  const analyzeArtworkAI = async (file: File) => {
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await axios.post("/api/ai/analyze-art", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      const result = res.data.response;
      if (result.title) setTitle(result.title);
      if (result.description) setDescription(result.description);
      if (result.category) setCategory(result.category.toLowerCase());
      if (result.price) setPrice(result.price);
      toast.success("✨ AI suggestions applied!", { duration: 3000 });
    } catch {
      toast.error("AI analysis failed. Fill details manually.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    axios
      .get("/api/verify-seller-status", { withCredentials: true })
      .then((res) => setVerificationStatus(res.data?.status || "not_submitted"))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isVerified) return;
    axios
      .get("/api/order/seller", { withCredentials: true })
      .then((res) => setOrders(res.data.orders || []))
      .catch(() => toast.error("Failed to load orders"));
  }, [isVerified]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const previews = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setSelectedFiles(previews);
    if (previews.length > 0) analyzeArtworkAI(previews[0].file);
  };

  const removeFile = (idx: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!title || !price || !category || !description || selectedFiles.length === 0) {
      toast.error("Please fill all fields and upload at least one image.");
      return;
    }
    setIsPosting(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("description", description);
    selectedFiles.forEach(({ file }) => formData.append("images", file));

    try {
      await axios.post("/api/sellerpost/create", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Artwork published successfully! 🎨");
      setTitle(""); setPrice(""); setCategory(""); setDescription(""); setSelectedFiles([]);
    } catch {
      toast.error("Failed to publish artwork. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, currentStatus: string) => {
    const next = currentStatus === "Pending" ? "Processing" : currentStatus === "Processing" ? "Completed" : null;
    if (!next) return;
    try {
      await axios.patch(`/api/order/${orderId}/status`, { status: next }, { withCredentials: true });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: next } : o)));
      toast.success(`Order status updated to ${next}`);
    } catch {
      toast.error("Failed to update order status");
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      Completed: "badge-verified",
      Processing: "bg-admin-bg border border-admin-border text-admin-accent",
      Pending: "badge-pending",
      Failed: "badge-rejected",
    };
    return map[status] || "bg-surface border border-surface-border text-cream-subtle";
  };

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <p className="text-gold text-xs tracking-[0.2em] uppercase mb-2">Artist Portal</p>
            <h1 className="font-display text-cream text-3xl font-bold">Dashboard</h1>
            <p className="text-cream-muted text-sm mt-1">Manage your artwork, orders, and earnings</p>
          </div>
          <VerificationBadge />
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className={`grid w-full ${isVerified ? "grid-cols-5" : "grid-cols-3"} bg-surface border border-surface-border rounded-xl p-1 gap-1`}>
            {[
              { value: "analytics", label: "Analytics" },
              { value: "verification", label: "Verification" },
              { value: "orders", label: "Orders" },
              ...(isVerified
                ? [{ value: "post-artwork", label: "Post Artwork" }, { value: "my-artwork", label: "My Artworks" }]
                : []),
            ].map(({ value, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="rounded-lg text-cream-muted data-[state=active]:bg-gold data-[state=active]:text-canvas data-[state=active]:font-semibold text-sm transition-all"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Analytics Tab ─────────────────────────────────────── */}
          <TabsContent value="analytics" className="space-y-6">
            {verificationStatus !== "verified" && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-gold/8 border border-gold/20">
                <AlertCircle className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-cream text-sm font-medium">Verification Required</p>
                  <p className="text-cream-muted text-sm mt-0.5">
                    Complete identity verification to post artwork and receive payments.
                  </p>
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Monthly Sales", value: salesStats.totalSales, suffix: " orders", Icon: ShoppingBag, trend: "+12%" },
                { label: "Monthly Revenue", value: `₹${salesStats.monthlyRevenue.toLocaleString("en-IN")}`, suffix: "", Icon: IndianRupee, trend: "+8%" },
                { label: "Avg Order Value", value: `₹${salesStats.avgOrderValue.toLocaleString("en-IN")}`, suffix: "", Icon: TrendingUp, trend: "+15%" },
                { label: "Total Revenue", value: `₹${salesStats.totalRevenue.toLocaleString("en-IN")}`, suffix: "", Icon: BarChart3, sub: "All time" },
              ].map(({ label, value, suffix, Icon, trend, sub }, i) => (
                <div key={i} className="p-6 rounded-2xl bg-surface border border-surface-border hover:border-gold/20 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-cream-muted text-xs font-medium tracking-wide">{label}</span>
                    <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                      <Icon className="w-4 h-4 text-gold" />
                    </div>
                  </div>
                  <p className="font-display text-cream text-2xl font-bold">{value}{suffix}</p>
                  {trend && (
                    <p className="text-green-400 text-xs flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />{trend} from last month
                    </p>
                  )}
                  {sub && <p className="text-cream-subtle text-xs mt-1">{sub}</p>}
                </div>
              ))}
            </div>

            {/* Sales Chart */}
            <div className="p-6 rounded-2xl bg-surface border border-surface-border">
              <h3 className="font-display text-cream text-lg font-semibold mb-6">Monthly Performance</h3>
              <SalesChart data={monthlyData} />
            </div>
          </TabsContent>

          {/* ── Verification Tab ──────────────────────────────────── */}
          <TabsContent value="verification">
            <VerificationForm status={verificationStatus} onStatusChange={setVerificationStatus} />
          </TabsContent>

          {/* ── Orders Tab ───────────────────────────────────────── */}
          <TabsContent value="orders">
            <div className="p-6 rounded-2xl bg-surface border border-surface-border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-cream text-lg font-semibold">Order Management</h3>
                <button
                  onClick={() =>
                    axios.get("/api/order/seller", { withCredentials: true })
                      .then((r) => setOrders(r.data.orders || []))
                  }
                  className="btn-gold-outline text-xs py-1.5 px-3 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>
              {orders.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag className="w-12 h-12 text-cream-subtle mx-auto mb-4" />
                  <p className="text-cream-muted font-medium">No orders yet</p>
                  <p className="text-cream-subtle text-sm mt-1">Orders will appear here once customers purchase your artwork</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order._id} className="p-4 rounded-xl bg-surface-raised border border-surface-border hover:border-gold/20 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-cream font-medium">{order.artworkTitle}</h4>
                          <p className="text-cream-subtle text-xs font-mono">#{order._id.slice(-8)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gold font-display font-semibold">₹{order.price?.toLocaleString("en-IN")}</p>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${statusBadge(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-cream-subtle">
                        <div className="flex gap-4">
                          <span>Buyer: <span className="text-cream-muted">{order.buyerId?.name || "—"}</span></span>
                          <span>{new Date(order.createdAt).toLocaleDateString("en-IN")}</span>
                        </div>
                        {order.status !== "Completed" && order.status !== "Failed" && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order._id, order.status)}
                            className="btn-gold-outline text-xs py-1 px-3"
                          >
                            Advance Status
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Post Artwork Tab ─────────────────────────────────── */}
          {isVerified && (
            <TabsContent value="post-artwork">
              <div className="p-6 rounded-2xl bg-surface border border-surface-border">
                <div className="flex items-center gap-2 mb-6">
                  <Plus className="w-5 h-5 text-gold" />
                  <h3 className="font-display text-cream text-lg font-semibold">Post New Artwork</h3>
                  {isAnalyzing && (
                    <span className="ml-auto text-xs text-gold flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                      AI analyzing...
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Image Upload */}
                  <div>
                    <h4 className="text-cream-muted text-sm font-medium mb-3">Artwork Images</h4>
                    <div
                      className="border-2 border-dashed border-surface-border rounded-xl p-8 text-center cursor-pointer hover:border-gold/40 transition-colors"
                      onClick={() => document.getElementById("artwork-files")?.click()}
                    >
                      <ImageIcon className="w-10 h-10 text-cream-subtle mx-auto mb-3" />
                      <p className="text-cream-muted text-sm font-medium">Upload artwork images</p>
                      <p className="text-cream-subtle text-xs mt-1">PNG, JPG, JPEG (max 10MB each)</p>
                      <button className="btn-gold-outline text-xs py-1.5 px-4 mt-4 pointer-events-none">
                        <Upload className="w-3 h-3 inline mr-1" /> Choose Files
                      </button>
                      <input
                        id="artwork-files"
                        type="file"
                        multiple
                        accept=".png,.jpg,.jpeg"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>

                    {selectedFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {selectedFiles.map(({ file, preview }, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-raised border border-surface-border">
                            <img src={preview} alt="Preview" className="w-10 h-10 rounded object-cover" />
                            <span className="text-cream-muted text-xs flex-1 truncate">{file.name}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                              className="text-cream-subtle hover:text-terra transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Details Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-cream-muted text-sm font-medium mb-1.5">Title</label>
                      <input
                        type="text"
                        className="input-dark"
                        placeholder="e.g. Monsoon Reverie"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-cream-muted text-sm font-medium mb-1.5">Price (₹)</label>
                      <input
                        type="number"
                        className="input-dark"
                        placeholder="e.g. 45000"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-cream-muted text-sm font-medium mb-1.5">Category</label>
                      <select
                        className="input-dark"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option value="">Select category</option>
                        <option value="paintings">Paintings</option>
                        <option value="photography">Photography</option>
                        <option value="sculptures">Sculptures</option>
                        <option value="digital art">Digital Art</option>
                        <option value="mixed media">Mixed Media</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-cream-muted text-sm font-medium mb-1.5">Description</label>
                  <textarea
                    className="input-dark resize-none"
                    rows={4}
                    placeholder="Describe your artwork, technique, and inspiration..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={handleSubmit}
                    disabled={isPosting}
                    className="btn-terra flex items-center gap-2 disabled:opacity-60"
                  >
                    {isPosting ? (
                      <><div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" /> Publishing...</>
                    ) : (
                      <><Upload className="w-4 h-4" /> Publish Artwork</>
                    )}
                  </button>
                </div>
              </div>
              <AIChatPopup />
            </TabsContent>
          )}

          {/* ── My Artworks Tab ───────────────────────────────────── */}
          <TabsContent value="my-artwork">
            <MyArtwork />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SellerDashboard;
