import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Car, Users, Building2, CheckCircle, TrendingUp, Shield, Zap } from 'lucide-react';
const heroCar = '/image.png';

const Home = () => {
  const [displayedStats, setDisplayedStats] = useState({ deals: 0, dealerships: 0, agents: 0, buyers: 0 });
  const statsRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  const carBrands = ['Toyota', 'Volkswagen', 'Ford', 'BMW', 'Mercedes-Benz', 'Hyundai', 'Kia', 'Nissan', 'Audi', 'Honda', 'Mazda', 'Isuzu', 'Haval', 'Suzuki', 'Chevrolet', 'Jeep'];

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated) {
        setHasAnimated(true);
        const targets = { deals: 350, dealerships: 50, agents: 120, buyers: 2500 };
        const duration = 2000;
        const steps = 60;
        let step = 0;
        const interval = setInterval(() => {
          step++;
          const progress = Math.min(step / steps, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          setDisplayedStats({
            deals: Math.floor(targets.deals * ease),
            dealerships: Math.floor(targets.dealerships * ease),
            agents: Math.floor(targets.agents * ease),
            buyers: Math.floor(targets.buyers * ease),
          });
          if (step >= steps) clearInterval(interval);
        }, duration / steps);
      }
    }, { threshold: 0.1 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative min-h-screen bg-gray-950 flex items-center overflow-hidden">
        {/* Background subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-24 lg:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen lg:min-h-0 lg:py-28">
            {/* Text */}
            <div>
              <p className="text-brand-400 uppercase text-xs font-bold tracking-[0.2em] mb-6">
                South Africa's Car Matchmaking Service
              </p>
              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black text-white mb-3 leading-[1.05]">
                We find<br />the deal.
              </h1>
              <p className="text-5xl sm:text-6xl xl:text-7xl font-black text-brand-400 mb-8 leading-[1.05]">
                You drive<br />the car.
              </p>
              <p className="text-lg text-gray-400 mb-10 max-w-lg leading-relaxed">
                Tell us what you're looking for. We handle everything — paperwork, dealership, approval. You just show up and drive.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/buyers"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-500 text-white font-semibold rounded-full hover:bg-brand-600 transition-all duration-200 hover:shadow-lg hover:shadow-brand-500/25"
                >
                  Find My Car <ArrowRight size={20} />
                </Link>
                <Link
                  to="/dealerships"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/8 backdrop-blur-sm text-white font-semibold rounded-full border border-white/20 hover:bg-white/15 transition-all duration-200"
                >
                  Partner With Us
                </Link>
              </div>
            </div>

            {/* Car image — tinted red */}
            <div className="relative flex items-center justify-center lg:justify-end">
              <div className="relative w-full max-w-xl">
                {/* Glow behind car */}
                <div className="absolute inset-0 bg-red-600/20 rounded-3xl blur-2xl scale-110 pointer-events-none" />
                {/* Image + red color blend */}
                <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={heroCar}
                    alt="Red Mercedes-AMG"
                    className="w-full object-cover block"
                  />
                  <div className="absolute inset-0 bg-red-600 mix-blend-color opacity-90 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="py-16 bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: displayedStats.deals, label: 'Deals Closed', suffix: '+' },
              { value: displayedStats.dealerships, label: 'Partner Dealerships', suffix: '+' },
              { value: displayedStats.agents, label: 'Active Agents', suffix: '+' },
              { value: displayedStats.buyers, label: 'Happy Buyers', suffix: '+' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl sm:text-5xl font-bold text-brand-400 mb-2">
                  {stat.value.toLocaleString()}{stat.suffix}
                </p>
                <p className="text-gray-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Car Brands Ticker */}
      <section className="py-8 bg-gray-900 overflow-hidden border-t border-b border-gray-800">
        <div className="relative flex overflow-hidden">
          <div className="flex gap-12 animate-scroll whitespace-nowrap">
            {[...carBrands, ...carBrands, ...carBrands].map((brand, i) => (
              <span key={i} className="text-sm font-semibold text-gray-500 flex-shrink-0 uppercase tracking-widest">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-brand-500 uppercase text-sm font-semibold tracking-widest mb-3">Simple Process</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">From enquiry to driving away in your new car in just 3 easy steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Tell Us', desc: 'Share your car preferences, budget, and financial situation in just a few minutes.', icon: Car },
              { step: '02', title: 'We Match You', desc: 'We match you with cars and dealerships that perfectly fit your needs and budget.', icon: Users },
              { step: '03', title: 'Drive Away', desc: 'Our agents guide you through approval and you drive away in your new car.', icon: CheckCircle },
            ].map((item, i) => (
              <div key={i} className="text-center relative group">
                <div className="w-20 h-20 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-105 transition-transform">
                  <item.icon className="w-9 h-9 text-white" />
                </div>
                <div className="text-xs font-bold text-brand-400 tracking-widest uppercase mb-2">{item.step}</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-24 bg-gray-950 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-brand-400 uppercase text-sm font-semibold tracking-widest mb-3">Our Story</p>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Making Car Ownership Accessible to Every South African
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                Drive Agency was founded with a single mission: to remove the barriers between South Africans and their dream cars. We saw how the traditional car-buying process was frustrating, opaque, and stressful — so we built something better.
              </p>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                Today, we connect thousands of buyers with trusted dealerships and professional agents who guide every step of the journey. Our matchmaking service is completely free for buyers.
              </p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: Shield, label: 'POPIA Compliant', desc: 'Your data is protected' },
                  { icon: Zap, label: '24hr Turnaround', desc: 'Fast processing' },
                  { icon: TrendingUp, label: 'Best Rates', desc: 'Competitive finance deals' },
                  { icon: Users, label: 'Expert Agents', desc: 'Nationwide support' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-brand-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{item.label}</p>
                      <p className="text-gray-500 text-xs">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Drive Agency"
                className="rounded-2xl w-full object-cover h-96 lg:h-[500px]"
              />
              <div className="absolute -bottom-6 -left-6 bg-brand-500 rounded-2xl p-5 shadow-xl">
                <p className="text-3xl font-bold text-white">350+</p>
                <p className="text-brand-100 text-sm">Deals Closed This Year</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Serve */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-brand-500 uppercase text-sm font-semibold tracking-widest mb-3">For Everyone</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Who We Serve</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Whether you're a buyer, dealership, or looking for a career in car finance</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Car,
                title: 'Car Buyers',
                desc: "Find your perfect car with financing that works for your budget. It's 100% free — we never charge buyers.",
                cta: 'Find My Car',
                link: '/buyers',
                accent: 'bg-brand-500',
              },
              {
                icon: Building2,
                title: 'Dealerships',
                desc: 'Access a steady stream of qualified buyers. We do the pre-screening — you just close deals and grow.',
                cta: 'Partner With Us',
                link: '/dealerships',
                accent: 'bg-navy-500',
              },
              {
                icon: Users,
                title: 'Become an Agent',
                desc: 'Earn competitive commission and build your career in car finance. Work remote or in-office.',
                cta: 'Apply Now',
                link: '/become-agent',
                accent: 'bg-green-600',
              },
            ].map((card, i) => (
              <div key={i} className="border border-gray-100 rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300 group">
                <div className={`w-14 h-14 ${card.accent} rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform`}>
                  <card.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{card.title}</h3>
                <p className="text-gray-500 leading-relaxed mb-6">{card.desc}</p>
                <Link
                  to={card.link}
                  className="inline-flex items-center gap-2 font-semibold text-brand-500 hover:text-brand-600 group/link"
                >
                  {card.cta}
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden bg-navy-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Find Your Perfect Car?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join thousands of South Africans who have found their ideal vehicle through Drive Agency. Free, fast, and stress-free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/buyers"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-500 text-white font-bold rounded-full hover:bg-brand-600 transition-colors"
            >
              Get Started Today <ArrowRight size={20} />
            </Link>
            <Link
              to="/become-agent"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-colors"
            >
              Join as Agent
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
