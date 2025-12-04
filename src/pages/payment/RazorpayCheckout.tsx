import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CreditCard, Lock, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RazorpayCheckout = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingScript, setIsLoadingScript] = useState(true);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const bookingId = searchParams.get('bookingId');
  const amount = searchParams.get('amount');

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsLoadingScript(false);
    script.onerror = () => {
      toast.error('Failed to load payment gateway');
      setIsLoadingScript(false);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (bookingId) {
      loadBookingDetails();
    }
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, enquiries(service_required)')
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      setBookingDetails(data);
    } catch (error) {
      console.error('Error loading booking:', error);
      toast.error('Failed to load booking details');
    }
  };

  const handlePayment = async () => {
    if (!bookingId || !amount) {
      toast.error('Invalid payment details');
      return;
    }

    setIsProcessing(true);

    try {
      // Create Razorpay order via Supabase function
      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        'create-razorpay-order',
        {
          body: {
            amount: parseFloat(amount),
            bookingId: bookingId,
            currency: 'INR',
          },
        }
      );

      if (orderError) throw orderError;

      const { orderId, amount: orderAmount, currency, keyId } = orderData;

      // Configure Razorpay options
      const options = {
        key: keyId,
        amount: orderAmount,
        currency: currency,
        name: 'SS Cleaners',
        description: bookingDetails?.service_type || bookingDetails?.enquiries?.service_required || 'Cleaning Service',
        order_id: orderId,
        handler: async function (response: any) {
          // Payment successful, verify on backend
          try {
            const { error: verifyError } = await supabase.functions.invoke(
              'verify-razorpay-payment',
              {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  bookingId: bookingId,
                },
              }
            );

            if (verifyError) throw verifyError;

            toast.success('Payment successful!');
            navigate(`/payment/success?bookingId=${bookingId}`);
          } catch (error) {
            console.error('Verification error:', error);
            toast.error('Payment verification failed');
            navigate(`/payment/cancel?bookingId=${bookingId}`);
          }
        },
        prefill: {
          name: bookingDetails?.name || '',
          email: bookingDetails?.email || '',
          contact: bookingDetails?.phone || '',
        },
        theme: {
          color: '#0EA5E9',
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            toast.info('Payment cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment initiation failed');
      setIsProcessing(false);
    }
  };

  if (!bookingId || !amount) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Invalid payment link. Please contact support.
            </AlertDescription>
          </Alert>
          <Button
            onClick={() => navigate('/')}
            className="w-full mt-4"
            variant="outline"
          >
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <CreditCard className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Secure Payment</h1>
          <p className="text-muted-foreground">
            Complete your booking payment
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {bookingDetails && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service:</span>
                <span className="font-medium">{bookingDetails.service_type || bookingDetails.enquiries?.service_required || 'Cleaning Service'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Customer:</span>
                <span className="font-medium">{bookingDetails.name}</span>
              </div>
              <div className="border-t border-border pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount to Pay:</span>
                  <span className="text-2xl font-bold">₹ {amount}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Secured by Razorpay</span>
          </div>

          <div className="text-xs text-muted-foreground">
            Accepts: UPI, Cards, Net Banking, Wallets
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handlePayment}
            disabled={isProcessing || isLoadingScript}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : isLoadingScript ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Pay Now'
            )}
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/payment/cancel')}
            disabled={isProcessing || isLoadingScript}
            className="w-full"
          >
            Cancel Payment
          </Button>
        </div>

        <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
          <p className="text-xs text-green-800 dark:text-green-200">
            <strong>100% Secure:</strong> All payments are encrypted and processed securely through Razorpay.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default RazorpayCheckout;
