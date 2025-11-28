import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CreditCard, Lock } from "lucide-react";
import { toast } from "sonner";

const MockCheckout = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const handleMockPayment = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      toast.success("Payment processed successfully!");
      navigate('/payment/success?mock=true');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <CreditCard className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Mock Payment Checkout</h1>
          <p className="text-muted-foreground">
            This is a demo checkout. In production, this will be replaced with real Stripe checkout.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Amount to Pay</p>
            <p className="text-2xl font-bold">₹ {searchParams.get('amount') || '0'}</p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Secure payment processing</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleMockPayment}
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? "Processing Payment..." : "Pay Now (Demo)"}
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/payment/cancel')}
            disabled={isProcessing}
            className="w-full"
          >
            Cancel Payment
          </Button>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> Add your Stripe secret key to enable real payment processing.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default MockCheckout;