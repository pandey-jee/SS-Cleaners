import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/chat/ChatWidget";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Target, Heart, Shield, CheckCircle2 } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Award,
      title: "Quality Excellence",
      description: "ISO certified processes ensuring top-tier service standards",
    },
    {
      icon: Shield,
      title: "Safety First",
      description: "Eco-friendly products and trained staff for your protection",
    },
    {
      icon: Heart,
      title: "Customer Focus",
      description: "100% satisfaction guaranteed with dedicated support",
    },
    {
      icon: Target,
      title: "Professional Service",
      description: "Experienced team with modern equipment and techniques",
    },
  ];

  const processSteps = [
    { step: "1", title: "Book Service", description: "Choose your service and schedule online or by phone" },
    { step: "2", title: "Inspection", description: "Our team assesses requirements and provides quote" },
    { step: "3", title: "Work Execution", description: "Professional service delivery with quality equipment" },
    { step: "4", title: "Quality Check", description: "Thorough inspection to ensure satisfaction" },
    { step: "5", title: "Payment", description: "Transparent pricing with multiple payment options" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-hero">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-background mb-6">
                About SS PureCare
              </h1>
              <p className="text-xl text-background/90">
                Your trusted partner for professional cleaning services
              </p>
            </div>
          </div>
        </section>

        {/* About Content */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                <p>
                  SS PureCare is a trusted name in professional cleaning and facility management services, 
                  serving residential and commercial clients across Rhega, Lucknow, Ayodhya, and Kanpur. With over 10 years of experience, 
                  we have built a reputation for reliability, quality, and customer satisfaction.
                </p>
                <p>
                  As an ISO 9001:2015 certified company, we maintain the highest standards in service 
                  delivery. Our team of trained and verified professionals uses modern equipment and 
                  eco-friendly products to ensure excellent results every time.
                </p>
                <p>
                  From house deep cleaning to comprehensive facility management, we offer a complete 
                  range of services tailored to meet your specific needs. Our commitment is to provide 
                  affordable, reliable, and professional solutions that exceed expectations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <Card className="border-border">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <Target className="h-8 w-8 text-primary mr-3" />
                    <h3 className="text-2xl font-bold text-foreground">Our Mission</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    To deliver exceptional cleaning and facility management services that create 
                    healthy, hygienic, and productive environments for our clients. We strive to 
                    be the most trusted service provider through consistent quality and innovation.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <Heart className="h-8 w-8 text-secondary mr-3" />
                    <h3 className="text-2xl font-bold text-foreground">Our Vision</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    To become India's leading cleaning and facility management company, recognized 
                    for excellence, sustainability, and customer-centric solutions. We aim to set 
                    new industry standards through continuous improvement and professional service.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
              Our Core Values
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <Card key={index} className="border-border hover:shadow-medium transition-shadow">
                    <CardContent className="p-6 text-center">
                      <div className="inline-flex p-3 bg-gradient-primary rounded-full mb-4">
                        <Icon className="h-8 w-8 text-primary-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {value.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Certifications & Standards
              </h2>
              <Card className="border-border">
                <CardContent className="p-8">
                  <div className="flex items-center justify-center mb-4">
                    <Award className="h-12 w-12 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    ISO 9001:2015 Certified
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We are proud to be ISO 9001:2015 certified, demonstrating our commitment to 
                    quality management systems and continuous improvement. This certification ensures 
                    that our services meet international standards and customer expectations consistently.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CheckCircle2 className="h-5 w-5 text-secondary mr-2" />
                      Licensed & Insured
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CheckCircle2 className="h-5 w-5 text-secondary mr-2" />
                      Verified Staff
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CheckCircle2 className="h-5 w-5 text-secondary mr-2" />
                      Quality Standards
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Our Process */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
              How We Work
            </h2>
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-5 gap-6">
                {processSteps.map((process, index) => (
                  <div key={index} className="relative">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary text-primary-foreground text-2xl font-bold mb-4">
                        {process.step}
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {process.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {process.description}
                      </p>
                    </div>
                    {index < processSteps.length - 1 && (
                      <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-primary -translate-x-1/2" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default About;
