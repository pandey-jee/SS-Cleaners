import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XCircle } from "lucide-react";

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
          <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
        </div>

        <h1 className="text-3xl font-bold mb-2">Payment Cancelled</h1>
        <p className="text-muted-foreground mb-8">
          Your payment was cancelled. You can try again when you're ready to book.
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

export default PaymentCancel;