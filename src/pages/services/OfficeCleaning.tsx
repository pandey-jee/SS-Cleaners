import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/chat/ChatWidget";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Building2, Users2, Clock, Shield } from "lucide-react";
import officeCleaningImage from "@/assets/office-cleaning.jpg";

const OfficeCleaning = () => {
  const services = [
    "Daily desk and workstation cleaning",
    "Reception and common area maintenance",
    "Conference room cleaning",
    "Washroom sanitization and restocking",
    "Pantry and kitchen area cleaning",
    "Floor vacuuming and mopping",
    "Glass and window cleaning",
    "Waste disposal and recycling",
  ];

  const benefits = [
    {
      icon: Building2,
      title: "Professional Image",
      description: "Maintain a clean, impressive workspace for clients and employees",
    },
    {
      icon: Shield,
      title: "Health & Safety",
      description: "Reduce sick days with regular sanitization and hygiene",
    },
    {
      icon: Users2,
      title: "Trained Staff",
      description: "Experienced cleaners familiar with office environments",
    },
    {
      icon: Clock,
      title: "Flexible Scheduling",
      description: "Before hours, after hours, or during business hours",
    },
  ];

  const plans = [
    {
      name: "Daily Cleaning",
      description: "Complete office cleaning every business day",
      features: [
        "Desk cleaning",
        "Washroom maintenance",
        "Pantry cleaning",
        "Floor cleaning",
        "Waste disposal",
      ],
    },
    {
      name: "Weekly Deep Clean",
      description: "Intensive cleaning once per week plus daily basics",
      features: [
        "All daily services",
        "Deep carpet cleaning",
        "Window cleaning",
        "Chair and furniture cleaning",
        "Storage area organization",
      ],
    },
    {
      name: "Custom Package",
      description: "Tailored solution for your specific needs",
      features: [
        "Flexible schedule",
        "Custom service mix",
        "Dedicated supervisor",
        "Quality reports",
        "Special requirements",
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-hero">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-background mb-6">
                  Office Cleaning Services
                </h1>
                <p className="text-xl text-background/90 mb-8">
                  Professional workplace cleaning solutions that enhance productivity and create a healthy work environment.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
                    <Link to="/contact">Get a Quote</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="bg-background/10 border-background text-background hover:bg-background hover:text-primary">
                    <a href="tel:+911234567890">Schedule Consultation</a>
                  </Button>
                </div>
              </div>
              <div className="relative">
                <img
                  src={officeCleaningImage}
                  alt="Office cleaning service"
                  className="rounded-lg shadow-large"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Services Included */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              Our Office Cleaning Services
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {services.map((service, index) => (
                <Card key={index} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-secondary mr-3 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground">{service}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
              Benefits of Professional Office Cleaning
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <Card key={index} className="border-border text-center">
                    <CardContent className="p-6">
                      <div className="inline-flex p-3 bg-gradient-secondary rounded-full mb-4">
                        <Icon className="h-8 w-8 text-secondary-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {benefit.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Service Plans */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground mb-4 text-center">
              Choose Your Service Plan
            </h2>
            <p className="text-muted-foreground text-center mb-12">
              Flexible options to suit your office size and budget
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {plans.map((plan, index) => (
                <Card key={index} className="border-border">
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-muted-foreground mb-6">{plan.description}</p>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-sm">
                          <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/contact">Contact for Pricing</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Industries Served */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
              Industries We Serve
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                "Corporate Offices",
                "IT Companies",
                "Banks & Financial",
                "Healthcare Clinics",
                "Educational Institutions",
                "Retail Offices",
              ].map((industry, index) => (
                <Card key={index} className="border-border">
                  <CardContent className="p-4 text-center">
                    <p className="font-semibold text-foreground">{industry}</p>
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
              Ready for a Cleaner Workspace?
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-8">
              Get a free consultation and customized quote for your office
            </p>
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
              <Link to="/contact">Schedule Free Consultation</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default OfficeCleaning;
