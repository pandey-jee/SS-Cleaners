import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/chat/ChatWidget";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Services = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const serviceTypes = ["all", ...Array.from(new Set(services.map(s => s.service_type).filter(Boolean)))];
  
  const filteredServices = selectedCategory === "all" 
    ? services 
    : services.filter(s => s.service_type === selectedCategory);

  const ServiceCard = ({ service }: { service: any }) => {
    const features = Array.isArray(service.features) ? service.features : [];
    
    return (
      <Card className="border-border hover:border-primary hover:shadow-medium transition-all duration-300 animate-border-glow">
        <CardContent className="p-6">
          <div className="flex items-start mb-4">
            <div className="p-3 bg-gradient-secondary rounded-lg mr-4">
              <Home className="h-8 w-8 text-secondary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {service.name}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {service.short_description || service.description}
              </p>
              {service.price_range_min && service.price_range_max && (
                <p className="text-sm font-semibold text-primary">
                  ₹{service.price_range_min} - ₹{service.price_range_max}
                </p>
              )}
            </div>
          </div>
          {features.length > 0 && (
            <ul className="space-y-2 mb-4">
              {features.slice(0, 4).map((feature: string, idx: number) => (
                <li key={idx} className="flex items-center text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
          )}
          <Button asChild variant="outline" className="w-full">
            <Link to={`/services/${service.slug}`}>Learn More</Link>
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-cosmic animate-gradient">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-background mb-6">
                Our Services
              </h1>
              <p className="text-xl text-background/90">
                Comprehensive cleaning and facility management solutions for every need
              </p>
            </div>
          </div>
        </section>

        {/* All Services */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-3">
                All Services
              </h2>
              <p className="text-muted-foreground text-lg">
                Comprehensive cleaning and facility management solutions
              </p>
            </div>

            {/* Mobile Category Selector */}
            {serviceTypes.length > 1 && (
              <div className="md:hidden mb-8 sticky top-0 z-10 bg-background py-4 shadow-md">
                <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                  <TabsList className="w-full grid grid-cols-3 gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(serviceTypes.length, 3)}, 1fr)` }}>
                    {serviceTypes.map((type) => (
                      <TabsTrigger 
                        key={type} 
                        value={type}
                        className="capitalize text-xs"
                      >
                        {type === "all" ? "All" : type}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            )}

            {loading ? (
              <div className="text-center text-muted-foreground py-12">
                Loading services...
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                No services available in this category.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-primary">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-primary-foreground mb-4">
                Need a Custom Solution?
              </h2>
              <p className="text-lg text-primary-foreground/90 mb-8">
                Contact us for customized cleaning and facility management packages
              </p>
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
                <Link to="/contact">Get a Quote</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default Services;
