import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const residentialServices = [
    "House Deep Cleaning",
    "Carpet Cleaning",
    "Sofa Cleaning",
    "Water Tank Cleaning",
  ];

  const commercialServices = [
    "Office Cleaning",
    "Housekeeping Services",
    "Hospital Cleaning",
    "School Cleaning",
  ];

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-background">SS PureCare</h3>
            <p className="text-sm text-background/80 mb-4">
              Professional cleaning and facility management services serving Rhega, Lucknow, Ayodhya, and Kanpur. ISO 9001:2015 certified.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-background/80 hover:text-background transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-background/80 hover:text-background transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-background/80 hover:text-background transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-background/80 hover:text-background transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Residential Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-background">Residential Services</h4>
            <ul className="space-y-2">
              {residentialServices.map((service) => (
                <li key={service}>
                  <Link
                    to="/services"
                    className="text-sm text-background/80 hover:text-background transition-colors"
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Commercial Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-background">Commercial Services</h4>
            <ul className="space-y-2">
              {commercialServices.map((service) => (
                <li key={service}>
                  <Link
                    to="/services"
                    className="text-sm text-background/80 hover:text-background transition-colors"
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-background">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start text-sm text-background/80">
                <Phone className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>+91 1234567890</span>
              </li>
              <li className="flex items-start text-sm text-background/80">
                <Mail className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>info@cigicare.com</span>
              </li>
              <li className="flex items-start text-sm text-background/80">
                <MapPin className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>Patna, Bihar, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/20 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-background/80">
              © {currentYear} SS PureCare. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy-policy" className="text-sm text-background/80 hover:text-background transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="text-sm text-background/80 hover:text-background transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
