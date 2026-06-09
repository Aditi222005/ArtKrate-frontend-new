import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Users, Image, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import ArtworkCard from "@/components/ArtworkCard";
import AnimatedCounter from "../components/AnimatedCounter";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

// ── useScrollReveal hook ─────────────────────────────────────────────────────
const useScrollReveal = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
};

const featuredArtworks = [
  {
    id: 1,
    title: "Monsoon Reverie",
    artist: "Priya Nair",
    price: 45000,
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=700&fit=crop",
    likes: 84,
    category: "Paintings",
  },
  {
    id: 2,
    title: "Digital Dharma",
    artist: "Arjun Mehta",
    price: 32000,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=700&fit=crop",
    likes: 61,
    category: "Digital Art",
  },
  {
    id: 3,
    title: "Silk & Stone",
    artist: "Kavitha Sharma",
    price: 78000,
    image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=500&h=700&fit=crop",
    likes: 113,
    category: "Mixed Media",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 85,
      damping: 14
    }
  }
};

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { isAuthenticated, user } = useAuth();
  useScrollReveal();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-canvas overflow-x-hidden">
      <Navbar />

      {/* ════════════════════════════════════════════════════
          HERO SECTION
          ════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gold/5 blur-[120px]" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-terra/5 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* ── Left: Editorial Copy ─────────────────── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isVisible ? "show" : "hidden"}
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="mb-2">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/8 text-gold text-xs tracking-[0.15em] uppercase">
                <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: '4s' }} />
                Curated Indian Art Marketplace
              </span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="font-display text-cream leading-[1.05] mb-2">
              Where Art<br />
              <span className="text-gold-gradient italic">Finds Its</span><br />
              Collector
            </motion.h1>

            <motion.p variants={itemVariants} className="text-cream-muted text-lg leading-relaxed mb-4 max-w-md">
              ArtKrate connects verified artists with passionate collectors across India.
              Discover paintings, sculptures, digital art — each piece with a story.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-4">
              <Link
                to="/marketplace"
                className="btn-terra flex items-center justify-center gap-2 text-base group"
              >
                Explore Gallery
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              {!isAuthenticated && (
                <Link to="/signup" className="btn-gold-outline flex items-center justify-center gap-2 text-base">
                  Join as Artist
                </Link>
              )}
            </motion.div>

            {/* Mini Stats */}
            <motion.div variants={itemVariants} className="flex items-center gap-8 pt-4">
              <div>
                <p className="text-cream font-display text-2xl font-bold">2,500+</p>
                <p className="text-cream-subtle text-xs tracking-wide">Verified Artists</p>
              </div>
              <div className="w-px h-10 bg-surface-border" />
              <div>
                <p className="text-cream font-display text-2xl font-bold">15K+</p>
                <p className="text-cream-subtle text-xs tracking-wide">Artworks Sold</p>
              </div>
              <div className="w-px h-10 bg-surface-border" />
              <div>
                <p className="text-cream font-display text-2xl font-bold">500+</p>
                <p className="text-cream-subtle text-xs tracking-wide">New Weekly</p>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right: Floating Artwork Stack ────────── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.3 }}
            className="relative h-[520px] hidden lg:block"
          >
            {/* Large back card */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2, zIndex: 30 }}
              transition={{ duration: 0.3 }}
              className="absolute top-8 right-0 w-52 h-72 rounded-2xl overflow-hidden shadow-2xl float-artwork border border-gold/20 cursor-pointer"
            >
              <img
                src="https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=400&h=600&fit=crop"
                alt="Featured artwork"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-canvas/60 to-transparent" />
            </motion.div>

            {/* Middle card */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: -2, zIndex: 30 }}
              transition={{ duration: 0.3 }}
              className="absolute top-24 left-4 w-48 h-64 rounded-2xl overflow-hidden shadow-xl float-artwork-delay border border-surface-border cursor-pointer"
            >
              <img
                src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=560&fit=crop"
                alt="Featured artwork"
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Small foreground card */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 1, zIndex: 30 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-4 right-16 w-44 h-56 rounded-2xl overflow-hidden shadow-2xl float-artwork border border-gold/30 cursor-pointer"
            >
              <img
                src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=360&h=480&fit=crop"
                alt="Featured artwork"
                className="w-full h-full object-cover"
              />
              {/* Price tag */}
              <div className="absolute bottom-3 left-3 px-2.5 py-1 glass rounded-lg">
                <p className="text-gold text-xs font-semibold">₹45,000</p>
              </div>
            </motion.div>

            {/* Editorial label */}
            <div className="absolute top-0 left-0 -rotate-12 bg-terra/90 text-cream text-[10px] tracking-widest uppercase px-3 py-1 rounded">
              New Drop
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-px h-10 bg-gradient-to-b from-transparent to-gold/50" />
          <span className="text-cream-subtle text-[10px] tracking-[0.2em] uppercase">Scroll</span>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          STATS SECTION
          ════════════════════════════════════════════════════ */}
      <section className="py-20 relative">
        <div className="divider-gold mb-16 max-w-6xl mx-auto" />
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Users, count: 2500, suffix: "+", label: "Active Artists", sub: "Verified across India" },
              { icon: Image, count: 15000, suffix: "+", label: "Artworks Sold", sub: "Since our founding" },
              { icon: Sparkles, count: 500, suffix: "+", label: "New Works Weekly", sub: "Fresh collections" },
            ].map((stat, i) => (
              <div
                key={i}
                className={`reveal stagger-${i + 1} p-8 rounded-2xl bg-surface border border-surface-border text-center hover:border-gold/30 transition-all duration-300 group`}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gold/10 mb-5 group-hover:scale-110 transition-transform">
                  <stat.icon className="w-7 h-7 text-gold" />
                </div>
                <h3 className="font-display text-cream text-4xl font-bold mb-1">
                  <AnimatedCounter end={stat.count} suffix={stat.suffix} />
                </h3>
                <p className="text-cream font-medium mb-1">{stat.label}</p>
                <p className="text-cream-subtle text-sm">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FEATURED ARTWORKS
          ════════════════════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="reveal mb-14 text-center">
            <p className="text-gold text-sm tracking-[0.2em] uppercase mb-3">Curated Selection</p>
            <h2 className="font-display text-cream mb-4">
              Featured <span className="italic text-gold-gradient">Artworks</span>
            </h2>
            <p className="text-cream-muted text-lg max-w-xl mx-auto">
              Hand-picked pieces from our most celebrated verified artists
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredArtworks.map((artwork, i) => (
              <div key={artwork.id} className={`reveal stagger-${i + 1}`}>
                <ArtworkCard artwork={artwork} delay={i * 150} />
              </div>
            ))}
          </div>

          <div className="text-center mt-12 reveal">
            <Link to="/marketplace" className="btn-gold-outline inline-flex items-center gap-2">
              View All Artworks
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          ARTIST CTA SECTION
          ════════════════════════════════════════════════════ */}
      {!isAuthenticated && (
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto reveal">
            <div className="relative rounded-3xl overflow-hidden p-12 text-center"
              style={{
                background: "linear-gradient(135deg, hsl(24 12% 8%) 0%, hsl(36 20% 10%) 100%)",
                border: "1px solid hsl(var(--gold) / 0.2)",
              }}
            >
              {/* Ambient glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-terra/5 pointer-events-none" />
              <div className="relative z-10">
                <span className="inline-block px-4 py-1.5 rounded-full border border-gold/30 bg-gold/8 text-gold text-xs tracking-widest uppercase mb-6">
                  For Artists
                </span>
                <h2 className="font-display text-cream mb-4">
                  Turn Your Art<br />
                  <span className="italic text-gold-gradient">Into Income</span>
                </h2>
                <p className="text-cream-muted text-lg mb-8 max-w-lg mx-auto">
                  Join thousands of artists selling on ArtKrate. Get verified, list your artwork, receive payments directly through Razorpay.
                </p>
                <Link to="/signup" className="btn-terra inline-flex items-center gap-2 text-base px-8 py-4">
                  Start Selling
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════
          FOOTER
          ════════════════════════════════════════════════════ */}
      <footer className="border-t border-surface-border py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-ochre flex items-center justify-center">
                <span className="text-canvas font-bold text-sm">A</span>
              </div>
              <span className="font-display text-xl text-cream font-semibold">ArtKrate</span>
            </div>
            <p className="text-cream-subtle text-sm">
              Connecting artists with collectors across India · Built with ❤️
            </p>
            <p className="text-cream-subtle text-sm">© 2025 ArtKrate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
