import { useState } from "react";
import { createPaymentOrder, verifyPayment } from "../../services/api";
import { CheckCircle2 } from "lucide-react";

const MilestonePayButton = ({ gigId, milestoneId, amount, status, onPaid }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await createPaymentOrder(gigId, milestoneId);
      console.log(data)

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "SkillSphere",
        description: "Milestone payment",
        order_id: data.orderId,
        prefill: {
          name: data.clientName,
          email: data.clientEmail,
        },
        theme: { color: "#2563eb" },
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            onPaid?.();
          } catch (err) {
            console.log(err);
            setError("Payment succeeded but verification failed. Contact support.");
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", (resp) => {
        console.log(resp.error);
        setError("Payment failed. Please try again.");
        setLoading(false);
      });

      razorpayInstance.open();
    } catch (err) {
      console.log(err);
      setError("Could not start payment. Please try again.");
      setLoading(false);
    }
  };

return (
    <div className="flex flex-col items-start">
      {status !== 'funded' ? (
        <button
          onClick={handlePay}
          disabled={loading}
          className="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700 hover:shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          {loading ? "Processing…" : `Pay ₹${amount.toLocaleString()}`}
        </button>
      ) : status === 'funded' ? (
        <div className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <span>Paid</span>
        </div>
      ) : (null)}
      
      {error && (
        <p className="text-xs font-medium text-rose-500 mt-2 bg-rose-50 px-2 py-1 rounded-md">
          {error}
        </p>
      )}
    </div>
  );
};

export default MilestonePayButton;