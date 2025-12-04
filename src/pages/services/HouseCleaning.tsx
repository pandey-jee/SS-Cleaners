import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/chat/ChatWidget";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, Shield, DollarSign } from "lucide-react";
import houseCleaningImage from "@/assets/house-cleaning.jpg";

const HouseCleaning = () => {
  const inclusions = [
    "Complete floor scrubbing and mopping",
    "Dusting of all surfaces and furniture",
    "Kitchen deep cleaning (counters, cabinets, appliances)",
    "Bathroom sanitization and descaling",
    "Window and glass cleaning",
    "Sofa and furniture wiping",
    "Shoe rack and wardrobe exterior cleaning",
    "Cobweb removal from ceiling and corners",
  ];

  const whyChoose = [
    {
      icon: Shield,
      title: "Trained Professionals",
      description: "Background-verified staff with proper training",
    },
    {
      icon: Clock,
      title: "Quick Service",
      description: "Same-day or next-day service available",
    },
    {
      icon: Shield,
      title: "Eco-Friendly",
      description: "Safe, non-toxic cleaning products",
    },
    {
      icon: DollarSign,
      title: "Affordable Rates",
      description: "Transparent pricing with no hidden costs",
    },
  ];

  const packages = [
    {
      name: "Basic",
      price: "₹1,999",
      features: ["1 BHK apartment", "Living room, bedroom, kitchen, bathroom", "3-4 hours duration"],
    },
    {
      name: "Standard",
      price: "₹2,999",
      features: ["2 BHK apartment", "All rooms including balcony", "4-5 hours duration"],
      popular: true,
    },
    {
      name: "Premium",
      price: "₹4,499",
      features: ["3 BHK apartment", "Complete house including terrace", "5-6 hours duration"],
    },
  ];

  const faqs = [
    {
      q: "How often should I get deep cleaning done?",
      a: "We recommend deep cleaning every 3-6 months depending on your lifestyle and foot traffic.",
    },
    {
      q: "Do I need to provide cleaning supplies?",
      a: "No, we bring all necessary equipment and eco-friendly cleaning products.",
    },
    {
      q: "How long does the service take?",
      a: "Typically 3-6 hours depending on the size of your home and level of cleaning required.",
    },
    {
      q: "Is it safe for kids and pets?",
      a: "Yes, we use only eco-friendly, non-toxic cleaning products that are safe for everyone.",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-hero overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-background mb-6">
                  House Deep Cleaning Services
                </h1>
                <p className="text-xl text-background/90 mb-8">
                  Professional deep cleaning for a spotless, hygienic home. From floor to ceiling, we cover every corner.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
                    <Link to="/contact">Book Now</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="bg-background/10 border-background text-background hover:bg-background hover:text-primary">
                    <a href="tel:+911234567890">Call for Quote</a>
                  </Button>
                </div>
              </div>
              <div className="relative">
                <img
                  src={houseCleaningImage}
                  alt="House cleaning service"
                  className="rounded-lg shadow-large"
                />
              </div>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              What's Included
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {inclusions.map((item, index) => (
                <Card key={index} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-secondary mr-3 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground">{item}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
              Why Choose Our Service
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {whyChoose.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Card key={index} className="border-border text-center">
                    <CardContent className="p-6">
                      <div className="inline-flex p-3 bg-gradient-primary rounded-full mb-4">
                        <Icon className="h-8 w-8 text-primary-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Packages */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground mb-4 text-center">
              Service Packages
            </h2>
            <p className="text-muted-foreground text-center mb-12">
              Choose the package that fits your needs
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {packages.map((pkg, index) => (
                <Card
                  key={index}
                  className={`border-border ${
                    pkg.popular ? "ring-2 ring-primary shadow-large" : ""
                  }`}
                >
                  <CardContent className="p-6">
                    {pkg.popular && (
                      <div className="inline-block px-3 py-1 bg-gradient-primary text-primary-foreground text-xs font-semibold rounded-full mb-4">
                        Most Popular
                      </div>
                    )}
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      {pkg.name}
                    </h3>
                    <div className="text-3xl font-bold text-primary mb-6">
                      {pkg.price}
                    </div>
                    <ul className="space-y-3 mb-6">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-sm">
                          <CheckCircle2 className="h-5 w-5 text-secondary mr-2 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button asChild className="w-full">
                      <Link to="/contact">Select Package</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-border">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {faq.q}
                    </h3>
                    <p className="text-muted-foreground">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-primary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Ready for a Spotless Home?
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-8">
              Book your house deep cleaning service today
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

export default HouseCleaning;
