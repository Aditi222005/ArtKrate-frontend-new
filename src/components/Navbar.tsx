import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X, Palette } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, setIsAuthenticated, loading, userType } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await axios.post("/api/logout", {}, { withCredentials: true });
      setIsAuthenticated(false);
      toast.success("Signed out successfully");
      navigate("/");
    } catch {
      toast.error("Sign out failed. Please try again.");
    }
  };

  const isActive = (path: string) =>
    location.pathname === path
      ? "text-gold-DEFAULT border-b border-gold-DEFAULT"
      : "text-cream-muted hover:text-cream-DEFAULT";

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/marketplace", label: "Marketplace" },
    { to: "/artists", label: "Artists" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-surface/95 backdrop-blur-xl border-b border-surface-border shadow-2xl"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-18 py-4">
          {/* ── Logo ─────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold-DEFAULT to-ochre flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
              <Palette className="w-5 h-5 text-canvas" />
            </div>
            <span className="font-display text-xl font-bold text-gold-gradient">
              ArtKrate
            </span>
          </Link>

          {/* ── Desktop Nav Links ─────────────────────── */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`text-sm font-medium tracking-wide transition-all duration-200 ${isActive(to)}`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* ── Right Actions ─────────────────────────── */}
          <div className="hidden md:flex items-center gap-3">
            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-cream-muted hover:text-gold-DEFAULT transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-terra text-cream text-xs rounded-full h-4.5 w-4.5 flex items-center justify-center font-medium animate-scale-in" style={{width:'18px',height:'18px',fontSize:'10px'}}>
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {!loading && (
              isAuthenticated ? (
                <div className="flex items-center gap-2">
                  {userType === "seller" && (
                    <Link
                      to="/dashboard"
                      className="text-sm text-cream-muted hover:text-gold-DEFAULT transition-colors font-medium"
                    >
                      Dashboard
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className="text-sm text-cream-muted hover:text-gold-DEFAULT transition-colors font-medium"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="btn-gold-outline text-sm py-2 px-4"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-sm text-cream-muted hover:text-gold-DEFAULT transition-colors font-medium px-4 py-2"
                  >
                    Sign In
                  </Link>
                  <Link to="/signup" className="btn-terra text-sm py-2 px-5">
                    Join
                  </Link>
                </div>
              )
            )}
          </div>

          {/* ── Mobile Toggle ──────────────────────────── */}
          <button
            className="md:hidden p-2 text-cream-muted hover:text-cream-DEFAULT"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ───────────────────────────────── */}
      {isMenuOpen && (
        <div className="md:hidden glass border-t border-surface-border">
          <div className="px-6 py-6 flex flex-col gap-4">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`text-base font-medium transition-colors ${isActive(to)}`}
              >
                {label}
              </Link>
            ))}
            <div className="divider-gold my-2" />
            <Link to="/cart" className="flex items-center gap-2 text-cream-muted hover:text-gold-DEFAULT">
              <ShoppingCart className="w-4 h-4" />
              <span>Cart ({getTotalItems()})</span>
            </Link>
            {!loading && (
              isAuthenticated ? (
                <>
                  {userType === "seller" && (
                    <Link to="/dashboard" className="text-cream-muted hover:text-gold-DEFAULT">
                      Dashboard
                    </Link>
                  )}
                  <Link to="/profile" className="text-cream-muted hover:text-gold-DEFAULT">
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="btn-gold-outline w-full text-center mt-2"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-gold-outline text-center">
                    Sign In
                  </Link>
                  <Link to="/signup" className="btn-terra text-center">
                    Join ArtKrate
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
