import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquare, Car, CircleCheck as CheckCircle } from 'lucide-react';

const Home = () => {
  const [displayedStats, setDisplayedStats] = useState({
    deals: 0,
    dealerships: 0,
    agents: 0,
  });
  const [testimonialsIndex, setTestimonialsIndex] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  const testimonials = [
    {
      text: "Drive Agency found me the perfect car at a rate I could actually afford. The process was seamless.",
      author: "Thabo M.",
      role: "Buyer, Johannesburg",
    },
    {
      text: "As a dealership, this platform has given us access to serious buyers. The quality of leads is exceptional.",
      author: "Naledi S.",
      role: "Sales Manager, Cape Town",
    },
    {
      text: "Working as an agent with Drive Agency has been incredibly rewarding. The support and commission structure are fantastic.",
      author: "James K.",
      role: "Agent, Durban",
    },
  ];

  const carBrands = [
    'Toyota',
    'Volkswagen',
    'Ford',
    'BMW',
    'Mercedes-Benz',
    'Hyundai',
    'Kia',
    'Nissan',
    'Chevrolet',
    'Audi',
    'Honda',
    'Mazda',
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateCountUp();
        }
      },
      { threshold: 0.1 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const animateCountUp = () => {
    const targets = { deals: 200, dealerships: 35, agents: 50 };
    const duration = 2000;
    const steps = 60;
    const increment = {
      deals: targets.deals / steps,
      dealerships: targets.dealerships / steps,
      agents: targets.agents / steps,
    };

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setDisplayedStats({
        deals: Math.min(
          Math.floor(increment.deals * currentStep),
          targets.deals
        ),
        dealerships: Math.min(
          Math.floor(increment.dealerships * currentStep),
          targets.dealerships
        ),
        agents: Math.min(
          Math.floor(increment.agents * currentStep),
          targets.agents
        ),
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setDisplayedStats(targets);
      }
    }, duration / steps);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialsIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="w-full">
      <section
        className="relative h-screen flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.pexels.com/photos/919073/pexels-photo-919073.jpeg?auto=compress&cs=tinysrgb&w=1600)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <p className="text-brand-400 uppercase text-sm font-semibold tracking-widest mb-6">
            South Africa's Car Matchmaking Service
          </p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            We find the deal.
          </h1>
          <p className="text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-400 mb-12">
            You drive the car.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/buyers"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-400 text-white font-semibold rounded-full hover:bg-brand-500 transition-colors"
            >
              Find My Car <ArrowRight size={20} />
            </Link>
            <button className="px-8 py-4 bg-white bg-opacity-10 backdrop-blur-md text-white font-semibold rounded-full hover:bg-opacity-20 transition-colors border border-white border-opacity-20">
              Partner With Us
            </button>
          </div>
        </div>
      </section>

      <section ref={statsRef} className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-5xl font-bold text-brand-500 mb-2">
                {displayedStats.deals}+
              </p>
              <p className="text-gray-700 font-medium">Deals Closed</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold text-brand-500 mb-2">
                {displayedStats.dealerships}+
              </p>
              <p className="text-gray-700 font-medium">Partner Dealerships</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold text-brand-500 mb-2">
                {displayedStats.agents}+
              </p>
              <p className="text-gray-700 font-medium">Agents Nationwide</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold text-brand-500 mb-2">100%</p>
              <p className="text-gray-700 font-medium">Free for Buyers</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center text-gray-900">
            Trusted by Leading Car Brands
          </h2>
          <div className="relative">
            <div className="flex gap-8 animate-scroll whitespace-nowrap">
              {[...carBrands, ...carBrands].map((brand, index) => (
                <span
                  key={index}
                  className="text-xl font-semibold text-gray-600 flex-shrink-0"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="w-12 h-12 bg-brand-400 rounded-full flex items-center justify-center text-white font-bold text-lg mb-6">
                1
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Tell Us</h3>
              <p className="text-gray-600 leading-relaxed">
                Share your car preferences, budget, and financial situation with
                us in just a few minutes.
              </p>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="w-12 h-12 bg-brand-400 rounded-full flex items-center justify-center text-white font-bold text-lg mb-6">
                2
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Choose Car
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We match you with cars that fit your needs from our network of
                trusted dealerships.
              </p>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="w-12 h-12 bg-brand-400 rounded-full flex items-center justify-center text-white font-bold text-lg mb-6">
                3
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Get Approved
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Our agents guide you through approval and you drive away in
                your new car.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-navy-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-12 text-center">
            About Drive Agency
          </h2>
          <p className="text-lg text-gray-200 leading-relaxed mb-6">
            Drive Agency is South Africa's premier car finance matchmaking
            service. We connect buyers with dealerships and agents to make car
            ownership accessible and affordable for everyone.
          </p>
          <p className="text-lg text-gray-200 leading-relaxed">
            Our mission is to simplify the car-buying process by removing
            obstacles, providing transparency, and ensuring every person finds
            the right car at the right rate.
          </p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
            Who We Serve
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-sm border-t-4 border-brand-400">
              <Car className="w-12 h-12 text-brand-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Car Buyers
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Find your perfect car with financing that works for your budget.
                It's 100% free for buyers.
              </p>
              <Link
                to="/buyers"
                className="text-brand-500 font-semibold hover:text-brand-600"
              >
                Learn more →
              </Link>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-sm border-t-4 border-brand-400">
              <MessageSquare className="w-12 h-12 text-brand-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Dealerships
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Access a steady stream of qualified buyers ready to purchase.
                Grow your dealership with us.
              </p>
              <Link
                to="/dealerships"
                className="text-brand-500 font-semibold hover:text-brand-600"
              >
                Learn more →
              </Link>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-sm border-t-4 border-brand-400">
              <CheckCircle className="w-12 h-12 text-brand-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Agents
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Earn competitive commission and build your career in car finance.
                Work remote or in-office.
              </p>
              <Link
                to="/become-agent"
                className="text-brand-500 font-semibold hover:text-brand-600"
              >
                Learn more →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
            What Our Users Say
          </h2>
          <div className="bg-brand-50 rounded-lg p-12 text-center">
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              "{testimonials[testimonialsIndex].text}"
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {testimonials[testimonialsIndex].author}
            </p>
            <p className="text-gray-600">
              {testimonials[testimonialsIndex].role}
            </p>
            <div className="flex gap-2 justify-center mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setTestimonialsIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === testimonialsIndex
                      ? 'bg-brand-400'
                      : 'bg-gray-300'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className="relative py-20 bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.pexels.com/photos/3803517/pexels-photo-3803517.jpeg?auto=compress&cs=tinysrgb&w=1600)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-8">
            Ready to Find Your Perfect Car?
          </h2>
          <p className="text-xl text-gray-200 mb-12">
            Join thousands of South Africans who have found their ideal vehicle
            through Drive Agency.
          </p>
          <Link
            to="/buyers"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-400 text-white font-semibold rounded-full hover:bg-brand-500 transition-colors"
          >
            Get Started Today <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
