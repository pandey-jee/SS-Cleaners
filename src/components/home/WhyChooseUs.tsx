import { Award, Users, Wrench, Smile, Shield, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const WhyChooseUs = () => {
  const features = [
    {
      icon: Award,
      title: "ISO 9001:2015 Certified",
      description: "Quality management standards ensure excellence in every service",
    },
    {
      icon: Users,
      title: "Trained & Verified Staff",
      description: "Background-checked professionals with proper training certification",
    },
    {
      icon: Wrench,
      title: "Modern Equipment",
      description: "Latest cleaning technology and eco-friendly products",
    },
    {
      icon: Smile,
      title: "100% Satisfaction",
      description: "Customer happiness is our priority with guaranteed results",
    },
    {
      icon: Shield,
      title: "Fully Insured",
      description: "Complete protection and liability coverage for peace of mind",
    },
    {
      icon: DollarSign,
      title: "Affordable Packages",
      description: "Competitive pricing with transparent, no-hidden-cost quotes",
    },
  ];

  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose SS PureCare?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We combine professional expertise with reliable service to deliver exceptional cleaning solutions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="border-border hover:shadow-medium transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 p-3 bg-gradient-primary rounded-full">
                      <Icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
