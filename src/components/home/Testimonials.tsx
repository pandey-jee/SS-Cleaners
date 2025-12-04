import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Homeowner",
      text: "SS PureCare's deep cleaning service exceeded our expectations. The team was professional, punctual, and thorough. Our home has never looked better!",
      rating: 5,
    },
    {
      name: "Priya Sharma",
      role: "Office Manager",
      text: "We've been using their office cleaning services for 2 years. Consistent quality, reliable staff, and excellent customer service. Highly recommended!",
      rating: 5,
    },
    {
      name: "Amit Patel",
      role: "Restaurant Owner",
      text: "Their pest control service is exceptional. They solved our persistent problem professionally and the results have been lasting. Very satisfied!",
      rating: 5,
    },
    {
      name: "Sunita Verma",
      role: "Apartment Resident",
      text: "Water tank cleaning service was thorough and professional. The team explained everything and completed the work efficiently. Great experience!",
      rating: 5,
    },
    {
      name: "Vikram Singh",
      role: "Hotel Manager",
      text: "SS PureCare handles all our housekeeping needs. Their trained staff maintains excellent standards. A trusted partner for our hospitality business.",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What Our Clients Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real feedback from satisfied customers across residential and commercial sectors
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-5xl mx-auto"
        >
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <Card className="h-full border-border hover:shadow-medium transition-shadow">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-5 w-5 fill-accent text-accent"
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4 flex-grow">
                      "{testimonial.text}"
                    </p>
                    <div>
                      <p className="font-semibold text-foreground">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
};

export default Testimonials;
