import { Car } from 'lucide-react';

const Cars = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gray-950 py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-brand-400 mb-4 block">Our Fleet</span>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-5 leading-tight">
            Browse Our Cars
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Find a vehicle that suits your lifestyle and budget. We handle financing, paperwork, and delivery.
          </p>
        </div>
      </section>

      {/* Empty state */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center">
          <Car className="w-20 h-20 text-gray-200 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-700 mb-3">Listings Coming Soon</h3>
          <p className="text-gray-400 max-w-sm mx-auto">
            We are currently adding vehicles to our inventory. Check back soon for available cars.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Cars;
