import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import {
  DashboardSummary,
  FleetHealth,
  DecisionMetrics,
  DataQuality,
  ImpactMetrics,
  TrendDataPoint,
  ActionItem
} from '../types';

export function useDashboardData() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [health, setHealth] = useState<FleetHealth | null>(null);
  const [decisionMetrics, setDecisionMetrics] = useState<DecisionMetrics | null>(null);
  const [dataQuality, setDataQuality] = useState<DataQuality | null>(null);
  const [impact, setImpact] = useState<ImpactMetrics | null>(null);
  const [trends, setTrends] = useState<TrendDataPoint[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [sumRes, healthRes, decRes, dqRes, impRes, trendsRes, actionsRes] = await Promise.all([
        api.getSummary().catch(() => null),
        api.getHealth().catch(() => null),
        api.getDecisionMetrics().catch(() => null),
        api.getDataQuality().catch(() => null),
        api.getImpact().catch(() => null),
        api.getTrends('24H').catch(() => []),
        api.getActions(undefined, undefined, undefined, 0, 50).catch(() => ({ content: [], totalElements: 0 }))
      ]);

      if (sumRes) setSummary(sumRes);
      if (healthRes) setHealth(healthRes);
      if (decRes) setDecisionMetrics(decRes);
      if (dqRes) setDataQuality(dqRes);
      if (impRes) setImpact(impRes);
      if (trendsRes) setTrends(trendsRes);
      if (actionsRes && actionsRes.content) setActions(actionsRes.content);

      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    summary,
    health,
    decisionMetrics,
    dataQuality,
    impact,
    trends,
    actions,
    loading,
    error,
    refreshData: fetchAll
  };
}
