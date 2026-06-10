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
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import SellerDashboard from "./pages/SellerDashboard";
import SellerProfile from "./pages/SellerProfile";
import Cart from "./pages/Cart";
import ArtworkDetails from "./components/ArtworkDetails";
import PageTransition from "./components/PageTransition";

// Global axios config
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_API_URL || "https://artkrate-backend-new-zz62.vercel.app/";

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
              <Route path="/" element={<PageTransition><Index /></PageTransition>} />
              <Route path="/login" element={<PublicRoute><PageTransition><Login /></PageTransition></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><PageTransition><Signup /></PageTransition></PublicRoute>} />
              <Route path="/marketplace" element={<PageTransition><Marketplace /></PageTransition>} />
              <Route path="/artists" element={<PageTransition><Artists /></PageTransition>} />
              <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
              <Route path="/messages" element={<PageTransition><Messages /></PageTransition>} />
              <Route path="/messages/:userId" element={<PageTransition><Messages /></PageTransition>} />
              <Route path="/artwork/:id" element={<PageTransition><ArtworkDetails /></PageTransition>} />
              <Route path="/dashboard" element={<PageTransition><SellerDashboard /></PageTransition>} />
              <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
              <Route path="/artist/:id" element={<PageTransition><SellerProfile /></PageTransition>} />
              <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
            </Routes>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
