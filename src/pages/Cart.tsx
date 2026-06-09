import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, ArrowRight, Trash2, Package } from "lucide-react";
import Navbar from "@/components/Navbar";
import CartItem from "@/components/CartItem";
import CheckoutDialog from "@/components/CheckoutDialog";

const Cart = () => {
  const { cartItems, getTotalItems, getTotalPrice } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const subtotal = getTotalPrice();
  const shipping = cartItems.length > 0 ? 25 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-canvas">
        <Navbar />
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full bg-gold/3 blur-[140px]" />
        </div>
        <div className="relative z-10 pt-24 px-6 pb-12">
          <div className="max-w-xl mx-auto text-center py-24">
            <div className="w-24 h-24 rounded-3xl bg-surface border border-surface-border flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-cream-subtle" />
            </div>
            <h1 className="font-display text-cream text-3xl mb-3">Your Cart is Empty</h1>
            <p className="text-cream-muted mb-8 text-lg">
              Discover amazing artworks and add them to your collection
            </p>
            <Link to="/marketplace" className="btn-terra inline-flex items-center gap-2 px-8 py-3 text-base">
              Browse Marketplace
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-gold/3 blur-[140px]" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-terra/3 blur-[120px]" />
      </div>

      <div className="relative z-10 pt-24 px-6 pb-16">
        <div className="max-w-6xl mx-auto">

          {/* ── Header ──────────────────────────────────────── */}
          <div className="mb-10">
            <p className="text-gold text-sm tracking-[0.2em] uppercase mb-2">Review Your Selection</p>
            <h1 className="font-display text-cream mb-1">Shopping Cart</h1>
            <p className="text-cream-subtle">{getTotalItems()} {getTotalItems() === 1 ? "item" : "items"} in your cart</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── Cart Items ──────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}

              <div className="pt-4">
                <Link
                  to="/marketplace"
                  className="inline-flex items-center gap-2 text-sm text-cream-muted hover:text-gold transition-colors"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* ── Order Summary ────────────────────────────────── */}
            <div className="lg:col-span-1">
              <div className="bg-surface border border-surface-border rounded-2xl p-6 sticky top-24">
                {/* Header */}
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-surface-border">
                  <Package className="w-5 h-5 text-gold" />
                  <h2 className="font-display text-cream text-xl font-semibold">Order Summary</h2>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-cream-muted text-sm">
                    <span>Subtotal ({getTotalItems()} items)</span>
                    <span className="text-cream">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-cream-muted text-sm">
                    <span>Shipping</span>
                    <span className="text-cream">₹{shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-cream-muted text-sm">
                    <span>Tax (8%)</span>
                    <span className="text-cream">₹{tax.toFixed(2)}</span>
                  </div>

                  <div className="divider-gold my-2" />

                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-cream">Total</span>
                    <span className="text-gold font-bold">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Promo code */}
                <div className="mb-6">
                  <div className="flex gap-2">
                    <input
                      placeholder="Promo code"
                      className="input-dark flex-1 py-2.5 text-sm"
                    />
                    <button className="px-4 py-2.5 border border-gold/40 text-gold text-sm rounded-lg hover:bg-gold/10 transition-colors font-medium">
                      Apply
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="btn-terra w-full py-3.5 text-base flex items-center justify-center gap-2 mb-3"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-center text-cream-subtle text-xs">
                  🔒 Secure checkout powered by Razorpay
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CheckoutDialog
        isOpen={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        total={total}
      />
    </div>
  );
};

export default Cart;
