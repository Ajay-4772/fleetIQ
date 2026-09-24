package com.fleetiq.service.decision;

import com.fleetiq.model.CanonicalVehicleEvent;
import com.fleetiq.model.Decision;

public interface DecisionService {
    Decision evaluate(CanonicalVehicleEvent event, double estimatedImpact);
}
