import { Link } from 'react-router-dom';
import { Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-navy-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/icons/WhatsApp_Image_2026-06-13_at_15.08.17.jpeg" alt="Drive Agency" className="h-10 w-10 rounded-lg object-cover" />
              <span className="text-xl font-bold">Drive Agency</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              South Africa's premier car finance matchmaking service. We connect buyers with dealerships and agents.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white text-sm transition-colors">Home</Link></li>
              <li><Link to="/buyers" className="text-gray-400 hover:text-white text-sm transition-colors">For Buyers</Link></li>
              <li><Link to="/cars" className="text-gray-400 hover:text-white text-sm transition-colors">Browse Cars</Link></li>
              <li><Link to="/dealerships" className="text-gray-400 hover:text-white text-sm transition-colors">For Dealerships</Link></li>
              <li><Link to="/become-agent" className="text-gray-400 hover:text-white text-sm transition-colors">Become an Agent</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</Link></li>
              <li><Link to="/popia" className="text-gray-400 hover:text-white text-sm transition-colors">POPIA Compliance</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Phone className="w-4 h-4 flex-shrink-0 text-brand-400" />
                <a href="tel:0664268711" className="hover:text-white transition-colors">066 426 8711</a>
              </li>
            </ul>
            <h4 className="font-semibold mt-6 mb-3">Follow Us</h4>
            <div className="flex items-center gap-3">
              <a
                href="https://www.linkedin.com/company/drive-agency-sa"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-navy-800 hover:bg-brand-500 flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <span className="text-gray-300 text-xs font-bold leading-none">in</span>
              </a>
              <a
                href="https://www.instagram.com/driveagencysa"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-navy-800 hover:bg-brand-500 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <span className="text-gray-300 text-xs font-bold leading-none">IG</span>
              </a>
              <a
                href="https://www.facebook.com/driveagencysa"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-navy-800 hover:bg-brand-500 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <span className="text-gray-300 text-xs font-bold leading-none">f</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Drive Agency South Africa. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
