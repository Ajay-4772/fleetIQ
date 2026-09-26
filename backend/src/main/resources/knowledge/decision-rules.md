# vehyron Decision & Prioritization Rules

## Hybrid Decision Architecture
vehyron employs a resilient Hybrid Decision Pattern:
1. **Jev AI Engine**: Analyzes multi-sensor telemetry, fault codes, historical mileage, and fleet context to generate probabilistic recommendations and confidence scores.
2. **Deterministic Fallback Engine**: If Jev AI fails, times out, or has no internet connection, the deterministic rule engine immediately evaluates the issue with zero latency penalty.
3. **Human Review Threshold**: Any decision with AI confidence < 0.85 or involving safety-critical systems (braking, airbag, severe misfire) is flagged with `requiresHumanReview = true`.

## Priority Classifications
- **P1 - CRITICAL**: Requires vehicle grounding or immediate 24-hour service intervention. Triggered by severe engine misfires (P0300), EV battery cell imbalance (BMS_028), CAN network loss (U0100), or oil life <= 5%.
- **P2 - HIGH**: Requires scheduled intervention within 3-7 days. Triggered by catalytic efficiency drop (P0420), wheel speed sensor fault (C0035), low charging voltage (P0562), or oil life <= 10%.
- **P3 - MEDIUM**: Routine work orders. Triggered by TPMS warnings (24-28 PSI) or excessive idling (> 45 minutes).
- **P4 - LOW**: Informational / asset rebalancing. Triggered by low fleet utilization (< 0.6 hours/day).

## Operational Cost Impact Calculation
Financial risk is calculated dynamically:
- Critical Powertrain: $1,800 - $2,400 potential catastrophic failure cost.
- Engine Lubrication: $850 engine component wear risk.
- Electrical Breakdown: $450 roadside emergency towing and battery replacement.
- Idling Fuel Waste: $0.08 per idle minute beyond 45-minute operational benchmark.
