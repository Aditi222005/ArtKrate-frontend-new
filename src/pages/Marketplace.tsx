import { useState, useEffect, useCallback } from "react";
import { Search, Grid, List, SlidersHorizontal, X, ArrowUpDown, Filter } from "lucide-react";
import Navbar from "@/components/Navbar";
import ArtworkCard from "@/components/ArtworkCard";
import axios from "axios";
import { toast } from "sonner";

const categories = [
  { value: "all", label: "All Categories" },
  { value: "paintings", label: "Paintings" },
  { value: "photography", label: "Photography" },
  { value: "sculptures", label: "Sculptures" },
  { value: "digital art", label: "Digital Art" },
  { value: "mixed media", label: "Mixed Media" },
];

const mediums = ["Oil", "Acrylic", "Watercolor", "Digital", "Bronze", "Mixed Media"];
const styles = ["Abstract", "Realism", "Contemporary", "Minimalist"];
const orientations = [
  { value: "all", label: "All Orientations" },
  { value: "portrait", label: "Portrait" },
  { value: "landscape", label: "Landscape" },
  { value: "square", label: "Square" }
];

const Marketplace = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Advanced Filters
  const [selectedMedium, setSelectedMedium] = useState("all");
  const [selectedStyle, setSelectedStyle] = useState("all");
  const [selectedOrientation, setSelectedOrientation] = useState("all");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  
  const [artwork, setArtwork] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true); // Default sidebar open

  const fetchArtworks = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (categoryFilter !== "all") params.category = categoryFilter;
      if (selectedMedium !== "all") params.medium = selectedMedium;
      if (selectedStyle !== "all") params.style = selectedStyle;
      if (selectedOrientation !== "all") params.orientation = selectedOrientation;
      if (priceMin) params.priceMin = priceMin;
      if (priceMax) params.priceMax = priceMax;
      if (searchQuery) params.search = searchQuery;

      const res = await axios.get("http://localhost:4000/api/sellerpost/all", {
        params,
        withCredentials: true
      });

      const data = res.data.posts.map((post: any) => ({
        id: post._id,
        title: post.title,
        artist: post.sellerId?.name || "Unknown artist",
        price: post.price,
        image: post.images[0],
        likes: post.likes?.length || 0,
        category: post.category,
        medium: post.medium,
        style: post.style,
      }));

      setArtwork(data);
    } catch (err) {
      console.error("Error loading artworks:", err);
      toast.error("Failed to load artworks.");
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, selectedMedium, selectedStyle, selectedOrientation, priceMin, priceMax, searchQuery]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchArtworks();
    }, 400); // Debounce search changes

    return () => clearTimeout(delayDebounce);
  }, [fetchArtworks]);

  const handleClearFilters = () => {
    setCategoryFilter("all");
    setSelectedMedium("all");
    setSelectedStyle("all");
    setSelectedOrientation("all");
    setPriceMin("");
    setPriceMax("");
    setSearchQuery("");
  };

  const sortedArtworks = [...artwork].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "popular") return b.likes - a.likes;
    return 0; // Default order
  });

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />

      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 rounded-full bg-gold/5 blur-[150px]" />
        <div className="absolute bottom-1/3 right-0 w-96 h-96 rounded-full bg-terra/5 blur-[160px]" />
      </div>

      <div className="relative z-10 pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
            <div>
              <p className="text-gold text-xs font-semibold tracking-[0.2em] uppercase mb-1.5">Discover & Collect</p>
              <h1 className="font-display text-cream text-3xl md:text-5xl">
                Art <span className="italic text-gold-gradient">Marketplace</span>
              </h1>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-surface-border hover:border-gold hover:text-gold transition-colors text-cream text-sm rounded-lg"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* ── Filter Sidebar ──────────────────────────────── */}
            {showFilters && (
              <div className="lg:col-span-1 space-y-6 bg-surface border border-surface-border rounded-2xl p-6 h-fit shrink-0">
                <div className="flex items-center justify-between border-b border-surface-border/50 pb-4">
                  <h3 className="font-display text-cream text-lg flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gold" /> Filter Art
                  </h3>
                  <button
                    onClick={handleClearFilters}
                    className="text-xs text-gold hover:text-gold/80 transition-colors"
                  >
                    Reset All
                  </button>
                </div>

                {/* Categories */}
                <div className="space-y-2.5">
                  <label className="text-cream-muted text-xs tracking-wider uppercase">Categories</label>
                  <div className="flex flex-col gap-1.5">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setCategoryFilter(cat.value)}
                        className={`text-left text-sm py-1 px-2.5 rounded transition-all ${
                          categoryFilter === cat.value
                            ? "bg-gold/10 text-gold font-medium border-l-2 border-gold pl-2"
                            : "text-cream-subtle hover:text-cream hover:bg-surface-raised pl-2"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Medium */}
                <div className="space-y-2">
                  <label className="text-cream-muted text-xs tracking-wider uppercase">Medium</label>
                  <select
                    value={selectedMedium}
                    onChange={(e) => setSelectedMedium(e.target.value)}
                    className="input-dark text-sm"
                  >
                    <option value="all">All Mediums</option>
                    {mediums.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Style */}
                <div className="space-y-2">
                  <label className="text-cream-muted text-xs tracking-wider uppercase">Style</label>
                  <select
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className="input-dark text-sm"
                  >
                    <option value="all">All Styles</option>
                    {styles.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Orientation */}
                <div className="space-y-2">
                  <label className="text-cream-muted text-xs tracking-wider uppercase">Orientation</label>
                  <select
                    value={selectedOrientation}
                    onChange={(e) => setSelectedOrientation(e.target.value)}
                    className="input-dark text-sm"
                  >
                    {orientations.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* Price range */}
                <div className="space-y-2">
                  <label className="text-cream-muted text-xs tracking-wider uppercase">Price Range (INR)</label>
                  <div className="flex items-center gap-2">
                    <input
                      placeholder="Min"
                      type="number"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      className="input-dark text-sm py-1.5"
                    />
                    <span className="text-cream-subtle text-xs">to</span>
                    <input
                      placeholder="Max"
                      type="number"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      className="input-dark text-sm py-1.5"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Content Grid ────────────────────────────────── */}
            <div className={`${showFilters ? "lg:col-span-3" : "lg:col-span-4"} space-y-6`}>
              {/* Search + Sorting controls bar */}
              <div className="bg-surface border border-surface-border rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-subtle" />
                  <input
                    placeholder="Search titles, artist names, tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-dark pl-11 py-2.5 w-full"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cream-subtle hover:text-cream transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input-dark py-2.5 w-full sm:w-48 appearance-none cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low → High</option>
                    <option value="price-high">Price: High → Low</option>
                    <option value="popular">Most Saves</option>
                  </select>

                  <div className="flex items-center gap-1 border border-surface-border rounded-lg p-1 bg-surface-raised shrink-0">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-md transition-all ${
                        viewMode === "grid" ? "bg-gold text-canvas" : "text-cream-muted hover:text-cream"
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-md transition-all ${
                        viewMode === "list" ? "bg-gold text-canvas" : "text-cream-muted hover:text-cream"
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Status information */}
              <div className="text-sm text-cream-muted">
                Showing <span className="text-cream font-semibold">{sortedArtworks.length}</span> artworks matching specifications
              </div>

              {/* Artworks render grid */}
              {loading ? (
                <div className="text-center py-20 text-gold animate-pulse">Loading Artworks...</div>
              ) : sortedArtworks.length > 0 ? (
                <div
                  className={`grid gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                      : "grid-cols-1"
                  }`}
                >
                  {sortedArtworks.map((art) => (
                    <ArtworkCard key={art.id} artwork={art} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-surface border border-surface-border rounded-2xl">
                  <p className="font-display text-cream text-lg mb-2">No Artworks Found</p>
                  <p className="text-cream-subtle text-sm">Try clearing your filters or widening your search bounds.</p>
                  <button
                    onClick={handleClearFilters}
                    className="btn-gold-outline mt-6 px-6 py-2.5"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
