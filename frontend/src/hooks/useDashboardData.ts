import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import {
  DashboardSummary,
  FleetHealth,
  DecisionMetrics,
  DataQuality,
  ImpactMetrics,
  TrendDataPoint,
  ActionItem,
  IngestionThroughput,
  IssueDistribution,
  WeeklyUtilization,
  SafetyScore,
  StreamStatus
} from '../types';

export function useDashboardData(enabled: boolean = true) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [health, setHealth] = useState<FleetHealth | null>(null);
  const [decisionMetrics, setDecisionMetrics] = useState<DecisionMetrics | null>(null);
  const [dataQuality, setDataQuality] = useState<DataQuality | null>(null);
  const [impact, setImpact] = useState<ImpactMetrics | null>(null);
  const [trends, setTrends] = useState<TrendDataPoint[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [ingestionThroughput, setIngestionThroughput] = useState<IngestionThroughput | null>(null);
  const [issueDistribution, setIssueDistribution] = useState<IssueDistribution | null>(null);
  const [weeklyUtilization, setWeeklyUtilization] = useState<WeeklyUtilization | null>(null);
  const [safetyScore, setSafetyScore] = useState<SafetyScore | null>(null);
  const [streamStatus, setStreamStatus] = useState<StreamStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [
        sumRes,
        healthRes,
        decRes,
        dqRes,
        impRes,
        trendsRes,
        actionsRes,
        tpRes,
        issuesRes,
        utilRes,
        safetyRes,
        streamRes
      ] = await Promise.all([
        api.getSummary().catch(() => null),
        api.getHealth().catch(() => null),
        api.getDecisionMetrics().catch(() => null),
        api.getDataQuality().catch(() => null),
        api.getImpact().catch(() => null),
        api.getTrends('24H').catch(() => []),
        api.getActions(undefined, undefined, undefined, 0, 50).catch(() => ({ content: [], totalElements: 0 })),
        api.getIngestionThroughput().catch(() => null),
        api.getIssueDistribution().catch(() => null),
        api.getWeeklyUtilization().catch(() => null),
        api.getSafetyScore().catch(() => null),
        api.getStreamStatus().catch(() => null)
      ]);

      if (sumRes) setSummary(sumRes);
      if (healthRes) setHealth(healthRes);
      if (decRes) setDecisionMetrics(decRes);
      if (dqRes) setDataQuality(dqRes);
      if (impRes) setImpact(impRes);
      if (trendsRes) setTrends(trendsRes);
      if (actionsRes && actionsRes.content) setActions(actionsRes.content);
      if (tpRes) setIngestionThroughput(tpRes);
      if (issuesRes) setIssueDistribution(issuesRes);
      if (utilRes) setWeeklyUtilization(utilRes);
      if (safetyRes) setSafetyScore(safetyRes);
      if (streamRes) setStreamStatus(streamRes);

      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      fetchAll();
    }
  }, [fetchAll, enabled]);

  return {
    summary,
    health,
    decisionMetrics,
    dataQuality,
    impact,
    trends,
    actions,
    ingestionThroughput,
    issueDistribution,
    weeklyUtilization,
    safetyScore,
    streamStatus,
    loading,
    error,
    refreshData: fetchAll
  };
}
