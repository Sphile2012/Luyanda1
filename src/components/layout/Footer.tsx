import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-navy-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/image.png" alt="Drive Agency" className="h-10 w-10 rounded-lg object-cover" />
              <span className="text-xl font-bold">Drive Agency</span>
            </div>
            <p className="text-gray-400 text-sm">
              South Africa's premier car finance matchmaking service. We connect
              buyers with dealerships and agents.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/buyers" className="text-gray-400 hover:text-white text-sm">
                  for Buyers
                </Link>
              </li>
              <li>
                <Link
                  to="/dealerships"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  for Dealerships
                </Link>
              </li>
              <li>
                <Link
                  to="/become-agent"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Become an Agent
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/popia" className="text-gray-400 hover:text-white text-sm">
                  POPIA Compliance
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>066 426 8711</li>
              <li>02 Taylor Street</li>
              <li>La Colline, Stellenbosch</li>
              <li>7600</li>
            </ul>
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
