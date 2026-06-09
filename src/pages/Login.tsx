import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Palette } from "lucide-react";
import Navbar from "@/components/Navbar";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post("http://localhost:4000/api/login", formData, {
        withCredentials: true,
      });
      toast.success("Welcome back!");
      await checkAuth();
      navigate("/");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Sign in failed. Please try again.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas overflow-hidden">
      <Navbar />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full bg-gold/4 blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 rounded-full bg-terra/4 blur-[100px]" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-20 pb-12">
        <div className="w-full max-w-md animate-fade-slide-up">
          {/* ── Card ──────────────────────────────────────── */}
          <div className="bg-surface border border-surface-border rounded-2xl p-8 shadow-2xl">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold to-ochre flex items-center justify-center mb-4 shadow-lg">
                <Palette className="w-7 h-7 text-canvas" />
              </div>
              <h1 className="font-display text-cream text-2xl font-bold">Welcome Back</h1>
              <p className="text-cream-subtle text-sm mt-1">Sign in to your ArtKrate account</p>
            </div>


            {/* ── Email Form ─────────────────────────────── */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-cream-muted text-sm font-medium mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-subtle" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    required
                    className="input-dark pl-10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-cream-muted text-sm font-medium mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-subtle" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    required
                    className="input-dark pl-10 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-subtle hover:text-cream-muted transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-surface-border bg-surface-raised accent-gold"
                  />
                  <span className="text-cream-muted">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-gold hover:text-gold-hover transition-colors text-sm">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-terra w-full py-3 text-base flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Footer link */}
            <p className="text-center text-cream-subtle text-sm mt-6">
              Don't have an account?{" "}
              <Link to="/signup" className="text-gold hover:text-gold-hover font-medium transition-colors">
                Join ArtKrate
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
