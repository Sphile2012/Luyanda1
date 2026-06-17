import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Users, Shield, Handshake } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Hero ── */}
      <section className="bg-gray-950 py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-brand-400 mb-4 block">Our Story</span>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
            We founded our business because the car-buying process in South Africa was fundamentally broken.
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-2xl">
            It wasn't just an inconvenience; the system was flawed. We set out to change that, one seamless transaction at a time.
          </p>
        </div>
      </section>

      {/* ── Story ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center">
            <div className="lg:col-span-2 space-y-6 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
              <div className="bg-gray-950 rounded-2xl p-8 text-white">
                <p className="text-5xl font-extrabold text-brand-400 leading-none">350+</p>
                <p className="text-gray-300 mt-2 font-medium">Deals facilitated since opening</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-8">
                <p className="text-5xl font-extrabold text-navy-500 leading-none">50+</p>
                <p className="text-gray-500 mt-2 font-medium">Partner dealerships nationwide</p>
              </div>
              <div className="bg-brand-500 rounded-2xl p-8">
                <p className="text-5xl font-extrabold text-white leading-none">9</p>
                <p className="text-brand-100 mt-2 font-medium">Provinces we operate in</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="bg-gray-50 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-14">What we stand for</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[
              {
                icon: Heart,
                title: 'The buyer comes first',
                desc: "We represent the buyer, not the dealership. Our agents' job is to find the right car at the right terms for the person sitting across from them — nothing else.",
              },
              {
                icon: Shield,
                title: 'No surprises',
                desc: 'Finance is already confusing enough. We explain every term, every fee, and every option in plain language. If something doesn\'t feel right, we say so.',
              },
              {
                icon: Handshake,
                title: 'Only vetted partners',
                desc: "We don't work with every dealership that calls us. The ones in our network have been assessed for reputation, pricing, and how they treat customers.",
              },
              {
                icon: Users,
                title: 'Real people, real support',
                desc: "You'll have a named agent from day one. Not a chatbot, not a call centre queue. Someone who knows your name and your situation.",
              },
            ].map((v, i) => (
              <div key={i} className="bg-white rounded-2xl p-7 shadow-sm">
                <div className="w-11 h-11 bg-brand-50 rounded-xl flex items-center justify-center mb-5">
                  <v.icon className="w-5 h-5 text-brand-500" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{v.title}</h3>
                <p className="text-gray-500 text-[15px] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team blurb ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-brand-500 mb-4 block">The People</span>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                A team that actually knows this industry
              </h2>
              <p className="text-gray-500 text-[16px] leading-[1.8] mb-5">
                Our agents come from backgrounds in banking, vehicle finance, and dealership sales. They've sat on both sides of the table. That experience is something you can't fake — it's what allows them to spot a good deal and walk away from a bad one.
              </p>
              <p className="text-gray-500 text-[16px] leading-[1.8] mb-8">
                We keep our team small on purpose. We'd rather have fewer agents doing great work than scale too fast and compromise the quality of service we've built our name on.
              </p>
              <Link
                to="/become-agent"
                className="inline-flex items-center gap-2 text-brand-500 font-semibold hover:text-brand-700 transition-colors"
              >
                Interested in joining the team? <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Drive Agency team"
                className="rounded-2xl w-full object-cover h-[380px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-navy-900 py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Ready to find your next car?
          </h2>
          <p className="text-gray-400 text-[17px] mb-10 max-w-xl mx-auto">
            The process takes less than five minutes to start. We'll handle everything after that.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/buyers"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 transition-colors"
            >
              Get Started Free <ArrowRight size={17} />
            </Link>
            <Link
              to="/dealerships"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-white font-semibold rounded-lg border border-white/20 hover:bg-white/8 transition-colors"
            >
              Partner With Us
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
