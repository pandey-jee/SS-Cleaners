import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

interface GalleryImage {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  before_image_url: string | null;
  service_type: string | null;
}

const BeforeAfterSlider = ({ beforeUrl, afterUrl, title }: { beforeUrl: string; afterUrl: string; title: string }) => {
  const [sliderValue, setSliderValue] = useState([50]);

  return (
    <div className="relative w-full h-80 overflow-hidden rounded-lg">
      {/* After Image (Base) */}
      <img
        src={afterUrl}
        alt={`${title} - After`}
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Before Image (Overlay with clip) */}
      <div 
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderValue[0]}% 0 0)` }}
      >
        <img
          src={beforeUrl}
          alt={`${title} - Before`}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Slider Line */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
        style={{ left: `${sliderValue[0]}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
          <div className="w-4 h-4 border-l-2 border-r-2 border-foreground"></div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 bg-background/80 backdrop-blur px-3 py-1 rounded-full">
        <span className="text-sm font-medium">Before</span>
      </div>
      <div className="absolute top-4 right-4 bg-background/80 backdrop-blur px-3 py-1 rounded-full">
        <span className="text-sm font-medium">After</span>
      </div>

      {/* Slider Control */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64">
        <Slider
          value={sliderValue}
          onValueChange={setSliderValue}
          max={100}
          step={1}
          className="cursor-ew-resize"
        />
      </div>
    </div>
  );
};

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (!error && data) {
      setImages(data);
      // Extract unique service types
      const types = [...new Set(data.map(img => img.service_type).filter(Boolean))] as string[];
      setServiceTypes(types);
    }
    setLoading(false);
  };

  const filteredImages = selectedFilter === 'all' 
    ? images 
    : images.filter(img => img.service_type === selectedFilter);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Our Work Gallery
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse through our portfolio of cleaning excellence and see the quality of our work
          </p>
        </div>
      </section>

      {/* Filter and Gallery */}
      <section className="container mx-auto px-4 pb-20">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading gallery...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">No images in gallery yet</p>
          </div>
        ) : (
          <Tabs value={selectedFilter} onValueChange={setSelectedFilter} className="w-full">
            <TabsList className="mb-8 flex flex-wrap justify-center gap-2 h-auto bg-muted/50 p-2">
              <TabsTrigger value="all" className="px-6">All</TabsTrigger>
              {serviceTypes.map((type) => (
                <TabsTrigger key={type} value={type} className="px-6">
                  {type}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedFilter} className="mt-0">
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {filteredImages.map((image) => (
                    <CarouselItem key={image.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                      <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-0">
                          {image.before_image_url ? (
                            <div className="relative">
                              <BeforeAfterSlider
                                beforeUrl={image.before_image_url}
                                afterUrl={image.image_url}
                                title={image.title}
                              />
                              <Badge className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary/90 backdrop-blur">
                                Before/After
                              </Badge>
                            </div>
                          ) : (
                            <div className="relative overflow-hidden">
                              <img
                                src={image.image_url}
                                alt={image.title}
                                className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <h3 className="text-lg font-semibold mb-2">
                              {image.title}
                            </h3>
                            {image.service_type && (
                              <Badge variant="secondary" className="mb-2">
                                {image.service_type}
                              </Badge>
                            )}
                            {image.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {image.description}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </Carousel>
            </TabsContent>
          </Tabs>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience Our Service?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Let us bring the same level of excellence to your space
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-base font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            Get Started
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
