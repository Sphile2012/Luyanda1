import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Vehicle, Dealership } from '../../lib/supabase';
import { Car, MapPin, Search, Filter, Building, ArrowRight } from 'lucide-react';

const Cars = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [provinceFilter, setProvinceFilter] = useState('all');
  const [selected, setSelected] = useState<Vehicle | null>(null);

  useEffect(() => {
    const load = async () => {
      const [{ data: v }, { data: d }] = await Promise.all([
        supabase.from('vehicles').select('*').eq('is_active', true).order('created_at', { ascending: false }),
        supabase.from('dealerships').select('*').eq('is_active', true),
      ]);
      if (v) setVehicles(v as Vehicle[]);
      if (d) setDealerships(d as Dealership[]);
      setLoading(false);
    };
    load();
  }, []);

  const provinces = [...new Set(vehicles.map(v => v.province).filter(Boolean))].sort();

  const filtered = vehicles.filter(v => {
    const matchesSearch =
      v.brand?.toLowerCase().includes(search.toLowerCase()) ||
      v.model?.toLowerCase().includes(search.toLowerCase()) ||
      v.province?.toLowerCase().includes(search.toLowerCase()) ||
      v.body_type?.toLowerCase().includes(search.toLowerCase());
    const matchesCondition = conditionFilter === 'all' || v.condition === conditionFilter;
    const matchesProvince = provinceFilter === 'all' || v.province === provinceFilter;
    return matchesSearch && matchesCondition && matchesProvince;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gray-950 py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-brand-400 mb-4 block">Available Now</span>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-5 leading-tight">
            Browse Our Cars
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            View all available vehicles in our network. Find one you like and we'll handle everything — financing, paperwork, and delivery.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by brand, model or province…"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={conditionFilter}
              onChange={e => setConditionFilter(e.target.value)}
              className="py-2.5 pl-3 pr-8 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="all">All Conditions</option>
              <option value="new">New</option>
              <option value="used">Used</option>
            </select>
          </div>
          <select
            value={provinceFilter}
            onChange={e => setProvinceFilter(e.target.value)}
            className="py-2.5 pl-3 pr-8 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="all">All Provinces</option>
            {provinces.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <span className="text-sm text-gray-500 ml-auto">
            {filtered.length} vehicle{filtered.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No vehicles found</h3>
            <p className="text-gray-400">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(vehicle => {
              const dealership = dealerships.find(d => d.id === vehicle.dealership_id);
              return (
                <div
                  key={vehicle.id}
                  onClick={() => setSelected(vehicle)}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                >
                  <div className="relative h-44 bg-gray-100 overflow-hidden">
                    {vehicle.photos?.[0] ? (
                      <img src={vehicle.photos[0]} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="w-14 h-14 text-gray-300" />
                      </div>
                    )}
                    <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${vehicle.condition === 'new' ? 'bg-blue-600 text-white' : 'bg-orange-500 text-white'}`}>
                      {vehicle.condition}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{vehicle.brand} {vehicle.model}</h3>
                    <p className="text-sm text-gray-500 mt-1">{vehicle.year} &middot; {vehicle.body_type} &middot; {vehicle.colour}</p>
                    {vehicle.mileage > 0 && <p className="text-sm text-gray-400 mt-0.5">{vehicle.mileage.toLocaleString()} km</p>}
                    <div className="flex items-center gap-1 mt-2 text-gray-500 text-sm">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{vehicle.province}</span>
                    </div>
                    {dealership && (
                      <div className="flex items-center gap-1 mt-1 text-gray-400 text-xs">
                        <Building className="w-3 h-3" />
                        <span>{dealership.name}</span>
                      </div>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-xl font-extrabold text-brand-600">R {vehicle.price.toLocaleString('en-ZA')}</p>
                      <span className="text-xs font-semibold text-brand-500 group-hover:text-brand-700">View →</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-gray-950 py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Found something you like?</h2>
          <p className="text-gray-400 mb-8">Tell us which car interests you and we'll handle all the paperwork and financing. Free for buyers — always.</p>
          <Link to="/buyers" className="inline-flex items-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-full transition-all hover:scale-105">
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Vehicle detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="relative h-64 bg-gray-100">
              {selected.photos?.[0] ? (
                <img src={selected.photos[0]} alt={`${selected.brand} ${selected.model}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Car className="w-16 h-16 text-gray-300" />
                </div>
              )}
              <button onClick={() => setSelected(null)} className="absolute top-4 right-4 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center text-sm transition-colors">
                ✕
              </button>
              <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase ${selected.condition === 'new' ? 'bg-blue-600 text-white' : 'bg-orange-500 text-white'}`}>
                {selected.condition}
              </span>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-extrabold text-gray-900">{selected.brand} {selected.model}</h2>
              <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                {[
                  ['Year', selected.year],
                  ['Body Type', selected.body_type],
                  ['Colour', selected.colour],
                  ['Mileage', selected.mileage > 0 ? `${selected.mileage.toLocaleString()} km` : 'New'],
                  ['Condition', selected.condition],
                  ['Province', selected.province],
                ].map(([label, val]) => (
                  <div key={label as string} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-400 text-xs uppercase font-semibold">{label}</p>
                    <p className="text-gray-900 font-medium mt-0.5">{val}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-6">
                <p className="text-3xl font-extrabold text-brand-600">R {selected.price.toLocaleString('en-ZA')}</p>
                <Link
                  to="/buyers"
                  onClick={() => setSelected(null)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-full transition-colors"
                >
                  Inquire About This Car <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cars;
