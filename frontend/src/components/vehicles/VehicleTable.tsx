import React, { useState, useEffect } from 'react';
import { Car, Search, Filter, ShieldCheck, AlertCircle, Wrench, ChevronRight, Download } from 'lucide-react';
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

  // Dynamically derive available OEM makes from dataset
  const availableMakes = Array.from(new Set(vehicles.map((v) => v.make))).filter(Boolean).sort();

  const filtered = vehicles.filter((v) => {
    if (makeFilter !== 'ALL' && v.make && v.make.toLowerCase() !== makeFilter.toLowerCase()) return false;
    if (statusFilter !== 'ALL' && v.status && v.status.toUpperCase() !== statusFilter.toUpperCase()) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchId = v.id && v.id.toLowerCase().includes(q);
      const matchVin = v.vin && v.vin.toLowerCase().includes(q);
      const matchModel = v.model && v.model.toLowerCase().includes(q);
      const matchMake = v.make && v.make.toLowerCase().includes(q);
      const matchReg = v.registrationNumber && v.registrationNumber.toLowerCase().includes(q);
      if (!matchId && !matchVin && !matchModel && !matchMake && !matchReg) return false;
    }
    return true;
  });

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-2xs space-y-4 font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
            <Car className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Fleet Asset Registry ({vehicles.length})</h3>
            <p className="text-xs text-slate-400 font-medium">Multi-OEM vehicles with live telemetry health diagnostics</p>
          </div>
        </div>

        {/* Filters & Export */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="relative">
            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search ID, VIN, Model, Make..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-7 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-xs w-48 font-sans"
            />
          </div>

          {/* Data-Driven OEM Make Dropdown */}
          <select
            value={makeFilter}
            onChange={(e) => setMakeFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Makes ({vehicles.length})</option>
            {availableMakes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>

          <button
            onClick={() => api.downloadExport('vehicles', 'csv')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 font-semibold transition"
            title="Download Vehicles CSV"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200/80 max-h-[520px] overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold sticky top-0 z-10 border-b border-slate-200/80">
            <tr>
              <th className="py-2.5 px-3">Vehicle ID</th>
              <th className="py-2.5 px-3">Vehicle Spec</th>
              <th className="py-2.5 px-3">VIN</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Battery</th>
              <th className="py-2.5 px-3">Oil Life</th>
              <th className="py-2.5 px-3">Tire Press</th>
              <th className="py-2.5 px-3 text-right">Mileage</th>
              <th className="py-2.5 px-3 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {loading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400 font-sans text-xs">
                  Loading fleet asset registry...
                </td>
              </tr>
            ) : vehicles.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center">
                  <div className="max-w-md mx-auto space-y-2">
                    <p className="text-sm font-bold text-slate-700">No vehicles have been ingested yet.</p>
                    <p className="text-xs text-slate-400">
                      Connect a real-time IoT / OEM data source or upload an Excel/CSV dataset to populate the asset registry.
                    </p>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400 font-sans text-xs">
                  No vehicles match the selected criteria. Try adjusting your filters.
                </td>
              </tr>
            ) : (
              filtered.map((v) => (
                <tr
                  key={v.id}
                  className="hover:bg-slate-50 transition group cursor-pointer"
                  onClick={() => setSelectedVehicleId(v.id)}
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 group-hover:text-blue-600 transition">
                    {v.id}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-slate-900">{v.make}</span>{' '}
                    <span className="text-slate-600 font-normal">{v.model} ({v.year})</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                    {v.vin}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        v.status?.toUpperCase() === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : v.status?.toUpperCase() === 'MAINTENANCE'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    <span
                      className={`font-bold ${
                        v.batteryHealthPct < 80
                          ? 'text-rose-600'
                          : v.batteryHealthPct < 90
                          ? 'text-amber-600'
                          : 'text-slate-700'
                      }`}
                    >
                      {Math.round(v.batteryHealthPct)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700 font-medium">
                    {Math.round(v.oilLifePct)}%
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700 font-medium">
                    {Math.round(v.tirePressurePsi)} psi
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                    {v.mileageKm.toLocaleString()} km
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="inline-flex items-center text-blue-600 group-hover:translate-x-0.5 transition font-semibold text-xs">
                      Inspect <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Global Vehicle Profile Modal */}
      {selectedVehicleId && (
        <VehicleProfileModal
          vehicleId={selectedVehicleId}
          onClose={() => setSelectedVehicleId(null)}
        />
      )}
    </div>
  );
};
