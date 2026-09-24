import React, { useState, useEffect } from 'react';
import { Car, Search, Filter, ShieldCheck, AlertCircle, Wrench, ChevronRight } from 'lucide-react';
import { Vehicle } from '../../types';
import { api } from '../../services/api';
import { VehicleProfileModal } from './VehicleProfileModal';

export const VehicleTable: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [makeFilter, setMakeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  useEffect(() => {
    api
      .getVehicles()
      .then((data) => setVehicles(data))
      .catch((err) => console.error('Failed to load vehicles', err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = vehicles.filter((v) => {
    if (makeFilter !== 'ALL' && !v.make.toLowerCase().includes(makeFilter.toLowerCase())) return false;
    if (statusFilter !== 'ALL' && v.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        v.id.toLowerCase().includes(q) ||
        v.vin.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.registrationNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-sky-950 text-sky-400 border border-sky-800/60">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Fleet Asset Registry ({vehicles.length})</h3>
            <p className="text-xs text-slate-400">Multi-OEM vehicles with live telemetry health diagnostics</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <input
            type="text"
            placeholder="Search ID, VIN, Model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 text-xs w-44 font-mono"
          />

          <select
            value={makeFilter}
            onChange={(e) => setMakeFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Makes</option>
            <option value="TOYOTA">Toyota</option>
            <option value="FORD">Ford</option>
            <option value="BMW">BMW</option>
            <option value="TESLA">Tesla</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800 max-h-[500px] overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider font-semibold sticky top-0 z-10 border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Vehicle ID</th>
              <th className="py-2.5 px-3">Vehicle Spec</th>
              <th className="py-2.5 px-3">Synthetic VIN</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Battery</th>
              <th className="py-2.5 px-3">Oil Life</th>
              <th className="py-2.5 px-3">Tire Press</th>
              <th className="py-2.5 px-3 text-right">Mileage</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {loading ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500 font-sans text-xs">
                  Loading fleet asset inventory...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500 font-sans text-xs">
                  No vehicles match the selected criteria.
                </td>
              </tr>
            ) : (
              filtered.map((v) => (
                <tr
                  key={v.id}
                  onClick={() => setSelectedVehicleId(v.id)}
                  className="hover:bg-slate-800/40 transition cursor-pointer group"
                >
                  <td className="py-2.5 px-3 font-bold text-white group-hover:text-sky-400 transition">
                    {v.id}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-200">
                    <span className="font-semibold">{v.make}</span> {v.model} ({v.year})
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px] truncate max-w-xs">
                    {v.vin}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        v.status === 'ACTIVE'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : v.status === 'MAINTENANCE'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`font-semibold ${
                        v.batteryHealthPct >= 80 ? 'text-emerald-400' : v.batteryHealthPct >= 70 ? 'text-amber-400' : 'text-rose-400'
                      }`}
                    >
                      {v.batteryHealthPct}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`font-semibold ${
                        v.oilLifePct >= 20 ? 'text-emerald-400' : v.oilLifePct >= 10 ? 'text-amber-400' : 'text-rose-400'
                      }`}
                    >
                      {v.fuelType === 'ELECTRIC' ? 'N/A' : `${v.oilLifePct}%`}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`font-semibold ${
                        v.tirePressurePsi >= 30 ? 'text-emerald-400' : v.tirePressurePsi >= 28 ? 'text-amber-400' : 'text-rose-400'
                      }`}
                    >
                      {v.tirePressurePsi} PSI
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-200 font-semibold">
                    {v.mileageKm.toLocaleString()} km
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-sky-400 group-hover:translate-x-1 inline-flex items-center transition">
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedVehicleId && (
        <VehicleProfileModal
          vehicleId={selectedVehicleId}
          onClose={() => setSelectedVehicleId(null)}
        />
      )}
    </div>
  );
};
