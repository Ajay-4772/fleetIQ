import React, { useEffect, useState } from 'react';
import { X, Car, Wrench, AlertTriangle, ShieldCheck, Activity, Battery, Gauge, Droplet } from 'lucide-react';
import { VehicleProfile } from '../../types';
import { api } from '../../services/api';

interface VehicleProfileModalProps {
  vehicleId: string | null;
  onClose: () => void;
}

export const VehicleProfileModal: React.FC<VehicleProfileModalProps> = ({ vehicleId, onClose }) => {
  const [profile, setProfile] = useState<VehicleProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vehicleId) return;
    setLoading(true);
    api
      .getVehicleProfile(vehicleId)
      .then((data) => {
        setProfile(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load vehicle profile');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [vehicleId]);

  if (!vehicleId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 font-mono">{vehicleId}</h3>
                {profile && (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      profile.vehicle.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : profile.vehicle.status === 'MAINTENANCE'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {profile.vehicle.status}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {profile ? `${profile.vehicle.year} ${profile.vehicle.make} ${profile.vehicle.model}` : 'Loading vehicle profile...'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading && (
            <div className="py-20 text-center text-slate-400 text-xs animate-pulse">
              Retrieving vehicle telemetry profile, fault history, and decisions...
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          {profile && !loading && (
            <>
              {/* Asset Identifiers Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Synthetic VIN</span>
                  <span className="font-mono text-slate-800 font-semibold">{profile.vehicle.vin}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Registration</span>
                  <span className="font-mono text-slate-800 font-semibold">{profile.vehicle.registrationNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Fuel & Powertrain</span>
                  <span className="font-sans text-slate-800 font-semibold">{profile.vehicle.fuelType} ({profile.vehicle.vehicleType})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Odometer Reading</span>
                  <span className="font-mono text-slate-800 font-bold">{profile.vehicle.mileageKm.toLocaleString()} km</span>
                </div>
              </div>

              {/* Real-time Health Telemetry Gauges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Battery Health */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mb-1">
                      <Battery className="w-4 h-4 text-blue-600" /> Battery Health
                    </span>
                    <span className={`text-2xl font-extrabold font-mono ${
                      profile.vehicle.batteryHealthPct >= 80 ? 'text-emerald-600' : profile.vehicle.batteryHealthPct >= 70 ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {profile.vehicle.batteryHealthPct}%
                    </span>
                  </div>
                  <div className="text-right text-[11px] text-slate-400 font-medium">
                    Target: &gt;75%
                  </div>
                </div>

                {/* Oil Life */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mb-1">
                      <Droplet className="w-4 h-4 text-amber-500" /> Engine Oil Life
                    </span>
                    <span className={`text-2xl font-extrabold font-mono ${
                      profile.vehicle.oilLifePct >= 20 ? 'text-emerald-600' : profile.vehicle.oilLifePct >= 10 ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {profile.vehicle.oilLifePct}%
                    </span>
                  </div>
                  <div className="text-right text-[11px] text-slate-400 font-medium">
                    Target: &gt;15%
                  </div>
                </div>

                {/* Tire Pressure */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mb-1">
                      <Gauge className="w-4 h-4 text-indigo-600" /> Tire Pressure
                    </span>
                    <span className={`text-2xl font-extrabold font-mono ${
                      profile.vehicle.tirePressurePsi >= 30 ? 'text-emerald-600' : profile.vehicle.tirePressurePsi >= 28 ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {profile.vehicle.tirePressurePsi} PSI
                    </span>
                  </div>
                  <div className="text-right text-[11px] text-slate-400 font-medium">
                    Target: 32 PSI
                  </div>
                </div>
              </div>

              {/* Active Actions */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Operational Directives</h4>
                {profile.activeActions.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl border border-slate-100 font-medium">
                    No open actions for this vehicle. All systems nominal.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {profile.activeActions.map((act) => (
                      <div key={act.actionId} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              {act.priority}
                            </span>
                            <span className="font-bold text-slate-900">{act.issue}</span>
                          </div>
                          <p className="text-slate-500 text-[11px] mt-1 font-medium">{act.recommendedAction}</p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white border border-slate-200 text-slate-700">
                          {act.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Normalized Telemetry Events */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Recent Telemetry & DTC History</h4>
                <div className="overflow-x-auto rounded-xl border border-slate-100 max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold sticky top-0 border-b border-slate-100">
                      <tr>
                        <th className="p-2.5">Event ID</th>
                        <th className="p-2.5">Type</th>
                        <th className="p-2.5">DTC Code</th>
                        <th className="p-2.5">Severity</th>
                        <th className="p-2.5">Idle (min)</th>
                        <th className="p-2.5">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {profile.recentEvents.map((evt) => (
                        <tr key={evt.eventId} className="hover:bg-slate-50/70">
                          <td className="p-2.5 text-slate-500">{evt.eventId}</td>
                          <td className="p-2.5 font-sans font-medium text-slate-800">{evt.eventType}</td>
                          <td className="p-2.5 text-amber-600 font-bold">{evt.faultCode || '—'}</td>
                          <td className="p-2.5 text-slate-700">{evt.severity}</td>
                          <td className="p-2.5 text-slate-700">{evt.idleMinutes ?? 0}m</td>
                          <td className="p-2.5 text-slate-400">{evt.timestamp.substring(0, 19).replace('T', ' ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
