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
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Fleet Asset Registry ({vehicles.length})</h3>
            <p className="text-xs text-slate-400 font-medium">Multi-OEM vehicles with live telemetry health diagnostics</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <input
            type="text"
            placeholder="Search ID, VIN, Model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-xs w-44 font-mono"
          />

          <select
            value={makeFilter}
            onChange={(e) => setMakeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-medium focus:outline-none focus:border-blue-500"
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
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-100 max-h-[500px] overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold sticky top-0 z-10 border-b border-slate-100">
            <tr>
              <th className="py-3 px-3.5">Vehicle ID</th>
              <th className="py-3 px-3.5">Vehicle Spec</th>
              <th className="py-3 px-3.5">Synthetic VIN</th>
              <th className="py-3 px-3.5">Status</th>
              <th className="py-3 px-3.5">Battery</th>
              <th className="py-3 px-3.5">Oil Life</th>
              <th className="py-3 px-3.5">Tire Press</th>
              <th className="py-3 px-3.5 text-right">Mileage</th>
              <th className="py-3 px-3.5 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {loading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400 font-sans text-xs">
                  Loading fleet asset inventory...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400 font-sans text-xs">
                  No vehicles match the selected criteria.
                </td>
              </tr>
            ) : (
              filtered.map((v) => (
                <tr
                  key={v.id}
                  onClick={() => setSelectedVehicleId(v.id)}
                  className="hover:bg-slate-50/80 transition cursor-pointer group"
                >
                  <td className="py-3 px-3.5 font-bold font-mono text-slate-900 group-hover:text-blue-600 transition">
                    {v.id}
                  </td>
                  <td className="py-3 px-3.5 font-medium text-slate-800">
                    <span className="font-semibold">{v.make}</span> {v.model} ({v.year})
                  </td>
                  <td className="py-3 px-3.5 text-slate-400 text-[11px] truncate max-w-xs font-mono">
                    {v.vin}
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        v.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : v.status === 'MAINTENANCE'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 font-mono">
                    <span
                      className={`font-bold ${
                        v.batteryHealthPct >= 80 ? 'text-emerald-600' : v.batteryHealthPct >= 70 ? 'text-amber-600' : 'text-rose-600'
                      }`}
                    >
                      {v.batteryHealthPct}%
                    </span>
                  </td>
                  <td className="py-3 px-3.5 font-mono">
                    <span
                      className={`font-bold ${
                        v.oilLifePct >= 20 ? 'text-emerald-600' : v.oilLifePct >= 10 ? 'text-amber-600' : 'text-rose-600'
                      }`}
                    >
                      {v.fuelType === 'ELECTRIC' ? 'N/A' : `${v.oilLifePct}%`}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 font-mono">
                    <span
                      className={`font-bold ${
                        v.tirePressurePsi >= 30 ? 'text-emerald-600' : v.tirePressurePsi >= 28 ? 'text-amber-600' : 'text-rose-600'
                      }`}
                    >
                      {v.tirePressurePsi} PSI
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-right text-slate-800 font-bold font-mono">
                    {v.mileageKm.toLocaleString()} km
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    <span className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 inline-flex items-center transition">
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
