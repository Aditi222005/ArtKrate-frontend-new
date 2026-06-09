import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Shield, CreditCard, CheckCircle, XCircle, Loader2, Package } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";

// ── Razorpay type declaration ───────────────────────────────────────────────
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: { name?: string; email?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  modal?: { ondismiss?: () => void; escape?: boolean };
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface CheckoutDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
}

type PaymentStep = "summary" | "processing" | "success" | "failed";

// ── Load Razorpay SDK dynamically ────────────────────────────────────────────
const loadRazorpay = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// ── Checkout Dialog ──────────────────────────────────────────────────────────
const CheckoutDialog = ({ isOpen, onOpenChange, total }: CheckoutDialogProps) => {
  const [step, setStep] = useState<PaymentStep>("summary");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();

  // Reset step when dialog opens
  useEffect(() => {
    if (isOpen) setStep("summary");
  }, [isOpen]);

  const handleRazorpayPayment = async () => {
    setStep("processing");

    try {
      // 1. Load Razorpay SDK
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error("Payment gateway could not be loaded. Check your internet connection.");
        setStep("failed");
        return;
      }

      // 2. Create Razorpay order on backend
      const { data: orderData } = await axios.post(
        "/api/payment/create-order",
        { cartItems: cartItems.map((item) => item.id) },
        { withCredentials: true }
      );

      // 3. Open Razorpay checkout modal
      const options: RazorpayOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ArtKrate",
        description: `Purchase of ${cartItems.length} artwork${cartItems.length > 1 ? "s" : ""}`,
        order_id: orderData.orderId,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        notes: {
          platform: "artkrate",
        },
        theme: {
          color: "#c9a84c", // ArtKrate gold
        },
        modal: {
          ondismiss: () => {
            // User dismissed the modal without paying
            setStep("summary");
            toast.warning("Payment cancelled.");
          },
          escape: false,
        },
        handler: async (response: RazorpayResponse) => {
          // 4. Verify payment on backend
          try {
            await axios.post(
              "/api/payment/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                cartItems: cartItems.map((item) => item.id),
              },
              { withCredentials: true }
            );

            setPaymentId(response.razorpay_payment_id);
            setStep("success");
            clearCart();

            toast.success("Payment confirmed! Your artwork order is placed.", {
              duration: 5000,
              icon: "🎨",
            });
          } catch (verifyErr: any) {
            console.error("Payment verification failed:", verifyErr);
            setStep("failed");
            toast.error("Payment verification failed. Contact support with your payment ID.");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error("Checkout error:", err);
      const message = err.response?.data?.message || "Failed to initiate payment. Please try again.";
      toast.error(message);
      setStep("failed");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={step === "processing" ? undefined : onOpenChange}>
      <DialogContent className="max-w-md bg-surface border-surface-border text-cream">
        <DialogHeader>
          <DialogTitle className="font-display text-cream flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gold" />
            Secure Checkout
          </DialogTitle>
          <DialogDescription className="text-cream-subtle">
            Powered by Razorpay — 256-bit encrypted transactions
          </DialogDescription>
        </DialogHeader>

        {/* ── Step: Order Summary ────────────────────────── */}
        {step === "summary" && (
          <div className="space-y-5">
            {/* Items */}
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-surface-raised"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-12 h-12 object-cover rounded-md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-cream text-sm font-medium truncate">{item.title}</p>
                    <p className="text-cream-subtle text-xs">{item.artist}</p>
                  </div>
                  <span className="text-gold font-semibold text-sm flex-shrink-0">
                    ₹{item.price.toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="divider-gold" />
            <div className="flex items-center justify-between text-lg font-semibold">
              <span className="text-cream-muted">Total</span>
              <span className="text-gold font-display text-xl">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Security note */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-gold-muted/10 border border-gold-muted/20">
              <Shield className="w-4 h-4 text-gold mt-0.5 shrink-0" />
              <p className="text-cream-subtle text-xs leading-relaxed">
                Your payment is secured by Razorpay. We never store card details.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => onOpenChange(false)}
                className="flex-1 btn-gold-outline text-sm py-2.5"
              >
                Cancel
              </button>
              <button
                onClick={handleRazorpayPayment}
                className="flex-1 btn-terra text-sm py-2.5 flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Pay ₹{total.toLocaleString("en-IN")}
              </button>
            </div>
          </div>
        )}

        {/* ── Step: Processing ───────────────────────────── */}
        {step === "processing" && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-gold-muted/20 flex items-center justify-center animate-pulse-gold">
              <Loader2 className="w-8 h-8 text-gold animate-spin" />
            </div>
            <p className="font-display text-cream text-lg">Processing Payment</p>
            <p className="text-cream-subtle text-sm text-center">
              Please complete the payment in the Razorpay window.
              <br />
              Do not close this dialog.
            </p>
          </div>
        )}

        {/* ── Step: Success ──────────────────────────────── */}
        {step === "success" && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-9 h-9 text-green-400" />
            </div>
            <div className="text-center space-y-2">
              <p className="font-display text-cream text-xl">Payment Successful!</p>
              <p className="text-cream-subtle text-sm">
                Your artwork purchase has been confirmed.
              </p>
              {paymentId && (
                <p className="text-cream-subtle text-xs font-mono bg-surface-raised px-3 py-1 rounded">
                  ID: {paymentId}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 text-cream-subtle text-sm">
              <Package className="w-4 h-4 text-gold" />
              <span>The seller will contact you for delivery details.</span>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="btn-terra w-full mt-2"
            >
              Continue Browsing
            </button>
          </div>
        )}

        {/* ── Step: Failed ───────────────────────────────── */}
        {step === "failed" && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center">
              <XCircle className="w-9 h-9 text-red-400" />
            </div>
            <div className="text-center space-y-2">
              <p className="font-display text-cream text-xl">Payment Failed</p>
              <p className="text-cream-subtle text-sm">
                Something went wrong. Please try again or contact support.
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => onOpenChange(false)}
                className="flex-1 btn-gold-outline"
              >
                Close
              </button>
              <button
                onClick={handleRazorpayPayment}
                className="flex-1 btn-terra"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;