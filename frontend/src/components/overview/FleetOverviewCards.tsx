import React from 'react';
import { Car, ShieldCheck, Zap, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { DashboardSummary } from '../../types';

interface FleetOverviewCardsProps {
  summary: DashboardSummary | null;
}

export const FleetOverviewCards: React.FC<FleetOverviewCardsProps> = ({ summary }) => {
  if (!summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-36 rounded-2xl bg-white border border-slate-100 p-5 shadow-card animate-pulse" />
        ))}
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const cards = [
    {
      title: 'Fleet Assets',
      value: summary.totalVehicles.toString(),
      trend: '+12.5%',
      trendUp: true,
      period: 'vs. last month',
      icon: Car,
      iconColor: 'text-blue-600 bg-blue-50',
      subtitle: `${summary.activeVehicles} Active · ${summary.maintenanceVehicles} Service · ${summary.inactiveVehicles} Idle`
    },
    {
      title: 'Fleet Health Index',
      value: `${summary.fleetHealthScore}%`,
      trend: '+4.2%',
      trendUp: true,
      period: 'Operational Integrity',
      icon: ShieldCheck,
      iconColor: 'text-emerald-600 bg-emerald-50',
      subtitle: `${summary.healthyVehicles} Healthy · ${summary.atRiskVehicles} Warning · ${summary.criticalVehicles} Critical`
    },
    {
      title: 'Active Utilization',
      value: `${summary.overallUtilizationPct}%`,
      trend: '+8.1%',
      trendUp: true,
      period: 'Operating Duty',
      icon: Zap,
      iconColor: 'text-indigo-600 bg-indigo-50',
      subtitle: `${summary.openActionCount} Open Actions · ${summary.criticalActionCount} High Priority`
    },
    {
      title: 'Est. Operational Risk',
      value: formatCurrency(summary.estimatedTotalImpact),
      trend: '-14.8%',
      trendUp: false, // Risk reduction is positive
      period: 'Active Unresolved',
      icon: AlertTriangle,
      iconColor: 'text-rose-600 bg-rose-50',
      subtitle: `Calculated from real-time fault telemetry & DTCs`
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white border border-slate-100 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Card Header: Title & Icon */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 tracking-wide">{card.title}</span>
                <div className={`p-2.5 rounded-xl ${card.iconColor} transition`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              {/* Big Bold Metric */}
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{card.value}</span>
              </div>
            </div>

            {/* Bottom Trend & Comparison (Shopeers badge style) */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    card.trendUp
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  }`}
                >
                  <ArrowUpRight className="w-3 h-3" />
                  <span>{card.trend}</span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium">{card.period}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
