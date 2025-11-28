import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // In production, verify the payment with Stripe here
    console.log('Payment successful, session:', sessionId);
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>

        <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-muted-foreground mb-8">
          Your booking has been confirmed. We'll send you a confirmation email shortly.
        </p>

        <div className="space-y-3">
          <Button 
            onClick={() => navigate('/')}
            className="w-full"
            size="lg"
          >
            Back to Home
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PaymentSuccess;