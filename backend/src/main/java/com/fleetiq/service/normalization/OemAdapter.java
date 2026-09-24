package com.fleetiq.service.normalization;

import com.fleetiq.model.CanonicalVehicleEvent;
import java.util.Map;

public interface OemAdapter {
    boolean supports(String source, Map<String, Object> payload);
    CanonicalVehicleEvent normalize(String source, Map<String, Object> payload, String rawPayload);
}
