import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/chat/ChatWidget";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Droplet, Shield, AlertCircle } from "lucide-react";

const WaterTank = () => {
  const process = [
    {
      step: "1",
      title: "Complete Drainage",
      description: "Empty the tank completely and remove all water",
    },
    {
      step: "2",
      title: "Manual Scrubbing",
      description: "Thorough scrubbing of walls, floor, and corners",
    },
    {
      step: "3",
      title: "High-Pressure Wash",
      description: "Remove stubborn deposits and biofilm",
    },
    {
      step: "4",
      title: "Disinfection",
      description: "Apply food-grade disinfectants for safety",
    },
    {
      step: "5",
      title: "Final Rinse",
      description: "Multiple rinses to remove all cleaning agents",
    },
    {
      step: "6",
      title: "Quality Check",
      description: "Inspection and water quality certificate",
    },
  ];

  const whyImportant = [
    "Removes harmful bacteria and algae growth",
    "Prevents waterborne diseases",
    "Eliminates foul odor and taste",
    "Removes sediment and rust deposits",
    "Extends tank lifespan",
    "Complies with health regulations",
  ];

  const signs = [
    "Discolored or cloudy water",
    "Unpleasant smell from water",
    "Visible algae or slime in tank",
    "Sediment in water",
    "Haven't cleaned in 6+ months",
    "Health issues in family",
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-hero">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex p-4 bg-background/10 rounded-full mb-6">
                <Droplet className="h-12 w-12 text-background" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-background mb-6">
                Water Tank Cleaning Services
              </h1>
              <p className="text-xl text-background/90 mb-8">
                Professional cleaning and disinfection for safe, hygienic drinking water
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
                  <Link to="/contact">Book Cleaning</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-background/10 border-background text-background hover:bg-background hover:text-primary">
                  <a href="tel:+911234567890">Emergency Service</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Why It's Important */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Why Water Tank Cleaning Matters
                </h2>
                <p className="text-lg text-muted-foreground">
                  Regular cleaning is essential for your family's health
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {whyImportant.map((reason, index) => (
                  <Card key={index} className="border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-secondary mr-3 flex-shrink-0 mt-0.5" />
                        <p className="text-foreground">{reason}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Our Process */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
              Our 6-Step Cleaning Process
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {process.map((step, index) => (
                <Card key={index} className="border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start mb-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold mr-3">
                        {step.step}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          {step.title}
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground pl-13">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Signs You Need Cleaning */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
              Signs Your Tank Needs Cleaning
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {signs.map((sign, index) => (
                <Card key={index} className="border-border hover:border-destructive transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-destructive mr-3 flex-shrink-0 mt-0.5" />
                      <p className="text-foreground">{sign}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <p className="text-muted-foreground mb-4">
                Experiencing any of these issues? Get your tank cleaned immediately.
              </p>
              <Button asChild size="lg">
                <Link to="/contact">Schedule Cleaning Now</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Safety & Certification */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="border-border">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <Shield className="h-12 w-12 text-secondary mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-foreground mb-4">
                      Safety & Quality Assurance
                    </h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-4">
                        We Use:
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-secondary mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">Food-grade disinfectants</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-secondary mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">Non-toxic cleaning agents</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-secondary mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">Professional equipment</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-secondary mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">Trained technicians</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-4">
                        You Get:
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">Before/after photos</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">Cleaning certificate</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">Water quality report</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">Maintenance tips</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground mb-4 text-center">
              Transparent Pricing
            </h2>
            <p className="text-muted-foreground text-center mb-12">
              Starting from ₹999 for small tanks (500L)
            </p>
            <div className="max-w-md mx-auto text-center">
              <Card className="border-border">
                <CardContent className="p-8">
                  <p className="text-muted-foreground mb-6">
                    Final pricing depends on tank size, accessibility, and condition. We provide free inspection and quote.
                  </p>
                  <Button asChild size="lg" className="w-full">
                    <Link to="/contact">Get Free Quote</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-secondary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-secondary-foreground mb-4">
              Protect Your Family's Health
            </h2>
            <p className="text-lg text-secondary-foreground/90 mb-8">
              Book professional water tank cleaning today
            </p>
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
              <Link to="/contact">Book Service Now</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default WaterTank;
