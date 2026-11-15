import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, CheckCircle2, Ticket, Printer, Tag, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingType: 'hotel' | 'transport';
  title: string;
  itemSubtitle: string;
  itemImage?: string;
  baseAmount: number;
  details: { label: string; value: string }[];
  onConfirmPayment: (paymentMethod: string, finalAmount: number) => Promise<boolean>;
  confirmationId?: number | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  bookingType,
  title,
  itemSubtitle,
  itemImage,
  baseAmount,
  details,
  onConfirmPayment,
  confirmationId
}) => {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'Credit Card' | 'Debit Card' | 'UPI' | 'PayPal'>('Credit Card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('789');
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedId, setConfirmedId] = useState<number | null>(confirmationId || null);

  if (!isOpen) return null;

  const taxes = Math.round(baseAmount * 0.08);
  const discountAmount = Math.round(baseAmount * (discountPercent / 100));
  const finalTotal = Math.max(0, baseAmount + taxes - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (code === 'WANDER10') {
      setDiscountPercent(10);
    } else if (code === 'SUMMER15' || code === 'WANDER15') {
      setDiscountPercent(15);
    } else if (code === 'EXPLORE20') {
      setDiscountPercent(20);
    } else {
      setCouponError('Invalid promo code. Try WANDER10 or WANDER15');
    }
  };

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      const ok = await onConfirmPayment(paymentMethod, finalTotal);
      if (ok) {
        setIsSuccess(true);
        setConfirmedId(Date.now() % 100000);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-teal-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-white/20 text-white">
              {bookingType === 'hotel' ? 'Hotel Reservation' : 'Transport Booking'}
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white">{isSuccess ? 'Booking Confirmed!' : 'Secure Checkout'}</h3>
          <p className="text-sky-100 text-sm mt-0.5">
            {isSuccess ? 'Your transaction has been processed and stored in MySQL.' : 'Review summary and complete reservation.'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce-short">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-slate-900">Reservation Confirmed!</h4>
                <p className="text-slate-500 text-sm mt-1">
                  Thank you, <span className="font-semibold text-slate-800">{user?.name}</span>. A confirmation has been generated in your account.
                </p>
              </div>

              {/* Digital Voucher Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      CONFIRMATION VOUCHER
                    </span>
                    <h5 className="font-bold text-slate-900 text-base">{title}</h5>
                    <p className="text-xs text-slate-500">{itemSubtitle}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-slate-400 block">REFERENCE ID</span>
                    <span className="text-sm font-mono font-bold text-sky-600">
                      #{confirmedId || 'WL-8924'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {details.map((d, i) => (
                    <div key={i}>
                      <span className="text-slate-400 block">{d.label}</span>
                      <span className="font-semibold text-slate-700">{d.value}</span>
                    </div>
                  ))}
                  <div>
                    <span className="text-slate-400 block">Payment Method</span>
                    <span className="font-semibold text-slate-700">{paymentMethod}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Amount Paid</span>
                    <span className="font-bold text-emerald-600 text-sm">${finalTotal} USD</span>
                  </div>
                </div>

                {/* Simulated Barcode */}
                <div className="pt-3 border-t border-dashed border-slate-300 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>||||| | |||| |||| ||||| || |||||</span>
                  <span className="text-[10px]">VERIFIED AUTH</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 font-semibold text-sm text-slate-700 flex items-center justify-center gap-2 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 font-semibold text-sm text-white transition shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Item Summary Card */}
              <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                {itemImage && (
                  <img
                    src={itemImage}
                    alt={title}
                    className="w-20 h-20 object-cover rounded-xl shadow-xs flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-base">{title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{itemSubtitle}</p>
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200 text-xs">
                    {details.map((d, i) => (
                      <div key={i}>
                        <span className="text-slate-400">{d.label}: </span>
                        <span className="font-semibold text-slate-700">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Coupon Code Input */}
              <form onSubmit={handleApplyCoupon} className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Have a Promo Code? (Try <span className="text-sky-600 font-bold">WANDER10</span> or <span className="text-sky-600 font-bold">WANDER15</span>)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. WANDER10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition"
                  >
                    Apply
                  </button>
                </div>
                {discountPercent > 0 && (
                  <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                    <Sparkles className="w-3.5 h-3.5" /> {discountPercent}% discount applied successfully!
                  </p>
                )}
                {couponError && <p className="text-xs text-rose-600 mt-1">{couponError}</p>}
              </form>

              {/* Payment Methods */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Credit Card', 'Debit Card', 'UPI', 'PayPal'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`p-3 rounded-xl border text-xs font-semibold transition text-center flex flex-col items-center gap-1 ${
                        paymentMethod === method
                          ? 'border-sky-600 bg-sky-50 text-sky-800'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>{method}</span>
                    </button>
                  ))}
                </div>

                {/* Card input mockup */}
                {(paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 mt-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg font-mono focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Expires (MM/YY)</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg font-mono focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">Security Code (CVC)</label>
                        <input
                          type="password"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg font-mono focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'UPI' && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                    <p className="text-xs text-slate-600">Enter Virtual Payment Address (VPA) / UPI ID:</p>
                    <input
                      type="text"
                      defaultValue="wanderer@okhdfcbank"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg font-mono focus:outline-none"
                    />
                  </div>
                )}

                {paymentMethod === 'PayPal' && (
                  <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 text-center space-y-2">
                    <p className="text-xs text-sky-800 font-medium">
                      You will be authenticated via PayPal sandbox checkout upon confirming.
                    </p>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Base Rate</span>
                  <span>${baseAmount}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Service Tax & Tourism Levy (8%)</span>
                  <span>+${taxes}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Promo Discount ({discountPercent}%)</span>
                    <span>-${discountAmount}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900 text-base">
                  <span>Total Amount</span>
                  <span className="text-sky-600">${finalTotal} USD</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handlePay}
                disabled={isProcessing}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Confirm & Pay ${finalTotal}</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
