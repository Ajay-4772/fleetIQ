import React from 'react';
import { Car, ShieldCheck, Zap, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { DashboardSummary } from '../../types';

interface FleetOverviewCardsProps {
  summary: DashboardSummary | null;
  onNavigateTab?: (tab: 'vehicles' | 'actions' | 'intelligence') => void;
}

export const FleetOverviewCards: React.FC<FleetOverviewCardsProps> = ({ summary, onNavigateTab }) => {
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
    return '$' + Math.round(val).toLocaleString();
  };

  const hasData = summary.totalVehicles > 0;

  const cards = [
    {
      title: 'Fleet Assets',
      value: summary.totalVehicles.toString(),
      trend: hasData ? `${summary.totalVehicles} registered` : 'No data',
      trendUp: hasData,
      period: 'monitored vehicles',
      icon: Car,
      iconColor: 'text-blue-600 bg-blue-50',
      subtitle: hasData
        ? `${summary.activeVehicles} Active · ${summary.maintenanceVehicles} Service · ${summary.inactiveVehicles} Idle`
        : 'Connect data source to register assets',
      targetTab: 'vehicles' as const
    },
    {
      title: 'Fleet Health Index',
      value: hasData ? `${summary.fleetHealthScore}%` : 'Insufficient data',
      trend: hasData ? `${summary.healthyVehicles} healthy` : '—',
      trendUp: hasData && summary.fleetHealthScore >= 80,
      period: 'Operational Integrity',
      icon: ShieldCheck,
      iconColor: 'text-emerald-600 bg-emerald-50',
      subtitle: hasData
        ? `${summary.healthyVehicles} Healthy · ${summary.atRiskVehicles} Warning · ${summary.criticalVehicles} Critical`
        : 'Awaiting incoming vehicle telemetry',
      targetTab: 'actions' as const
    },
    {
      title: 'Active Utilization',
      value: hasData ? `${summary.overallUtilizationPct}%` : 'Insufficient data',
      trend: hasData ? `${summary.activeVehicles} in duty` : '—',
      trendUp: hasData && summary.overallUtilizationPct >= 50,
      period: 'Operating Duty',
      icon: Zap,
      iconColor: 'text-indigo-600 bg-indigo-50',
      subtitle: hasData
        ? `${summary.openActionCount} Open Actions · ${summary.criticalActionCount} High Priority`
        : '0 open operational directives',
      targetTab: 'vehicles' as const
    },
    {
      title: 'Est. Operational Risk',
      value: hasData ? formatCurrency(summary.estimatedTotalImpact) : '$0',
      trend: hasData && summary.criticalActionCount > 0 ? `${summary.criticalActionCount} critical` : 'Nominal',
      trendUp: summary.criticalActionCount === 0,
      period: 'Active Unresolved Risk',
      icon: AlertTriangle,
      iconColor: 'text-rose-600 bg-rose-50',
      subtitle: `${summary.criticalActionCount} critical action work orders open`,
      targetTab: 'actions' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            onClick={() => onNavigateTab && onNavigateTab(card.targetTab)}
            className="cursor-pointer bg-white border border-slate-100 hover:border-blue-200 rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 tracking-wide group-hover:text-blue-600 transition">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-xl ${card.iconColor} group-hover:scale-105 transition`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              {/* Metric Value */}
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{card.value}</span>
              </div>
            </div>

            {/* Bottom Trend & Subtitle */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
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
