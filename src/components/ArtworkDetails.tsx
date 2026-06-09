import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, Share2, ArrowLeft, ZoomIn, Calendar, Palette, Ruler, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ArtistSummary from "@/components/ArtistSummary";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import axios from "axios";
import Navbar from "./Navbar";
import ArtworkCard from "./ArtworkCard";
import { motion } from "framer-motion";

const ArtworkSpecs = ({ artwork }: { artwork: any }) => (
  <div className="bg-surface border border-surface-border rounded-2xl p-6 md:p-8">
    <h3 className="font-display text-cream text-xl mb-6">Specifications</h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div>
        <p className="text-cream-subtle text-xs tracking-wider uppercase">Medium</p>
        <p className="text-cream font-medium mt-1">{artwork.medium || "Oil"}</p>
      </div>
      <div>
        <p className="text-cream-subtle text-xs tracking-wider uppercase">Style</p>
        <p className="text-cream font-medium mt-1">{artwork.style || "Contemporary"}</p>
      </div>
      <div>
        <p className="text-cream-subtle text-xs tracking-wider uppercase">Dimensions</p>
        <p className="text-cream font-medium mt-1">
          {artwork.dimensions?.height || 24} × {artwork.dimensions?.width || 36} {artwork.dimensions?.unit || "in"}
        </p>
      </div>
      <div>
        <p className="text-cream-subtle text-xs tracking-wider uppercase">Orientation</p>
        <p className="text-cream font-medium mt-1 capitalize">{artwork.orientation || "portrait"}</p>
      </div>
    </div>
  </div>
);

const RelatedArtworks = ({ currentArtworkId }: { currentArtworkId: string }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await axios.get("/api/sellerpost/all?status=available");
        const filtered = res.data.posts
          .filter((post: any) => post._id !== currentArtworkId)
          .slice(0, 4)
          .map((post: any) => ({
            id: post._id,
            title: post.title,
            artist: post.sellerId?.name || "Unknown",
            price: post.price,
            image: post.images[0],
            likes: post.likes?.length || 0,
            category: post.category,
          }));
        setItems(filtered);
      } catch (err) {
        console.error("Error fetching related artworks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRelated();
  }, [currentArtworkId]);

  if (loading || items.length === 0) return null;

  return (
    <div className="space-y-6">
      <h3 className="font-display text-cream text-2xl">
        Similar <span className="italic text-gold-gradient">Recommendations</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((art) => (
          <ArtworkCard key={art.id} artwork={art} />
        ))}
      </div>
    </div>
  );
};

