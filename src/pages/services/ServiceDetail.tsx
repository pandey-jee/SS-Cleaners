import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/chat/ChatWidget";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ServiceDetail = () => {
  const { slug } = useParams();
  const [service, setService] = useState<any>(null);
  const [pricing, setPricing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        // Fetch service details
        const { data: serviceData, error: serviceError } = await supabase
          .from("services")
          .select("*")
          .eq("slug", slug)
          .eq("is_active", true)
          .maybeSingle();

        if (serviceError) throw serviceError;
        
        if (serviceData) {
          setService(serviceData);

          // Fetch pricing for this service
          const { data: pricingData, error: pricingError } = await supabase
            .from("pricing_matrix")
            .select("*")
            .eq("service_id", serviceData.id);

          if (pricingError) throw pricingError;
          setPricing(pricingData || []);
        }
      } catch (error) {
        console.error("Error fetching service:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchServiceData();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Loading service details...</p>
        </div>
        <Footer />
        <ChatWidget />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Service Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The service you're looking for doesn't exist or is no longer available.
          </p>
          <Button asChild>
            <Link to="/services">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Services
            </Link>
          </Button>
        </div>
        <Footer />
        <ChatWidget />
      </div>
    );
  }

  const features = Array.isArray(service.features) ? service.features : [];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-hero overflow-hidden">
          {service.image_url && (
            <div className="absolute inset-0 z-0">
              <img 
                src={service.image_url} 
                alt={service.name}
                className="w-full h-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
            </div>
          )}
          <div className="container mx-auto px-4 relative z-10">
            <Button
              asChild
              variant="ghost"
              className="mb-6 text-background hover:text-background/80"
            >
              <Link to="/services">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Services
              </Link>
            </Button>
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold text-background mb-6">
                {service.name}
              </h1>
              <p className="text-xl text-background/90 mb-8">
                {service.description || service.short_description}
              </p>
              {service.price_range_min && service.price_range_max && (
                <div className="inline-block bg-background/10 px-6 py-3 rounded-lg mb-8">
                  <p className="text-background font-semibold">
                    Starting from ₹{service.price_range_min}
                  </p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
                  <Link to="/contact">Book Now</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="bg-background/10 border-background text-background hover:bg-background hover:text-primary"
                >
                  <a href="tel:+911234567890">Call for Quote</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        {features.length > 0 && (
          <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
                What's Included
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {features.map((feature: string, index: number) => (
                  <Card key={index} className="border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-secondary mr-3 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-foreground">{feature}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Pricing */}
        {pricing.length > 0 && (
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
                Pricing Options
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {pricing.map((price) => {
                  const addOns = price.add_ons || {};
                  return (
                    <Card key={price.id} className="border-border">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          {price.property_type} - {price.size_category}
                        </h3>
                        <div className="text-3xl font-bold text-primary mb-6">
                          ₹{price.base_price}
                        </div>
                        {Object.keys(addOns).length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-semibold text-foreground mb-2">Add-ons:</p>
                            <ul className="space-y-2">
                              {Object.entries(addOns).map(([key, value]) => (
                                <li key={key} className="text-sm text-muted-foreground">
                                  {key}: ₹{value as number}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <Button asChild className="w-full">
                          <Link to="/contact">Select Package</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-16 bg-gradient-primary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-8">
              Book your {service.name} service today
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

export default ServiceDetail;
