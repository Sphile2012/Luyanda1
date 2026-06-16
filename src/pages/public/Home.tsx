import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Car, Users, Building2, CheckCircle, Shield, Zap, TrendingUp } from 'lucide-react';

const heroBg = '/image copy.png';

const stats = [
  { value: 350, label: 'Deals Closed', suffix: '+' },
  { value: 50, label: 'Partner Dealerships', suffix: '+' },
  { value: 120, label: 'Active Agents', suffix: '+' },
  { value: 2500, label: 'Happy Buyers', suffix: '+' },
];

const steps = [
  { step: '01', icon: Car, title: 'Tell Us What You Want', desc: 'Share your car preferences, budget, and financial situation in a few minutes.' },
  { step: '02', icon: Users, title: 'We Match You', desc: 'Our agents identify the best cars and dealerships that fit your exact needs.' },
  { step: '03', icon: CheckCircle, title: 'Drive Away', desc: 'We handle the paperwork and approval. You show up, sign, and drive.' },
];

const cards = [
  {
    icon: Car,
    title: 'Car Buyers',
    desc: "Find your perfect vehicle with financing that fits your budget. Our service is 100% free for buyers — always.",
    cta: 'Find My Car',
    link: '/buyers',
  },
  {
    icon: Building2,
    title: 'Dealerships',
    desc: 'Receive a steady stream of pre-screened, qualified buyers. You focus on closing — we handle the match.',
    cta: 'Partner With Us',
    link: '/dealerships',
  },
  {
    icon: Users,
    title: 'Become an Agent',
    desc: 'Build a rewarding career in vehicle finance. Earn competitive commission with full training and support.',
    cta: 'Apply Now',
    link: '/become-agent',
  },
];

const trust = [
  { icon: Shield, label: 'POPIA Compliant', desc: 'Your data is always protected' },
  { icon: Zap, label: '24hr Turnaround', desc: 'Fast, efficient processing' },
  { icon: TrendingUp, label: 'Best Finance Rates', desc: 'Competitive deals nationwide' },
  { icon: Users, label: 'Expert Agents', desc: 'Nationwide professional support' },
];

const brands = ['Toyota', 'Volkswagen', 'Ford', 'BMW', 'Mercedes-Benz', 'Hyundai', 'Kia', 'Nissan', 'Audi', 'Honda', 'Mazda', 'Isuzu', 'Haval', 'Suzuki', 'Chevrolet', 'Jeep'];

const Home = () => {
  const [displayedStats, setDisplayedStats] = useState({ deals: 0, dealerships: 0, agents: 0, buyers: 0 });
  const statsRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

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
          const ease = 1 - Math.pow(1 - Math.min(step / steps, 1), 3);
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

  const statValues = [displayedStats.deals, displayedStats.dealerships, displayedStats.agents, displayedStats.buyers];

  return (
    <div className="w-full font-sans">

      {/* ── Hero ── */}
      <section
        className="relative min-h-screen"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* ── Stats bar ── */}
      <section ref={statsRef} className="bg-[#0d1118] border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-20 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {stats.map((s, i) => (
              <div key={i} className="text-center px-6 first:pl-0 last:pr-0">
                <p className="text-4xl font-extrabold text-white mb-1 tabular-nums">
                  {statValues[i].toLocaleString()}{s.suffix}
                </p>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Brand ticker ── */}
      <section className="bg-[#0a0c12] border-y border-white/5 py-5 overflow-hidden">
        <div className="flex overflow-hidden">
          <div className="flex gap-14 animate-scroll whitespace-nowrap">
            {[...brands, ...brands, ...brands].map((b, i) => (
              <span key={i} className="text-[11px] font-bold text-gray-600 uppercase tracking-[0.18em] flex-shrink-0">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-20">
          <div className="text-center mb-16">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-brand-500 mb-3 block">Simple Process</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-[17px] leading-relaxed">
              From first enquiry to driving away — three straightforward steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map((item, i) => (
              <div key={i} className="group text-center">
                <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md group-hover:scale-105 transition-transform duration-200">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <p className="text-xs font-bold text-brand-400 tracking-widest uppercase mb-2">{item.step}</p>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed text-[15px]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section className="bg-gray-950 py-24">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            <div>
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-brand-400 mb-4 block">Our Story</span>
              <h2 className="text-4xl md:text-[2.6rem] font-extrabold text-white mb-6 leading-tight">
                Making Car Ownership Accessible to Every South African
              </h2>
              <p className="text-gray-400 text-[16px] leading-[1.8] mb-5">
                Drive Agency was founded to remove the barriers between South Africans and their dream cars. The traditional process was frustrating, opaque, and stressful — so we built something better.
              </p>
              <p className="text-gray-400 text-[16px] leading-[1.8] mb-10">
                We connect buyers with trusted dealerships and professional agents who guide every step of the journey. Our matchmaking service is completely free for buyers.
              </p>

              <div className="grid grid-cols-2 gap-5">
                {trust.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon className="w-4 h-4 text-brand-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{item.label}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Drive Agency team"
                className="rounded-2xl w-full object-cover h-[420px] lg:h-[500px]"
              />
              <div className="absolute -bottom-5 -left-5 bg-brand-500 rounded-xl p-5 shadow-2xl">
                <p className="text-3xl font-extrabold text-white leading-none">350+</p>
                <p className="text-brand-200 text-sm mt-1">Deals Closed This Year</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Who we serve ── */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-20">
          <div className="text-center mb-16">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-brand-500 mb-3 block">For Everyone</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Who We Serve</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-[17px] leading-relaxed">
              Whether you're buying, selling, or building a career in car finance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cards.map((card, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-100 p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-500 transition-colors duration-200">
                  <card.icon className="w-6 h-6 text-brand-500 group-hover:text-white transition-colors duration-200" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{card.title}</h3>
                <p className="text-gray-500 text-[15px] leading-relaxed mb-6">{card.desc}</p>
                <Link
                  to={card.link}
                  className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand-500 hover:text-brand-700 group/link"
                >
                  {card.cta}
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-navy-900 py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-400/6 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
            Ready to Find Your Perfect Car?
          </h2>
          <p className="text-gray-400 text-[17px] leading-relaxed mb-10 max-w-xl mx-auto">
            Join thousands of South Africans who found their ideal vehicle through Drive Agency. Free, fast, and stress-free.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/buyers"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 transition-colors shadow-lg shadow-brand-900/40"
            >
              Get Started Today <ArrowRight size={17} />
            </Link>
            <Link
              to="/become-agent"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-white font-semibold rounded-lg border border-white/20 hover:bg-white/8 transition-colors"
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