const ArtworkDetails = () => {
  const { id } = useParams();
  const [artwork, setArtwork] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imageZoomed, setImageZoomed] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const { addToCart, cartItems } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const res = await axios.get(`/api/artwork/${id}`);
        const fetched = res.data.artwork;

        const normalizedArtwork = {
          ...fetched,
          image: fetched.images[0],
          artist: {
            title: fetched.sellerId?.name || "Unknown",
            bio: fetched.sellerId?.bio || "A passionate ArtKrate seller.",
            profileImage: fetched.sellerId?.profilePhoto || "",
            verified: true,
            artworksCount: 12,
            followersCount: fetched.sellerId?.followers?.length || 0,
          },
          tags: fetched.tags || [],
          likesCount: fetched.likes?.length || 0,
        };

        setArtwork(normalizedArtwork);
        if (isAuthenticated) {
          setIsLiked(fetched.likes?.includes(localStorage.getItem("userId") || ""));
          // Call view count increment API
          await axios.post(
            `/api/artwork/${id}/view`,
            {},
            {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
              withCredentials: true
            }
          );
        }
      } catch (err) {
        console.error("Error fetching artwork details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [id, isAuthenticated]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error("Please login first to like artworks.");
      navigate("/login");
      return;
    }

    try {
      const res = await axios.post(
        `/api/artwork/${artwork._id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true
        }
      );
      setArtwork((prev: any) => ({
        ...prev,
        likesCount: res.data.likesCount,
      }));
      setIsLiked(res.data.liked);
      toast.success(res.data.liked ? "Added to Wishlist" : "Removed from Wishlist");
    } catch (err) {
      console.error("Error liking artwork:", err);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to your cart.");
      navigate("/login");
      return;
    }

    const isAlreadyInCart = cartItems.some(item => item.id === artwork._id);
    if (isAlreadyInCart) {
      toast.error("Artwork is already in your cart.");
      return;
    }

    addToCart({
      id: artwork._id,
      title: artwork.title,
      artist: artwork.artist.title,
      price: artwork.price,
      image: artwork.image,
    });

    toast.success("Added to collection successfully!");
  };

  const handleInquire = async () => {
    if (!isAuthenticated) {
      toast.error("Please login first to message the seller.");
      navigate("/login");
      return;
    }

    const sellerId = artwork.sellerId?._id || artwork.sellerId;
    if (!sellerId) {
      toast.error("Seller details are not available.");
      return;
    }

    try {
      await axios.post(
        "/api/messages",
        {
          receiverId: sellerId,
          content: `Hi! I am interested in your artwork "${artwork.title}". Could you share more details?`,
          artworkId: artwork._id
        },
        { withCredentials: true }
      );
      toast.success("Inquiry sent successfully!");
      navigate(`/messages/${sellerId}`);
    } catch (err) {
      console.error("Inquiry error:", err);
      toast.error("Failed to send inquiry.");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: artwork.title,
        text: `Check out this artwork by ${artwork.artist.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-gold animate-pulse text-lg font-medium">Loading Artwork Details...</div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center text-center">
        <div>
          <h2 className="font-display text-cream text-2xl mb-4">Artwork Not Found</h2>
          <Link to="/marketplace" className="btn-gold px-6 py-2">Return to Marketplace</Link>
        </div>
      </div>
    );
  }

  const inCart = cartItems.some(item => item.id === artwork._id);

  return (
    <div className="min-h-screen bg-canvas pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-6">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link to="/marketplace" className="inline-flex items-center gap-2 text-cream-muted hover:text-gold transition-colors text-sm mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Artwork Image Frame */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
            className="space-y-6"
          >
            <div className="relative group overflow-hidden bg-surface border border-surface-border rounded-2xl aspect-square flex items-center justify-center p-6 shadow-2xl">
              <motion.img
                layout
                src={artwork.image}
                alt={artwork.title}
                className={`max-w-full max-h-full object-contain transition-transform duration-700 ${imageZoomed ? 'scale-150' : 'group-hover:scale-105'}`}
              />
              <button
                onClick={() => setImageZoomed(!imageZoomed)}
                className="absolute top-4 right-4 p-2.5 glass rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:text-gold cursor-pointer"
                aria-label="Zoom Image"
              >
                <ZoomIn className="w-5 h-5 text-cream" />
              </button>
            </div>

            {/* Interaction Row */}
            <div className="flex items-center justify-between text-cream-muted text-sm px-1">
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-gold/80" /> {artwork.views || 0} views</span>
                <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-terra/80" /> {artwork.likesCount} saves</span>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={handleLike}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2.5 rounded-full border transition-colors cursor-pointer ${
                    isLiked ? "border-terra/40 bg-terra/10 text-terra" : "border-surface-border hover:border-gold text-cream-muted"
                  }`}
                  aria-label="Like"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                </motion.button>
                <motion.button
                  onClick={handleShare}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2.5 rounded-full border border-surface-border hover:border-gold text-cream-muted transition-colors cursor-pointer"
                  aria-label="Share"
                >
                  <Share2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Product Actions Detail */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.1 }}
            className="space-y-8"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-gold text-xs font-semibold uppercase tracking-[0.2em]">{artwork.category}</span>
                <Badge className="bg-surface border border-surface-border text-cream-muted font-normal text-xs uppercase px-2.5 py-0.5 rounded-full">
                  Original
                </Badge>
              </div>
              <h1 className="font-display text-cream text-3xl md:text-4xl lg:text-5xl leading-tight mb-4">{artwork.title}</h1>
              <div className="font-display text-gold text-3xl font-semibold mb-6">
                ₹{artwork.price.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="divider-gold" />

            <div>
              <h3 className="text-cream text-lg font-medium mb-3 font-display">Description</h3>
              <p className="text-cream-muted leading-relaxed font-sans">{artwork.description}</p>
            </div>

            <div className="flex gap-4">
              <motion.div className="flex-1" whileHover={{ scale: !inCart ? 1.02 : 1 }} whileTap={{ scale: !inCart ? 0.98 : 1 }}>
                <Button
                  onClick={handleAddToCart}
                  disabled={inCart}
                  className="w-full btn-terra text-base py-6"
                >
                  {inCart ? "Already In Cart" : "Add to Cart"}
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={handleInquire}
                  variant="outline" 
                  className="border-gold text-gold hover:bg-gold/10 py-6 px-8"
                >
                  Inquire
                </Button>
              </motion.div>
            </div>

            <div className="divider-gold" />

            {/* Artist Detail Card */}
            {artwork.artist && <ArtistSummary artist={artwork.artist} />}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mt-16"
        >
          <ArtworkSpecs artwork={artwork} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-16"
        >
          <RelatedArtworks currentArtworkId={artwork._id} />
        </motion.div>
      </div>
    </div>
  );
};

export default ArtworkDetails;
