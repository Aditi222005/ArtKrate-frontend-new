import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

interface Artwork {
  id: number | string;
  title: string;
  artist: string;
  price: number;
  image: string;
  likes: number;
  category?: string;
}

interface ArtworkCardProps {
  artwork: Artwork;
  delay?: number;
}

const ArtworkCard = ({ artwork, delay = 0 }: ArtworkCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(artwork.likes);
  const { addToCart, cartItems } = useCart();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const isInCart = cartItems.some((item) => item.id === String(artwork.id));

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    setIsLiked(!isLiked);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add artworks to your collection.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (isInCart) {
      toast({
        title: "Already in cart",
        description: `"${artwork.title}" is already in your cart.`,
      });
      return;
    }

    addToCart({
      id: String(artwork.id),
      title: artwork.title,
      artist: artwork.artist,
      price: artwork.price,
      image: artwork.image,
    });

    toast({
      title: "Added to collection",
      description: `"${artwork.title}" has been added to your cart.`,
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        opacity: { duration: 0.4, delay: delay / 1000 },
        y: { type: "spring", stiffness: 100, damping: 15, delay: delay / 1000 },
        layout: { type: "spring", stiffness: 100, damping: 18 }
      }}
      whileHover={{
        y: -6,
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(201, 168, 76, 0.3)",
      }}
      className="group relative overflow-hidden rounded-xl border border-surface-border bg-surface cursor-pointer transition-colors duration-300 hover:border-gold/30"
    >
      {/* ── Image Container ─────────────────────────────── */}
      <div className="relative overflow-hidden aspect-[3/4]">
        <motion.img
          src={artwork.image}
          alt={artwork.title}
          className="w-full h-full object-cover"
          loading="lazy"
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Category tag */}
        {artwork.category && (
          <div className="absolute top-3 left-3 px-2.5 py-1 glass rounded-full text-xs text-cream-muted tracking-wider uppercase z-10">
            {artwork.category}
          </div>
        )}

        {/* Like Button */}
        <motion.button
          onClick={handleLike}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          className="absolute top-3 right-3 p-2 glass rounded-full text-cream-muted hover:text-terra transition-colors duration-200 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 z-10"
          aria-label="Like artwork"
        >
          <motion.div
            animate={isLiked ? { scale: [1, 1.4, 1] } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isLiked ? "fill-terra text-terra" : ""
              }`}
            />
          </motion.div>
        </motion.button>

        {/* Quick View Button */}
        <Link
          to={`/artwork/${artwork.id}`}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="flex items-center gap-2 px-5 py-2 glass rounded-full text-sm text-cream font-medium border border-surface-border/50 hover:border-gold/50 transition-colors duration-300 whitespace-nowrap opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
          >
            <Eye className="w-4 h-4 text-gold" />
            View Details
          </motion.div>
        </Link>
      </div>

      {/* ── Card Body ───────────────────────────────────── */}
      <div className="p-4 border-t border-surface-border/50">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-cream text-base leading-tight truncate group-hover:text-gold-light transition-colors">
              {artwork.title}
            </h3>
            <p className="text-cream-subtle text-sm mt-0.5 truncate">{artwork.artist}</p>
          </div>
          {/* Like count */}
          <div className="flex items-center gap-1 text-cream-subtle text-xs flex-shrink-0">
            <Heart className={`w-3 h-3 ${isLiked ? "fill-terra text-terra" : ""}`} />
            <span>{likeCount}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-display text-gold text-lg font-semibold">
            ₹{artwork.price.toLocaleString("en-IN")}
          </span>

          <motion.button
            onClick={handleAddToCart}
            disabled={isInCart}
            whileHover={!isInCart ? { scale: 1.05 } : {}}
            whileTap={!isInCart ? { scale: 0.95 } : {}}
            className={`flex items-center gap-1.5 text-xs font-medium px-4.5 py-2 rounded-full transition-all duration-200 ${
              isInCart
                ? "bg-gold-muted/30 text-gold-muted cursor-not-allowed"
                : "btn-terra text-xs py-1.5 px-3"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {isInCart ? "In Cart" : "Add"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ArtworkCard;
