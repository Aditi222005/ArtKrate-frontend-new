import { useEffect, useState } from "react";
import {
  User, Mail, Phone, MapPin, Edit, Camera,
  Heart, ShoppingBag, Palette, Star, TrendingUp, Save, X, Loader2,
  Calendar, ChevronRight, CreditCard, CheckCircle2, Clock, AlertTriangle,
  Trash2, ExternalLink, Package, Bell, MessageSquare, Plus, FileText
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

// ── Order Tracking Timeline ──────────────────────────────────────────────────
const OrderTrackingTimeline = ({ status }: { status: string }) => {
  const steps = ["Placed", "Confirmed", "Packed", "Shipped", "Delivered"];
  
  const getStepStatus = (stepIndex: number) => {
    if (status === "Failed" || status === "Refunded") {
      return stepIndex === 0 ? "completed" : stepIndex === 1 ? "failed" : "upcoming";
    }
    if (status === "Completed") {
      return "completed";
    }
    if (status === "Processing") {
      return stepIndex <= 2 ? "completed" : "upcoming";
    }
    if (status === "Shipped") {
      return stepIndex <= 3 ? "completed" : "upcoming";
    }
    return stepIndex === 0 ? "completed" : "upcoming"; // Pending
  };

  return (
    <div className="flex items-center w-full mt-4 mb-6 px-4">
      {steps.map((step, idx) => {
        const stepStatus = getStepStatus(idx);
        return (
          <div key={step} className="flex-1 flex items-center last:flex-none">
            <div className="flex flex-col items-center relative">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                stepStatus === "completed" 
                  ? "bg-gold text-canvas shadow-[0_0_12px_rgba(201,168,76,0.3)]" 
                  : stepStatus === "failed" 
                  ? "bg-red-500/20 text-red-500 border border-red-500/50" 
                  : "bg-surface-raised text-cream-subtle border border-surface-border"
              }`}>
                {stepStatus === "completed" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : stepStatus === "failed" ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  idx + 1
                )}
              </div>
              <span className={`text-[11px] mt-1.5 font-medium whitespace-nowrap ${
                stepStatus === "completed" ? "text-cream" : "text-cream-subtle"
              }`}>
                {step === "Delivered" && (status === "Failed" || status === "Refunded") ? status : step}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 rounded transition-all duration-300 ${
                getStepStatus(idx + 1) === "completed" ? "bg-gold" : "bg-surface-border"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

const Profile = () => {
  const [activeTab, setActiveTab] = useState<
    "profile" | "artworks" | "activity" | "orders" | "wishlist" | "following" | "addresses" | "payments" | "reviews" | "notifications"
  >("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState({
    _id: "",
    name: "",
    email: "",
    phoneno: "",
    country: "",
    address: "",
    bio: "",
    avatar: "",
    avatarFile: null as File | null,
    userType: "",
    joinDate: "",
    followers: [] as string[],
    following: [] as string[],
    addresses: [] as any[],
    paymentMethods: [] as any[],
  });

  // ── Tab loading/error states ────────────────────────────────────
  const [activities, setActivities] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const [userArtworks, setUserArtworks] = useState<any[]>([]);
  const [artworksLoading, setArtworksLoading] = useState(false);

  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const [wishlist, setWishlist] = useState<any[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const [myReviews, setMyReviews] = useState<any[]>([]);
  const [myReviewsLoading, setMyReviewsLoading] = useState(false);

  const [followedArtists, setFollowedArtists] = useState<any[]>([]);
  const [followedArtistsLoading, setFollowedArtistsLoading] = useState(false);

  // Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressLabel, setAddressLabel] = useState("Home");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressState, setAddressState] = useState("");
  const [addressZip, setAddressZip] = useState("");
  const [addressCountry, setAddressCountry] = useState("India");
  const [addressDefault, setAddressDefault] = useState(false);

  // Payment Form State
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [cardType, setCardType] = useState("Visa");
  const [cardLast4, setCardLast4] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [upiId, setUpiId] = useState("");
  const [paymentDefault, setPaymentDefault] = useState(false);

  // Review Form State
  const [reviewOrderId, setReviewOrderId] = useState("");
  const [reviewArtworkId, setReviewArtworkId] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImageFile, setReviewImageFile] = useState<File | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Fetch initial profile
  const fetchProfile = async () => {
    try {
      const res = await axios.get("/api/me", { withCredentials: true });
      const user = res.data.user;
      setUserProfile({
        ...user,
        bio: user.bio || (user.userType === "seller" 
          ? "Passionate digital artist creating abstract compositions and modern landscapes."
          : "Art collector and enthusiast passionate about modern expressionism and digital masterpieces."),
        joinDate: user.createdAt 
          ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })
          : "March 2026",
        avatar: user.profilePhoto || "",
        avatarFile: null,
        followers: user.followers || [],
        following: user.following || [],
        addresses: user.addresses || [],
        paymentMethods: user.paymentMethods || [],
      });
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Fetch tab content on changes
  useEffect(() => {
    if (activeTab === "artworks" && userProfile.userType === "seller") {
      const fetchArtworks = async () => {
        setArtworksLoading(true);
        try {
          const res = await axios.get("/api/sellerpost/mine", { withCredentials: true });
          const mapped = (res.data as any[]).map((p: any) => ({
            id: p._id,
            title: p.title,
            artist: userProfile.name || "You",
            price: p.price,
            image: p.images?.[0] || "",
            likes: p.likes?.length ?? 0,
            category: p.category,
          }));
          setUserArtworks(mapped);
        } catch (err) {
          console.error(err);
        } finally {
          setArtworksLoading(false);
        }
      };
      fetchArtworks();
    }

    if (activeTab === "orders" && userProfile.userType === "buyer") {
      const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
          const res = await axios.get("/api/order/buyer", { withCredentials: true });
          setOrders(res.data.orders || []);
        } catch (err) {
          console.error(err);
        } finally {
          setOrdersLoading(false);
        }
      };
      fetchOrders();
    }

    if (activeTab === "wishlist" && userProfile.userType === "buyer") {
      const fetchWishlist = async () => {
        setWishlistLoading(true);
        try {
          const res = await axios.get("/api/artwork/liked/mine", { withCredentials: true });
          setWishlist(res.data.artworks || []);
        } catch (err) {
          console.error(err);
        } finally {
          setWishlistLoading(false);
        }
      };
      fetchWishlist();
    }

    if (activeTab === "activity") {
      const fetchActivity = async () => {
        setActivityLoading(true);
        try {
          const res = await axios.get("/api/activity", { withCredentials: true });
          setActivities(res.data.activities || []);
        } catch (err) {
          console.error(err);
        } finally {
          setActivityLoading(false);
        }
      };
      fetchActivity();
    }

    if (activeTab === "notifications") {
      const fetchNotifications = async () => {
        setNotificationsLoading(true);
        try {
          const res = await axios.get("/api/me/notifications", { withCredentials: true });
          setNotifications(res.data.notifications || []);
        } catch (err) {
          console.error(err);
        } finally {
          setNotificationsLoading(false);
        }
      };
      fetchNotifications();
    }

    if (activeTab === "reviews") {
      const fetchReviews = async () => {
        setMyReviewsLoading(true);
        try {
          const res = await axios.get("/api/me/reviews", { withCredentials: true });
          setMyReviews(res.data.reviews || []);
        } catch (err) {
          console.error(err);
        } finally {
          setMyReviewsLoading(false);
        }
      };
      fetchReviews();
    }

    if (activeTab === "following") {
      const fetchFollowing = async () => {
        setFollowedArtistsLoading(true);
        try {
          // Fetch all artists and filter by userProfile.following ID list
          const res = await axios.get("/api/sellerpost/artists", { withCredentials: true });
          setFollowedArtists(res.data.artists || []);
        } catch (err) {
          console.error(err);
        } finally {
          setFollowedArtistsLoading(false);
        }
      };
      fetchFollowing();
    }
  }, [activeTab, userProfile.userType]);

  const handleSaveProfile = async () => {
    try {
      const formData = new FormData();
      formData.append("name", userProfile.name);
      formData.append("phoneno", userProfile.phoneno || "");
      formData.append("country", userProfile.country || "");
      formData.append("address", userProfile.address || "");
      formData.append("bio", userProfile.bio || "");
      if (userProfile.avatarFile) {
        formData.append("profilePhoto", userProfile.avatarFile);
      }

      const response = await axios.put("/api/me/update", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUserProfile(prev => ({
        ...prev,
        ...response.data.user,
        avatar: response.data.user.profilePhoto,
        avatarFile: null,
      }));
      setIsEditing(false);
      toast.success("Profile details updated successfully!");
    } catch (error) {
      console.error("Failed to update profile", error);
      toast.error("Failed to update profile.");
    }
  };

  const handleRemoveFromWishlist = async (e: React.MouseEvent, artworkId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await axios.post(
        `/api/artwork/${artworkId}/like`,
        {},
        { withCredentials: true }
      );
      if (!res.data.liked) {
        setWishlist(prev => prev.filter(item => item._id !== artworkId));
        toast.success("Removed from wishlist");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove from wishlist");
    }
  };

  // Add Address Action
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressStreet || !addressCity || !addressState || !addressZip) {
      toast.error("All address fields are required.");
      return;
    }
    try {
      const res = await axios.post("/api/me/addresses", {
        label: addressLabel,
        street: addressStreet,
        city: addressCity,
        state: addressState,
        zipCode: addressZip,
        country: addressCountry,
        isDefault: addressDefault
      }, { withCredentials: true });

      setUserProfile(prev => ({ ...prev, addresses: res.data.addresses }));
      setShowAddressForm(false);
      setAddressStreet("");
      setAddressCity("");
      setAddressState("");
      setAddressZip("");
      toast.success("Shipping address added successfully!");
    } catch (err) {
      toast.error("Failed to add address.");
    }
  };

  // Delete Address Action
  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await axios.delete(`/api/me/addresses/${id}`, { withCredentials: true });
      setUserProfile(prev => ({ ...prev, addresses: res.data.addresses }));
      toast.success("Address deleted.");
    } catch (err) {
      toast.error("Failed to delete address.");
    }
  };

  // Add Payment Method Action
  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiId && (!cardLast4 || !cardExpiry)) {
      toast.error("Please provide Card details or a valid UPI ID.");
      return;
    }
    try {
      const res = await axios.post("/api/me/payments", {
        cardType: upiId ? "UPI" : cardType,
        cardLast4: upiId ? "" : cardLast4.slice(-4),
        cardExpiry: upiId ? "" : cardExpiry,
        upiId,
        isDefault: paymentDefault
      }, { withCredentials: true });

      setUserProfile(prev => ({ ...prev, paymentMethods: res.data.paymentMethods }));
      setShowPaymentForm(false);
      setCardLast4("");
      setCardExpiry("");
      setUpiId("");
      toast.success("Payment method linked successfully!");
    } catch (err) {
      toast.error("Failed to link payment method.");
    }
  };

  // Delete Payment Action
  const handleDeletePayment = async (id: string) => {
    try {
      const res = await axios.delete(`/api/me/payments/${id}`, { withCredentials: true });
      setUserProfile(prev => ({ ...prev, paymentMethods: res.data.paymentMethods }));
      toast.success("Payment method unlinked.");
    } catch (err) {
      toast.error("Failed to unlink payment.");
    }
  };

  // Submit Review Action
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment) {
      toast.error("Comment cannot be empty.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("artworkId", reviewArtworkId);
      formData.append("orderId", reviewOrderId);
      formData.append("rating", String(reviewRating));
      formData.append("comment", reviewComment);
      if (reviewImageFile) {
        formData.append("reviewImage", reviewImageFile);
      }

      await axios.post("/api/me/reviews", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });

      setShowReviewModal(false);
      setReviewComment("");
      setReviewImageFile(null);
      toast.success("Thank you for your feedback! Review posted.");
      // Refresh orders
      const ordRes = await axios.get("/api/order/buyer", { withCredentials: true });
      setOrders(ordRes.data.orders || []);
    } catch (err) {
      toast.error("Failed to submit review.");
    }
  };

  // Mark Notification Read
  const handleMarkRead = async (id: string) => {
    try {
      const res = await axios.patch(`/api/me/notifications/${id}/read`, {}, { withCredentials: true });
      setNotifications(prev => prev.map(n => n._id === id ? res.data.notification : n));
    } catch (err) {
      console.error(err);
    }
  };

  // Print/Download Invoice Action
  const handlePrintInvoice = (order: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>ArtKrate Invoice Receipt</title>
          <style>
            body { font-family: 'Playfair Display', serif; padding: 40px; background-color: #ffffff; color: #111; }
            .header { text-align: center; border-bottom: 2px solid #C9A84C; padding-bottom: 20px; }
            .invoice-title { font-size: 28px; color: #111; letter-spacing: 2px; text-transform: uppercase; }
            .meta { margin: 20px 0; font-size: 14px; line-height: 1.6; }
            .details-table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            .details-table th, .details-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .details-table th { background-color: #f9f9f9; }
            .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; color: #C9A84C; }
            .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #888; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="invoice-title">ArtKrate Marketplace</h1>
            <p>Official Purchase Invoice Receipt</p>
          </div>
          <div class="meta">
            <p><strong>Invoice ID:</strong> INV-${order._id.toUpperCase()}</p>
            <p><strong>Date of Sale:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Purchased By:</strong> ${userProfile.name} (${userProfile.email})</p>
            <p><strong>Shipping Location:</strong> ${userProfile.address || "Digital Delivery"}</p>
          </div>
          <table class="details-table">
            <thead>
              <tr>
                <th>Artwork Item</th>
                <th>Category</th>
                <th>Artist</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${order.artworkTitle}</td>
                <td>Original Artwork</td>
                <td>${order.sellerId?.name || "Unknown Seller"}</td>
                <td>₹${order.price.toLocaleString("en-IN")}</td>
              </tr>
            </tbody>
          </table>
          <p class="total">Total Sum Paid: ₹${order.price.toLocaleString("en-IN")}</p>
          <div class="footer">
            <p>Thank you for supporting global independent fine art creators.</p>
            <p>ArtKrate Editorial Luxury Marketplace &copy; 2026</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const tabs = userProfile.userType === "seller"
    ? ([
        { key: "profile", label: "Profile", icon: User },
        { key: "artworks", label: "My Listings", icon: Palette },
        { key: "activity", label: "Activity", icon: TrendingUp },
      ] as const)
    : ([
        { key: "profile", label: "Profile", icon: User },
        { key: "orders", label: "Orders", icon: ShoppingBag },
        { key: "wishlist", label: "Wishlist", icon: Heart },
        { key: "following", label: "Artists", icon: User },
        { key: "addresses", label: "Addresses", icon: MapPin },
        { key: "payments", label: "Payments", icon: CreditCard },
        { key: "reviews", label: "My Reviews", icon: MessageSquare },
        { key: "notifications", label: "Alerts", icon: Bell },
        { key: "activity", label: "Activity", icon: TrendingUp },
      ] as const);

  const totalPurchases = orders.length;
  const collectionValue = orders
    .filter(o => o.status === "Completed")
    .reduce((sum, o) => sum + o.price, 0);
  const favoritesCount = wishlist.length;

  const statCards = userProfile.userType === "seller"
    ? [
        { icon: ShoppingBag, value: 12, label: "Listed" },
        { icon: TrendingUp, value: "₹45,000", label: "Earned" },
        { icon: Heart, value: userProfile.followers?.length || 0, label: "Followers" },
        { icon: Star, value: 4.9, label: "Rating" },
      ]
    : [
        { icon: ShoppingBag, value: totalPurchases, label: "Orders" },
        { icon: TrendingUp, value: `₹${collectionValue.toLocaleString("en-IN")}`, label: "Spent" },
        { icon: Heart, value: favoritesCount, label: "Wishlist" },
        { icon: User, value: userProfile.following?.length || 0, label: "Following" },
      ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "text-green-400 bg-green-500/10 border-green-500/20";
      case "Processing": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "Shipped": return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      case "Pending": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "Failed": return "text-red-400 bg-red-500/10 border-red-500/20";
      default: return "text-cream-muted bg-surface-raised border-surface-border";
    }
  };

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />

      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full bg-gold/3 blur-[160px]" />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 rounded-full bg-terra/3 blur-[140px]" />
      </div>

      <div className="relative z-10 pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* ── Left Profile Details Card ──────────────────── */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-surface border border-surface-border rounded-2xl overflow-hidden shadow-xl">
                <div className="h-28 bg-gradient-to-br from-gold/20 via-surface-raised to-terra/10 relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface/60" />
                </div>

                <div className="px-6 pb-6 -mt-14 relative">
                  {/* Avatar */}
                  <div className="relative w-fit mb-4">
                    <div className="w-20 h-20 rounded-full border-4 border-surface overflow-hidden bg-surface-raised shadow-xl">
                      {userProfile.avatar ? (
                        <img src={userProfile.avatar} alt={userProfile.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gold/30 to-ochre/30">
                          <span className="font-display text-gold text-2xl font-bold">
                            {userProfile.name?.split(" ").map(n => n[0]).join("") || "?"}
                          </span>
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-gold text-canvas flex items-center justify-center cursor-pointer shadow-lg hover:bg-gold-hover transition-colors">
                        <Camera className="w-3.5 h-3.5" />
                        <input type="file" accept="image/*" className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setUserProfile(prev => ({
                              ...prev,
                              avatarFile: file,
                              avatar: URL.createObjectURL(file),
                            }));
                          }}
                        />
                      </label>
                    )}
                  </div>

                  <h2 className="font-display text-cream text-xl font-bold mb-1">{userProfile.name || "Loading..."}</h2>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-medium mb-2 capitalize">
                    {userProfile.userType || "Member"}
                  </span>
                  <p className="text-cream-muted text-sm leading-relaxed mb-2">{userProfile.bio}</p>
                  <p className="text-cream-subtle text-[11px]">Member since {userProfile.joinDate}</p>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-px bg-surface-border mx-6 mb-6 rounded-xl overflow-hidden border border-surface-border shadow-inner">
                  {statCards.map(({ icon: Icon, value, label }) => (
                    <div key={label} className="bg-surface p-4 text-center group hover:bg-surface-raised transition-all duration-200">
                      <Icon className="w-4 h-4 text-gold mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
                      <p className="font-display text-cream text-lg font-bold">{value}</p>
                      <p className="text-cream-subtle text-xs">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="px-6 pb-6">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`w-full py-2.5 rounded-full text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 border ${
                      isEditing ? "border-surface-border text-cream-muted hover:text-cream" : "border-gold/40 text-gold hover:bg-gold/10"
                    }`}
                  >
                    {isEditing ? <><X className="w-4 h-4" /> Cancel</> : <><Edit className="w-4 h-4" /> Edit Profile</>}
                  </button>
                </div>
              </div>
            </div>

            {/* ── Right Content Panel ────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tab Bar */}
              <div className="flex gap-1 bg-surface border border-surface-border rounded-xl p-1 shadow-md overflow-x-auto">
                {tabs.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      activeTab === key ? "bg-gold text-canvas shadow-lg" : "text-cream-muted hover:text-cream"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="bg-surface border border-surface-border rounded-2xl p-6 shadow-xl space-y-6">
                  <h3 className="font-display text-cream text-lg font-semibold border-b border-surface-border/40 pb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-gold" /> Profile Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      { label: "Full Name", field: "name", icon: User, type: "text", placeholder: "Your name" },
                      { label: "Email Address", field: "email", icon: Mail, type: "email", placeholder: "you@example.com" },
                      { label: "Phone Number", field: "phoneno", icon: Phone, type: "tel", placeholder: "+91 99999 00000" },
                      { label: "Country", field: "country", icon: MapPin, type: "text", placeholder: "Your country" },
                    ].map(({ label, field, icon: Icon, type, placeholder }) => (
                      <div key={field}>
                        <label className="block text-cream-muted text-xs font-medium mb-1.5">{label}</label>
                        <div className="relative">
                          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-subtle" />
                          <input
                            type={type}
                            value={(userProfile as any)[field] || ""}
                            onChange={(e) => setUserProfile({ ...userProfile, [field]: e.target.value })}
                            disabled={!isEditing || field === "email"}
                            placeholder={placeholder}
                            className={`input-dark pl-10 text-sm ${(!isEditing || field === "email") ? "opacity-60 cursor-not-allowed" : ""}`}
                          />
                        </div>
                      </div>
                    ))}

                    <div className="md:col-span-2">
                      <label className="block text-cream-muted text-xs font-medium mb-1.5">Bio / Collector Statement</label>
                      <textarea
                        value={userProfile.bio || ""}
                        onChange={(e) => setUserProfile({ ...userProfile, bio: e.target.value })}
                        disabled={!isEditing}
                        rows={3}
                        placeholder="Tell us about yourself..."
                        className={`w-full bg-surface-raised border border-surface-border text-cream placeholder:text-cream-subtle rounded-lg px-4 py-3 resize-none text-sm transition-all duration-200 focus:outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/10 ${!isEditing ? "opacity-60 cursor-default" : ""}`}
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-3 pt-4 border-t border-surface-border">
                      <button onClick={handleSaveProfile} className="btn-terra flex items-center gap-2 px-6 py-2.5 text-sm">
                        <Save className="w-4 h-4" /> Save Changes
                      </button>
                      <button onClick={() => setIsEditing(false)} className="btn-gold-outline px-6 py-2.5 text-sm">Cancel</button>
                    </div>
                  )}
                </div>
              )}

              {/* Order History Tab */}
              {activeTab === "orders" && (
                <div className="bg-surface border border-surface-border rounded-2xl p-6 shadow-xl space-y-6">
                  <h3 className="font-display text-cream text-lg font-semibold border-b border-surface-border/40 pb-3 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-gold" /> My Order History
                  </h3>

                  {ordersLoading ? (
                    <div className="text-center py-12 text-cream-subtle">Loading orders...</div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-16 space-y-3">
                      <p className="text-cream-muted text-sm">No purchases yet.</p>
                      <Link to="/marketplace" className="inline-block btn-gold-outline text-xs px-6 py-2">Explore Marketplace</Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order._id} className="bg-surface-raised border border-surface-border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface flex-shrink-0 border border-surface-border">
                              <img src={order.artworkId?.images?.[0] || "https://placehold.co/150"} alt={order.artworkTitle} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <h4 className="font-display text-cream text-base font-semibold truncate hover:text-gold">
                                <Link to={`/artwork/${order.artworkId?._id}`}>{order.artworkTitle}</Link>
                              </h4>
                              <p className="text-cream-muted text-xs">Artist: {order.sellerId?.name || "Unknown Artist"}</p>
                              <p className="text-cream-subtle text-[11px] mt-1">Ordered: {new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>

                          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3">
                            <div className="text-left md:text-right">
                              <span className="font-display text-gold text-base font-bold">₹{order.price.toLocaleString("en-IN")}</span>
                              <div className="mt-1">
                                <span className={`inline-block text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setIsOrderModalOpen(true);
                                }}
                                className="text-xs text-cream hover:text-gold flex items-center gap-1 py-1.5 px-3 bg-surface rounded-lg border border-surface-border"
                              >
                                Details
                              </button>
                              <button
                                onClick={() => handlePrintInvoice(order)}
                                className="text-xs text-cream hover:text-gold flex items-center gap-1 py-1.5 px-3 bg-surface rounded-lg border border-surface-border"
                                title="Download invoice Receipt"
                              >
                                <FileText className="w-3.5 h-3.5" /> Receipt
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === "wishlist" && (
                <div className="bg-surface border border-surface-border rounded-2xl p-6 shadow-xl space-y-6">
                  <h3 className="font-display text-cream text-lg font-semibold border-b border-surface-border/40 pb-3 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-gold" /> My Wishlist
                  </h3>

                  {wishlistLoading ? (
                    <div className="text-center py-12 text-cream-subtle">Loading wishlist...</div>
                  ) : wishlist.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-cream-muted text-sm">Your wishlist is empty.</p>
                      <Link to="/marketplace" className="inline-block btn-gold-outline text-xs px-6 py-2 mt-4">Explore Marketplace</Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {wishlist.map((art) => (
                        <div key={art._id} className="bg-surface-raised border border-surface-border rounded-xl p-4 flex flex-col justify-between h-full relative">
                          <button
                            onClick={(e) => handleRemoveFromWishlist(e, art._id)}
                            className="absolute top-2 right-2 p-1.5 bg-canvas/80 rounded-full border border-surface-border text-terra hover:scale-105"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="aspect-square rounded-lg overflow-hidden bg-surface mb-3">
                            <img src={art.images?.[0]} alt={art.title} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h4 className="font-display text-cream text-base font-bold truncate">{art.title}</h4>
                            <p className="text-cream-subtle text-xs">By {art.sellerId?.name || "Unknown Artist"}</p>
                            <p className="text-gold font-semibold mt-2">₹{art.price?.toLocaleString("en-IN")}</p>
                          </div>
                          <Link to={`/artwork/${art._id}`} className="btn-gold-outline w-full text-center text-xs py-2 mt-3 block">View Details</Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Following Tab */}
              {activeTab === "following" && (
                <div className="bg-surface border border-surface-border rounded-2xl p-6 shadow-xl space-y-6">
                  <h3 className="font-display text-cream text-lg font-semibold border-b border-surface-border/40 pb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-gold" /> Followed Artists
                  </h3>

                  {followedArtistsLoading ? (
                    <div className="text-center py-12 text-cream-subtle">Loading followed artists...</div>
                  ) : followedArtists.length === 0 ? (
                    <p className="text-center py-12 text-cream-muted text-sm">You are not following any artists yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {followedArtists.map((artist) => (
                        <div key={artist.id} className="bg-surface-raised border border-surface-border rounded-xl p-4 flex items-center gap-3">
                          <img src={artist.avatar || "/default.jpg"} alt={artist.name} className="w-12 h-12 rounded-full object-cover border border-gold" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-display text-cream text-sm font-semibold truncate">{artist.name}</h4>
                            <p className="text-cream-subtle text-xs">{artist.location}</p>
                            <p className="text-gold text-[10px] mt-0.5">{artist.followersCount} followers</p>
                          </div>
                          <Link to={`/artist/${artist.id}`} className="text-xs text-gold border border-gold/30 px-3 py-1 rounded hover:bg-gold/10">View Profile</Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === "addresses" && (
                <div className="bg-surface border border-surface-border rounded-2xl p-6 shadow-xl space-y-6">
                  <div className="flex justify-between items-center border-b border-surface-border/40 pb-3">
                    <h3 className="font-display text-cream text-lg font-semibold flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-gold" /> Shipping Addresses
                    </h3>
                    <button
                      onClick={() => setShowAddressForm(!showAddressForm)}
                      className="btn-gold flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Address
                    </button>
                  </div>

                  {showAddressForm && (
                    <form onSubmit={handleAddAddress} className="bg-surface-raised border border-surface-border rounded-xl p-4 space-y-4 animate-in fade-in">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-cream-muted text-xs block mb-1">Label (e.g. Home, Office)</label>
                          <input value={addressLabel} onChange={(e) => setAddressLabel(e.target.value)} className="input-dark text-xs" />
                        </div>
                        <div>
                          <label className="text-cream-muted text-xs block mb-1">Country</label>
                          <input value={addressCountry} onChange={(e) => setAddressCountry(e.target.value)} className="input-dark text-xs" />
                        </div>
                      </div>
                      <div>
                        <label className="text-cream-muted text-xs block mb-1">Street Address</label>
                        <input value={addressStreet} onChange={(e) => setAddressStreet(e.target.value)} className="input-dark text-xs" placeholder="Flat, House No, Building" />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-cream-muted text-xs block mb-1">City</label>
                          <input value={addressCity} onChange={(e) => setAddressCity(e.target.value)} className="input-dark text-xs" />
                        </div>
                        <div>
                          <label className="text-cream-muted text-xs block mb-1">State</label>
                          <input value={addressState} onChange={(e) => setAddressState(e.target.value)} className="input-dark text-xs" />
                        </div>
                        <div>
                          <label className="text-cream-muted text-xs block mb-1">Zip Code</label>
                          <input value={addressZip} onChange={(e) => setAddressZip(e.target.value)} className="input-dark text-xs" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="def-address" checked={addressDefault} onChange={(e) => setAddressDefault(e.target.checked)} className="rounded border-surface-border text-gold bg-canvas" />
                        <label htmlFor="def-address" className="text-cream-muted text-xs cursor-pointer">Set as default delivery address</label>
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="btn-terra text-xs py-2 px-4">Save Address</button>
                        <button type="button" onClick={() => setShowAddressForm(false)} className="btn-gold-outline text-xs py-2 px-4">Cancel</button>
                      </div>
                    </form>
                  )}

                  {userProfile.addresses.length === 0 ? (
                    <p className="text-center py-12 text-cream-muted text-sm">No saved delivery addresses found.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userProfile.addresses.map((addr) => (
                        <div key={addr._id} className="bg-surface-raised border border-surface-border rounded-xl p-4 relative flex flex-col justify-between">
                          <button
                            onClick={() => handleDeleteAddress(addr._id)}
                            className="absolute top-2 right-2 text-cream-subtle hover:text-terra"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-cream text-xs px-2.5 py-0.5 rounded bg-surface border border-surface-border">{addr.label}</span>
                              {addr.isDefault && <span className="text-[10px] text-gold border border-gold/40 px-2 rounded">Default</span>}
                            </div>
                            <p className="text-cream-muted text-xs font-sans leading-relaxed">{addr.street}</p>
                            <p className="text-cream-muted text-xs font-sans leading-relaxed">{addr.city}, {addr.state} - {addr.zipCode}</p>
                            <p className="text-cream-subtle text-[11px] font-sans mt-0.5">{addr.country}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Payments Tab */}
              {activeTab === "payments" && (
                <div className="bg-surface border border-surface-border rounded-2xl p-6 shadow-xl space-y-6">
                  <div className="flex justify-between items-center border-b border-surface-border/40 pb-3">
                    <h3 className="font-display text-cream text-lg font-semibold flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-gold" /> Payment Methods
                    </h3>
                    <button
                      onClick={() => setShowPaymentForm(!showPaymentForm)}
                      className="btn-gold flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg"
                    >
                      <Plus className="w-3.5 h-3.5" /> Link Method
                    </button>
                  </div>

                  {showPaymentForm && (
                    <form onSubmit={handleAddPayment} className="bg-surface-raised border border-surface-border rounded-xl p-4 space-y-4 animate-in fade-in">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-cream-muted text-xs block mb-1">Card Type</label>
                          <select value={cardType} onChange={(e) => setCardType(e.target.value)} className="input-dark text-xs">
                            <option value="Visa">Visa</option>
                            <option value="Mastercard">Mastercard</option>
                            <option value="Rupay">Rupay</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-cream-muted text-xs block mb-1">Card Last 4 Digits</label>
                          <input placeholder="4321" value={cardLast4} onChange={(e) => setCardLast4(e.target.value)} className="input-dark text-xs" maxLength={4} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-cream-muted text-xs block mb-1">Expiry Date</label>
                          <input placeholder="MM/YY" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} className="input-dark text-xs" />
                        </div>
                        <div>
                          <label className="text-cream-muted text-xs block mb-1">Or UPI ID</label>
                          <input placeholder="username@okaxis" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="input-dark text-xs" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="def-pay" checked={paymentDefault} onChange={(e) => setPaymentDefault(e.target.checked)} className="rounded border-surface-border text-gold bg-canvas" />
                        <label htmlFor="def-pay" className="text-cream-muted text-xs cursor-pointer">Set as default payment method</label>
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="btn-terra text-xs py-2 px-4">Link Method</button>
                        <button type="button" onClick={() => setShowPaymentForm(false)} className="btn-gold-outline text-xs py-2 px-4">Cancel</button>
                      </div>
                    </form>
                  )}

                  {userProfile.paymentMethods.length === 0 ? (
                    <p className="text-center py-12 text-cream-muted text-sm">No linked payment cards or UPI addresses.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userProfile.paymentMethods.map((pm) => (
                        <div key={pm._id} className="bg-surface-raised border border-surface-border rounded-xl p-4 relative flex flex-col justify-between">
                          <button
                            onClick={() => handleDeletePayment(pm._id)}
                            className="absolute top-2 right-2 text-cream-subtle hover:text-terra"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-cream text-xs px-2.5 py-0.5 rounded bg-surface border border-surface-border">{pm.cardType}</span>
                              {pm.isDefault && <span className="text-[10px] text-gold border border-gold/40 px-2 rounded">Default</span>}
                            </div>
                            {pm.upiId ? (
                              <p className="text-gold font-mono text-xs">{pm.upiId}</p>
                            ) : (
                              <>
                                <p className="text-cream font-mono text-sm">•••• •••• •••• {pm.cardLast4}</p>
                                <p className="text-cream-subtle text-xs mt-1">Expiry: {pm.cardExpiry}</p>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === "reviews" && (
                <div className="bg-surface border border-surface-border rounded-2xl p-6 shadow-xl space-y-6">
                  <h3 className="font-display text-cream text-lg font-semibold border-b border-surface-border/40 pb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-gold" /> My Submitted Reviews
                  </h3>

                  {myReviewsLoading ? (
                    <div className="text-center py-12 text-cream-subtle">Loading reviews...</div>
                  ) : myReviews.length === 0 ? (
                    <p className="text-center py-12 text-cream-muted text-sm">You haven't submitted any reviews yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {myReviews.map((rev) => (
                        <div key={rev._id} className="bg-surface-raised border border-surface-border rounded-xl p-4 space-y-3">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h4 className="font-display text-cream text-sm font-semibold">{rev.artworkId?.title || "Original artwork"}</h4>
                              <div className="flex items-center gap-1.5 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? "text-gold fill-gold" : "text-surface-border"}`} />
                                ))}
                                <span className="text-cream-subtle text-[11px] ml-1">{new Date(rev.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            {rev.images?.[0] && (
                              <img src={rev.images[0]} alt="Review attach" className="w-12 h-12 rounded object-cover border border-surface-border" />
                            )}
                          </div>
                          <p className="text-cream-muted text-xs leading-relaxed font-sans">{rev.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="bg-surface border border-surface-border rounded-2xl p-6 shadow-xl space-y-6">
                  <h3 className="font-display text-cream text-lg font-semibold border-b border-surface-border/40 pb-3 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-gold" /> System Alerts & Notifications
                  </h3>

                  {notificationsLoading ? (
                    <div className="text-center py-12 text-cream-subtle">Loading alerts...</div>
                  ) : notifications.length === 0 ? (
                    <p className="text-center py-12 text-cream-muted text-sm">No new notification alerts.</p>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => !notif.read && handleMarkRead(notif._id)}
                          className={`border rounded-xl p-4 transition-all flex items-start gap-3 relative cursor-pointer ${
                            notif.read ? "bg-surface-raised/40 border-surface-border/50 opacity-70" : "bg-surface-raised border-gold/20 shadow-md"
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.read ? "bg-surface-border" : "bg-gold"}`} />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-display text-cream text-sm font-semibold">{notif.title}</h4>
                            <p className="text-cream-muted text-xs mt-0.5 leading-relaxed">{notif.message}</p>
                            <span className="text-cream-subtle text-[10px] block mt-1.5">{new Date(notif.createdAt).toLocaleDateString()}</span>
                          </div>
                          {!notif.read && (
                            <button className="text-[10px] text-gold hover:underline shrink-0">Mark read</button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === "activity" && (
                <div className="bg-surface border border-surface-border rounded-2xl p-6 shadow-xl space-y-6">
                  <h3 className="font-display text-cream text-lg font-semibold border-b border-surface-border/40 pb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-gold" /> Recent Activity
                  </h3>

                  {activityLoading ? (
                    <div className="text-center py-12 text-cream-subtle">Loading activity...</div>
                  ) : activities.length === 0 ? (
                    <p className="text-center py-12 text-cream-muted text-sm">No activity recorded.</p>
                  ) : (
                    <div className="space-y-3">
                      {activities.map((item) => (
                        <div key={item._id} className="flex items-start gap-3 p-4 rounded-xl bg-surface-raised border border-surface-border shadow-sm">
                          <div className="w-2 h-2 rounded-full mt-2 bg-gold flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gold">{item.title}</p>
                            <p className="text-cream-muted text-xs mt-0.5">{item.detail}</p>
                          </div>
                          <span className="text-cream-subtle text-[10px] flex-shrink-0">{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* ── Order Details Modal ─────────────────────────────── */}
      {isOrderModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-canvas/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-surface-border max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl animate-in scale-in max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-surface-raised border-b border-surface-border flex items-center justify-between">
              <div>
                <h3 className="font-display text-cream text-lg font-bold">Order Details</h3>
                <p className="text-cream-subtle text-[11px] mt-0.5">Reference: #{selectedOrder._id}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setIsOrderModalOpen(false);
                }}
                className="p-1.5 rounded-full bg-surface border border-surface-border text-cream-muted hover:text-cream"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Timeline */}
              <div>
                <h4 className="text-cream text-xs font-semibold uppercase tracking-wider mb-2">Delivery Tracking</h4>
                <div className="bg-surface-raised border border-surface-border rounded-xl py-4 flex items-center justify-center">
                  <OrderTrackingTimeline status={selectedOrder.status} />
                </div>
              </div>

              {/* Item Details */}
              <div className="bg-surface-raised border border-surface-border rounded-xl p-4 flex gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface border border-surface-border flex-shrink-0">
                  <img src={selectedOrder.artworkId?.images?.[0] || "https://placehold.co/150"} alt={selectedOrder.artworkTitle} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1 flex flex-col justify-between">
                  <div>
                    <h5 className="font-display text-cream text-base font-semibold truncate">{selectedOrder.artworkTitle}</h5>
                    <p className="text-cream-muted text-xs mt-0.5">Artist: {selectedOrder.sellerId?.name || "Unknown Artist"}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-display text-gold text-base font-bold">₹{selectedOrder.price.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface-raised border border-surface-border rounded-xl p-4 space-y-2">
                  <h5 className="text-cream text-xs font-semibold flex items-center gap-1.5 uppercase tracking-wider border-b border-surface-border/40 pb-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gold" /> Shipping Address
                  </h5>
                  <div className="text-cream-muted text-xs space-y-1">
                    <p className="font-medium text-cream">{userProfile.name}</p>
                    <p className="italic">{userProfile.address || "Digital Delivery Address"}</p>
                    <p>{userProfile.country}</p>
                  </div>
                </div>

                <div className="bg-surface-raised border border-surface-border rounded-xl p-4 space-y-2">
                  <h5 className="text-cream text-xs font-semibold flex items-center gap-1.5 uppercase tracking-wider border-b border-surface-border/40 pb-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-gold" /> Payment Info
                  </h5>
                  <div className="text-cream-muted text-xs space-y-1">
                    <p className="flex justify-between"><span>Gateway:</span><span className="text-cream">Razorpay Secure</span></p>
                    <p className="flex justify-between pt-1 border-t border-surface-border/40"><span>Total Paid:</span><span className="font-bold text-gold">₹{selectedOrder.price.toLocaleString("en-IN")}</span></p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-surface-raised border-t border-surface-border flex justify-between items-center">
              <span className="text-[11px] text-cream-subtle">Ordered on {new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setReviewOrderId(selectedOrder._id);
                    setReviewArtworkId(selectedOrder.artworkId?._id);
                    setShowReviewModal(true);
                  }}
                  className="btn-gold px-4 py-2 text-xs"
                >
                  Write Review
                </button>
                <button
                  onClick={() => {
                    setSelectedOrder(null);
                    setIsOrderModalOpen(false);
                  }}
                  className="btn-gold-outline px-4 py-2 text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Review & Rating Modal ───────────────────────────── */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-canvas/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-surface border border-surface-border max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-surface-border pb-3">
              <h3 className="font-display text-cream text-lg font-bold">Write a Purchase Review</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-cream-muted hover:text-cream"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="text-cream-muted text-xs block mb-1">Select Rating (1 to 5 Stars)</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="text-gold"
                    >
                      <Star className={`w-6 h-6 ${star <= reviewRating ? "fill-gold text-gold" : "text-surface-border"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-cream-muted text-xs block mb-1">Review Comment</label>
                <textarea
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-surface-raised border border-surface-border text-cream rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold/50"
                  placeholder="Share your experience with this artwork..."
                />
              </div>

              <div>
                <label className="text-cream-muted text-xs block mb-1">Upload Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReviewImageFile(e.target.files?.[0] || null)}
                  className="text-xs text-cream-muted"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-terra text-xs py-2 px-4 flex-1">Submit Review</button>
                <button type="button" onClick={() => setShowReviewModal(false)} className="btn-gold-outline text-xs py-2 px-4">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
