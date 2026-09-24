package com.fleetiq.dto;

public class DecisionMetricsDto {
    private long totalDecisions;
    private long ruleEngineCount;
    private long jevAiCount;
    private long hybridCount;
    private long fallbackCount;
    private double ruleEnginePct;
    private double jevAiPct;
    private double hybridPct;
    private double fallbackPct;
    private double avgConfidence;
    private long humanReviewCount;

    public DecisionMetricsDto() {}

    public DecisionMetricsDto(long totalDecisions, long ruleEngineCount, long jevAiCount,
                              long hybridCount, long fallbackCount, double ruleEnginePct,
                              double jevAiPct, double hybridPct, double fallbackPct,
                              double avgConfidence, long humanReviewCount) {
        this.totalDecisions = totalDecisions;
        this.ruleEngineCount = ruleEngineCount;
        this.jevAiCount = jevAiCount;
        this.hybridCount = hybridCount;
        this.fallbackCount = fallbackCount;
        this.ruleEnginePct = ruleEnginePct;
        this.jevAiPct = jevAiPct;
        this.hybridPct = hybridPct;
        this.fallbackPct = fallbackPct;
        this.avgConfidence = avgConfidence;
        this.humanReviewCount = humanReviewCount;
    }

    public long getTotalDecisions() { return totalDecisions; }
    public void setTotalDecisions(long totalDecisions) { this.totalDecisions = totalDecisions; }

    public long getRuleEngineCount() { return ruleEngineCount; }
    public void setRuleEngineCount(long ruleEngineCount) { this.ruleEngineCount = ruleEngineCount; }

    public long getJevAiCount() { return jevAiCount; }
    public void setJevAiCount(long jevAiCount) { this.jevAiCount = jevAiCount; }

    public long getHybridCount() { return hybridCount; }
    public void setHybridCount(long hybridCount) { this.hybridCount = hybridCount; }

    public long getFallbackCount() { return fallbackCount; }
    public void setFallbackCount(long fallbackCount) { this.fallbackCount = fallbackCount; }

    public double getRuleEnginePct() { return ruleEnginePct; }
    public void setRuleEnginePct(double ruleEnginePct) { this.ruleEnginePct = ruleEnginePct; }

    public double getJevAiPct() { return jevAiPct; }
    public void setJevAiPct(double jevAiPct) { this.jevAiPct = jevAiPct; }

    public double getHybridPct() { return hybridPct; }
    public void setHybridPct(double hybridPct) { this.hybridPct = hybridPct; }

    public double getFallbackPct() { return fallbackPct; }
    public void setFallbackPct(double fallbackPct) { this.fallbackPct = fallbackPct; }

    public double getAvgConfidence() { return avgConfidence; }
    public void setAvgConfidence(double avgConfidence) { this.avgConfidence = avgConfidence; }

    public long getHumanReviewCount() { return humanReviewCount; }
    public void setHumanReviewCount(long humanReviewCount) { this.humanReviewCount = humanReviewCount; }
}
