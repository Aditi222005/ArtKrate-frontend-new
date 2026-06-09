import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MapPin, Star, Eye, Heart, MessageCircle, Share2,
  Palette, Users, BarChart3, Info, CheckCircle,
} from "lucide-react";

const SellerProfile = () => {
  const [loading, setLoading] = useState(true);
  const [seller, setSeller] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"artworks" | "about" | "reviews" | "stats">("artworks");

  const { id } = useParams();
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchSeller = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/sellerprofile/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        });
        const profile = res.data.seller;
        setSeller(profile);
        setFollowersCount(profile.followers);
        setIsFollowing(profile.isFollowing);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching seller profile:", error);
      }
    };
    fetchSeller();
  }, [id]);

  const handleFollow = async () => {
    try {
      const res = await axios.post(`http://localhost:4000/api/follow/${id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        withCredentials: true,
      });
      setIsFollowing(res.data.following);
      setFollowersCount(res.data.followersCount);
    } catch (error) {
      console.error("Error following:", error);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/artist/${id}`;
    navigator.clipboard.writeText(url);
    // Use a toast ideally
    alert("Profile link copied to clipboard!");
  };

  if (loading || !seller) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cream-muted">Loading artist profile...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "artworks", label: `Artworks (${seller.stats?.artworks || 0})`, icon: Palette },
    { key: "about", label: "About", icon: Info },
    { key: "reviews", label: `Reviews (${seller.stats?.reviews || 0})`, icon: Star },
    { key: "stats", label: "Statistics", icon: BarChart3 },
  ] as const;

  return (
    <div className="min-h-screen bg-canvas">
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full bg-gold/4 blur-[160px]" />
        <div className="absolute bottom-1/3 right-0 w-80 h-80 rounded-full bg-terra/3 blur-[140px]" />
      </div>

      {/* ── Cover Image ──────────────────────────────────────── */}
      <div className="relative h-72 overflow-hidden">
        <img
          src="https://img.freepik.com/free-vector/monochrome-low-poly-design_1048-17214.jpg?semt=ais_hybrid&w=740"
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-canvas/30 to-canvas" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Profile Header ─────────────────────────────────── */}
        <div className="relative -mt-20 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-36 h-36 rounded-2xl border-4 border-canvas overflow-hidden shadow-2xl">
                <img
                  src={seller.avatar || "/default-avatar.png"}
                  alt={seller.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {seller.verified && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gold flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-4 h-4 text-canvas" />
                </div>
              )}
            </div>

            {/* Name + Actions */}
            <div className="flex-1 mt-4 sm:mt-0 pb-2">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="font-display text-cream text-3xl font-bold mb-1">{seller.name}</h1>
                  {seller.username && (
                    <p className="text-cream-subtle text-sm mb-1">@{seller.username}</p>
                  )}
                  <span className="inline-block px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-medium mb-2">
                    {seller.specialty}
                  </span>
                  <div className="flex items-center gap-1 text-cream-subtle text-sm">
                    <MapPin className="w-3.5 h-3.5" /> {seller.location}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => navigate(`/messages/${id}`)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-surface-border text-cream-muted hover:border-gold/40 hover:text-cream transition-all text-sm font-medium"
                  >
                    <MessageCircle className="w-4 h-4" /> Message
                  </button>
                  <button
                    onClick={handleFollow}
                    className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      isFollowing
                        ? "bg-surface border border-surface-border text-cream-muted hover:border-gold/30"
                        : "btn-terra"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFollowing ? "fill-current text-terra" : ""}`} />
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2.5 rounded-full border border-surface-border text-cream-muted hover:border-gold/40 hover:text-cream transition-all"
                    aria-label="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-gold fill-gold" />
                  <span className="text-cream font-semibold text-sm">{seller.rating}</span>
                  <span className="text-cream-subtle text-sm">({seller.stats?.reviews || 0} reviews)</span>
                </div>
                <div className="text-sm">
                  <span className="text-cream font-semibold">{followersCount.toLocaleString()}</span>
                  <span className="text-cream-subtle ml-1">followers</span>
                </div>
                <div className="text-sm">
                  <span className="text-cream font-semibold">{seller.totalViews?.toLocaleString() || 0}</span>
                  <span className="text-cream-subtle ml-1">views</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────── */}
        <div className="flex gap-1 bg-surface border border-surface-border rounded-xl p-1 mb-8">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === key
                  ? "bg-gold text-canvas"
                  : "text-cream-muted hover:text-cream"
              }`}
            >
              <Icon className="w-4 h-4 hidden sm:block" />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab Content ──────────────────────────────────────── */}

        {/* Artworks */}
        {activeTab === "artworks" && (
          <div className="pb-16">
            {seller.artworks && seller.artworks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {seller.artworks.map((artwork: any) => (
                  <div
                    key={artwork._id || artwork.id}
                    className="bg-surface border border-surface-border rounded-xl overflow-hidden group hover:border-gold/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_hsl(24_12%_4%/0.7)]"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={artwork.image}
                        alt={artwork.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-canvas/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-canvas/80 backdrop-blur-sm border border-gold/20 text-gold text-xs font-semibold">
                        ₹{artwork.price?.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-cream text-sm mb-2 line-clamp-1">{artwork.title}</h3>
                      <div className="flex items-center justify-between text-xs text-cream-subtle">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" /> {artwork.likes || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {artwork.views || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-surface border border-surface-border flex items-center justify-center mx-auto mb-4">
                  <Palette className="w-8 h-8 text-cream-subtle" />
                </div>
                <h3 className="font-display text-cream text-xl mb-2">No artworks yet</h3>
                <p className="text-cream-muted">This artist hasn't listed any works yet.</p>
              </div>
            )}
          </div>
        )}

        {/* About */}
        {activeTab === "about" && (
          <div className="pb-16">
            <div className="bg-surface border border-surface-border rounded-2xl p-6 mb-6">
              <h3 className="font-display text-cream text-lg font-semibold mb-4">About {seller.name}</h3>
              <p className="text-cream-muted leading-relaxed mb-6">{seller.bio}</p>
              <div className="divider-gold mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { label: "Specialty", value: seller.specialty },
                  { label: "Location", value: seller.location },
                  { label: "Member since", value: seller.joinDate },
                ].map(({ label, value }) => (
                  <div key={label} className="p-4 bg-surface-raised rounded-xl border border-surface-border">
                    <p className="text-gold text-xs font-medium tracking-wide uppercase mb-1">{label}</p>
                    <p className="text-cream text-sm font-medium">{value || "—"}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reviews */}
        {activeTab === "reviews" && (
          <div className="pb-16">
            <div className="bg-surface border border-surface-border rounded-2xl p-6 text-center py-16">
              <Star className="w-12 h-12 text-cream-subtle mx-auto mb-4" />
              <h3 className="font-display text-cream text-xl mb-2">Reviews Coming Soon</h3>
              <p className="text-cream-muted">Buyer reviews will appear here.</p>
            </div>
          </div>
        )}

        {/* Stats */}
        {activeTab === "stats" && (
          <div className="pb-16">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { icon: Palette, label: "Total Artworks", value: seller.stats?.artworks || 0, color: "text-gold" },
                { icon: BarChart3, label: "Total Sales", value: seller.stats?.sales || 0, color: "text-green-400" },
                { icon: Heart, label: "Total Likes", value: seller.totalLikes?.toLocaleString() || 0, color: "text-terra" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="bg-surface border border-surface-border rounded-2xl p-6 text-center group hover:border-gold/30 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-surface-raised flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>
                  <p className={`font-display text-3xl font-bold mb-1 ${color}`}>{value}</p>
                  <p className="text-cream-muted text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerProfile;
