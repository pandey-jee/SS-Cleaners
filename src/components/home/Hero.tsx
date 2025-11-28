import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-cleaning.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[600px] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Professional cleaning services"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/60 animate-gradient" style={{ backgroundSize: '200% 200%' }} />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 z-10">
        <div className="max-w-3xl">
          <div className="inline-block mb-4 px-4 py-2 bg-accent/20 backdrop-blur-sm rounded-full">
            <span className="text-sm font-semibold text-background">
              ISO 9001:2015 Certified Company
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-background mb-6 leading-tight">
            Professional Cleaning & Facility Management Services
          </h1>
          
          <p className="text-lg md:text-xl text-background/90 mb-8 leading-relaxed">
            Reliable • Affordable • Professional Service Provider with Trained & Verified Staff
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-large group"
            >
              <Link to="/contact">
                Book a Service
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
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
                Call Now
              </a>
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6 max-w-md">
            <div className="text-center">
              <div className="text-3xl font-bold text-background mb-1">10+</div>
              <div className="text-sm text-background/80">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-background mb-1">5000+</div>
              <div className="text-sm text-background/80">Happy Clients</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-background mb-1">100%</div>
              <div className="text-sm text-background/80">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
