import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { ReactNode } from "react";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Marketplace from "./pages/Marketplace";
import Artists from "./pages/Artists";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import SellerDashboard from "./pages/SellerDashboard";
import SellerProfile from "./pages/SellerProfile";
import Cart from "./pages/Cart";
import ArtworkDetails from "./components/ArtworkDetails";

// Global axios config
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:4000";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

/**
 * PublicRoute — blocks access to /login and /signup for authenticated users.
 * While auth is being checked (loading), renders nothing to avoid flash.
 * Once resolved: authenticated → redirect to "/", guest → render the page.
 */
const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null; // wait for session check
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "hsl(24, 10%, 10%)",
                  border: "1px solid hsl(30, 15%, 20%)",
                  color: "hsl(42, 40%, 93%)",
                },
              }}
            />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/artists" element={<Artists />} />
              <Route path="/about" element={<About />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/artwork/:id" element={<ArtworkDetails />} />
              <Route path="/dashboard" element={<SellerDashboard />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/artist/:id" element={<SellerProfile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
