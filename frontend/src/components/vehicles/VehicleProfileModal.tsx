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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-950 text-sky-400 border border-sky-800/60">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono">{vehicleId}</h3>
                {profile && (
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      profile.vehicle.status === 'ACTIVE'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : profile.vehicle.status === 'MAINTENANCE'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {profile.vehicle.status}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {profile ? `${profile.vehicle.year} ${profile.vehicle.make} ${profile.vehicle.model}` : 'Loading vehicle profile...'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
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
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
              {error}
            </div>
          )}

          {profile && !loading && (
            <>
              {/* Asset Identifiers Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Synthetic VIN</span>
                  <span className="font-mono text-slate-200 font-semibold">{profile.vehicle.vin}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Registration</span>
                  <span className="font-mono text-slate-200 font-semibold">{profile.vehicle.registrationNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Fuel & Powertrain</span>
                  <span className="font-sans text-slate-200 font-semibold">{profile.vehicle.fuelType} ({profile.vehicle.vehicleType})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Odometer Reading</span>
                  <span className="font-mono text-slate-200 font-semibold">{profile.vehicle.mileageKm.toLocaleString()} km</span>
                </div>
              </div>

              {/* Real-time Health Telemetry Gauges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Battery Health */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                      <Battery className="w-4 h-4 text-sky-400" /> Battery Health
                    </span>
                    <span className={`text-2xl font-bold font-mono ${
                      profile.vehicle.batteryHealthPct >= 80 ? 'text-emerald-400' : profile.vehicle.batteryHealthPct >= 70 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {profile.vehicle.batteryHealthPct}%
                    </span>
                  </div>
                  <div className="text-right text-[11px] text-slate-500">
                    Threshold: &gt;75%
                  </div>
                </div>

                {/* Oil Life */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                      <Droplet className="w-4 h-4 text-amber-400" /> Engine Oil Life
                    </span>
                    <span className={`text-2xl font-bold font-mono ${
                      profile.vehicle.oilLifePct >= 20 ? 'text-emerald-400' : profile.vehicle.oilLifePct >= 10 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {profile.vehicle.oilLifePct}%
                    </span>
                  </div>
                  <div className="text-right text-[11px] text-slate-500">
                    Threshold: &gt;15%
                  </div>
                </div>

                {/* Tire Pressure */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                      <Gauge className="w-4 h-4 text-purple-400" /> Tire Pressure
                    </span>
                    <span className={`text-2xl font-bold font-mono ${
                      profile.vehicle.tirePressurePsi >= 30 ? 'text-emerald-400' : profile.vehicle.tirePressurePsi >= 28 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {profile.vehicle.tirePressurePsi} PSI
                    </span>
                  </div>
                  <div className="text-right text-[11px] text-slate-500">
                    Target: 32 PSI
                  </div>
                </div>
              </div>

              {/* Active Actions */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Operational Actions</h4>
                {profile.activeActions.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3 bg-slate-950/40 rounded-lg border border-slate-800">
                    No open actions for this vehicle.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {profile.activeActions.map((act) => (
                      <div key={act.actionId} className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                              {act.priority}
                            </span>
                            <span className="font-semibold text-white">{act.issue}</span>
                          </div>
                          <p className="text-slate-400 text-[11px] mt-1">{act.recommendedAction}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                          {act.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Normalized Telemetry Events */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent Telemetry & DTC History</h4>
                <div className="overflow-x-auto rounded-lg border border-slate-800 max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] sticky top-0">
                      <tr>
                        <th className="p-2">Event ID</th>
                        <th className="p-2">Type</th>
                        <th className="p-2">DTC Code</th>
                        <th className="p-2">Severity</th>
                        <th className="p-2">Idle (min)</th>
                        <th className="p-2">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {profile.recentEvents.map((evt) => (
                        <tr key={evt.eventId} className="hover:bg-slate-800/30">
                          <td className="p-2 text-slate-400">{evt.eventId}</td>
                          <td className="p-2 font-sans font-medium text-slate-200">{evt.eventType}</td>
                          <td className="p-2 text-amber-400 font-bold">{evt.faultCode || '—'}</td>
                          <td className="p-2">{evt.severity}</td>
                          <td className="p-2">{evt.idleMinutes ?? 0}m</td>
                          <td className="p-2 text-slate-400">{evt.timestamp.substring(0, 19).replace('T', ' ')}</td>
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
