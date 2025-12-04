import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const ServicesShowcase = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true })
          .limit(8);

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

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Top Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive cleaning and facility management solutions for homes and businesses
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            <div className="col-span-full text-center text-muted-foreground">
              Loading services...
            </div>
          ) : services.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground">
              No services available at the moment.
            </div>
          ) : (
            services.map((service) => (
              <Card
                key={service.id}
                className="group border-border hover:border-primary transition-all duration-300 hover:shadow-medium"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    {service.image_url ? (
                      <div className="mb-4 w-full h-32 overflow-hidden rounded-lg">
                        <img 
                          src={service.image_url} 
                          alt={service.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="mb-4 p-3 bg-secondary-light rounded-lg group-hover:bg-gradient-secondary transition-all duration-300">
                        <Home className="h-8 w-8 text-secondary group-hover:text-secondary-foreground transition-colors" />
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {service.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {service.short_description}
                    </p>
                    {service.price_range_min && service.price_range_max && (
                      <p className="text-xs text-primary font-semibold mb-4">
                        ₹{service.price_range_min} - ₹{service.price_range_max}
                      </p>
                    )}
                    <Link
                      to={`/services/${service.slug}`}
                      className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                    >
                      Learn More →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="text-center">
          <Button asChild size="lg" variant="outline">
            <Link to="/services">View All Services</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesShowcase;
