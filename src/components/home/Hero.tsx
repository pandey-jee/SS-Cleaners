import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import heroImage from "@/assets/hero-cleaning.jpg";
import houseCleaningImage from "@/assets/house-cleaning.jpg";
import officeCleaningImage from "@/assets/office-cleaning.jpg";

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(1); // Start at 1 (first real slide)
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Hero images array with multiple cleaning service images
  const heroImages = [
    heroImage,
    houseCleaningImage,
    officeCleaningImage,
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1920&h=1080&fit=crop&q=80", // Kitchen cleaning
    "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=1920&h=1080&fit=crop&q=80", // Bathroom cleaning
    "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=1920&h=1080&fit=crop&q=80", // Window cleaning
  ];

  // Create cloned slides for infinite loop (Owl Carousel technique)
  const clonedImages = [
    heroImages[heroImages.length - 1], // Clone last slide at start
    ...heroImages,
    heroImages[0], // Clone first slide at end
  ];

  const totalSlides = heroImages.length;

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => prev + 1);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => prev - 1);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index + 1); // +1 because of clone at start
  };

  // Handle infinite loop reset after transition
  const handleTransitionEnd = () => {
    setIsTransitioning(false);
    
    // If on cloned last slide (index 0), jump to real last slide
    if (currentSlide === 0) {
      setCurrentSlide(totalSlides);
    }
    // If on cloned first slide (index totalSlides + 1), jump to real first slide
    else if (currentSlide === totalSlides + 1) {
      setCurrentSlide(1);
    }
  };

  // Calculate transform for horizontal sliding
  const getTransformValue = () => {
    return -currentSlide * 100;
  };

  // Get active indicator index
  const getActiveIndicator = () => {
    if (currentSlide === 0) return totalSlides - 1;
    if (currentSlide === totalSlides + 1) return 0;
    return currentSlide - 1;
  };

  return (
    <section className="relative min-h-[600px] flex items-center overflow-hidden">
      {/* Owl Carousel Style - Image Stage */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Owl Stage - Horizontal sliding container */}
        <div 
          className="flex h-full"
          style={{
            transform: `translate3d(${getTransformValue()}%, 0px, 0px)`,
            transition: isTransitioning ? 'transform 0.6s ease-in-out' : 'none',
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {/* Owl Items - Slides including clones for infinite loop */}
          {clonedImages.map((image, index) => (
            <div
              key={index}
              className="relative flex-shrink-0 h-full w-full"
            >
              <img
                src={image}
                alt={`Professional cleaning services`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30" />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-background/20 hover:bg-background/40 backdrop-blur-sm text-background p-3 rounded-full transition-all duration-300 hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-background/20 hover:bg-background/40 backdrop-blur-sm text-background p-3 rounded-full transition-all duration-300 hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === getActiveIndicator()
                ? "w-8 bg-background"
                : "w-2 bg-background/40 hover:bg-background/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
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
