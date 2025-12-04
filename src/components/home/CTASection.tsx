import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone, Calendar } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-16 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-background mb-4">
            Need Urgent Cleaning Services?
          </h2>
          <p className="text-lg text-background/90 mb-8">
            We're available 7 days a week. Professional service at your doorstep within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-large"
            >
              <Link to="/contact">
                <Calendar className="mr-2 h-5 w-5" />
                Book a Service
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-background/10 backdrop-blur-sm border-background text-background hover:bg-background hover:text-primary"
            >
              <a href="tel:+911234567890">
                <Phone className="mr-2 h-5 w-5" />
                Request Call Back
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
