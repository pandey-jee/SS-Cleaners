import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import ServicesShowcase from "@/components/home/ServicesShowcase";
import Testimonials from "@/components/home/Testimonials";
import CTASection from "@/components/home/CTASection";
import ChatWidget from "@/components/chat/ChatWidget";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <WhyChooseUs />
        <ServicesShowcase />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default Index;
