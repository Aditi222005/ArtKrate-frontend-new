import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

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
    <div
      className="group relative overflow-hidden rounded-xl card-hover cursor-pointer reveal revealed"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* ── Image Container ─────────────────────────────── */}
      <div className="relative overflow-hidden aspect-[3/4]">
        <img
          src={artwork.image}
          alt={artwork.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Category tag */}
        {artwork.category && (
          <div className="absolute top-3 left-3 px-2.5 py-1 glass rounded-full text-xs text-cream-muted tracking-wider uppercase">
            {artwork.category}
          </div>
        )}

        {/* Like Button */}
        <button
          onClick={handleLike}
          className="absolute top-3 right-3 p-2 glass rounded-full text-cream-muted hover:text-terra transition-all duration-200 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100"
          aria-label="Like artwork"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isLiked ? "fill-terra text-terra" : ""
            }`}
          />
        </button>

        {/* Quick View Button */}
        <Link
          to={`/artwork/${artwork.id}`}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-2 glass rounded-full text-sm text-cream font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:border-gold-DEFAULT/50 whitespace-nowrap"
          onClick={(e) => e.stopPropagation()}
        >
          <Eye className="w-4 h-4" />
          View Details
        </Link>
      </div>

      {/* ── Card Body ───────────────────────────────────── */}
      <div className="p-4 bg-surface border-t border-surface-border/50">
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

          <button
            onClick={handleAddToCart}
            disabled={isInCart}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200 ${
              isInCart
                ? "bg-gold-muted/30 text-gold-muted cursor-not-allowed"
                : "btn-terra text-xs py-1.5 px-3"
            }`}
          >
            <ShoppingBag className="w-3 h-3" />
            {isInCart ? "In Cart" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArtworkCard;
