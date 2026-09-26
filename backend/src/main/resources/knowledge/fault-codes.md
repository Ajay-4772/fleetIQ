# vehyron Diagnostic Trouble Code (DTC) Knowledge Base

## Overview
Diagnostic Trouble Codes (DTCs) in vehyron follow standard automotive OBD-II and SAE J1939 conventions. They are emitted by Electronic Control Units (ECUs) over the in-vehicle CAN bus.

## Fault Code Reference

### P0300 / P0301 — Random/Multiple Cylinder Misfire Detected
- **Severity**: CRITICAL
- **Subsystem**: Powertrain / Ignition & Combustion
- **Description**: Indicates one or more cylinders are failing to combust air-fuel mixture properly. Unburned fuel enters exhaust stream, creating severe risks of catalytic converter meltdown and catastrophic engine failure.
- **Estimated Operational Risk**: $1,800 - $2,400 per incident if unaddressed within 48 hours.
- **Operator Recommendation**: Ground vehicle immediately. Dispatch roadside diagnostic tow or reroute to nearest fleet service bay. Inspect spark plugs, ignition coils, and fuel injectors.

### P0420 — Catalyst System Efficiency Below Threshold (Bank 1)
- **Severity**: HIGH
- **Subsystem**: Exhaust & Emissions
- **Description**: Downstream oxygen sensor detects catalyst performance below clean emissions standards. Often caused by exhaust leaks or engine rich/lean conditions.
- **Estimated Operational Risk**: $650 - $1,100
- **Operator Recommendation**: Schedule inspection within 7 days. Verify oxygen sensor integrity and exhaust system seals.

### P0562 — System Voltage Low
- **Severity**: HIGH
- **Subsystem**: Electrical / Charging System
- **Description**: Battery charging voltage measured below 10.0V while engine operating. Indicates alternator charging failure, parasitic drain, or dying 12V battery.
- **Estimated Operational Risk**: $450 - $800
- **Operator Recommendation**: Test 12V battery cold cranking amps (CCA) and alternator diode ripple. Replace battery if state of health is under 60%.

### C0035 — Left Front Wheel Speed Sensor Circuit
- **Severity**: HIGH
- **Subsystem**: Chassis / Anti-lock Braking System (ABS) & Stability Control
- **Description**: Wheel speed signal missing or erratic. Disables ABS and Electronic Stability Program (ESP), increasing stopping distance and wet-weather skid risk.
- **Estimated Operational Risk**: $350 - $700
- **Operator Recommendation**: Restrict vehicle from high-speed inter-city routes. Replace wheel speed sensor harness and clean tone ring.

### U0100 — Lost Communication With ECM/PCM
- **Severity**: CRITICAL
- **Subsystem**: Network Communications / CAN Bus
- **Description**: Controller Area Network (CAN) timeout between Engine Control Module and Body/Transmission modules. Can cause erratic limp-mode, transmission hunting, or sudden stalling.
- **Estimated Operational Risk**: $1,500 - $2,200
- **Operator Recommendation**: Inspect high-speed CAN termination resistors (120 Ohm) and wiring harness for water ingress or rodent damage.

### BMS_028 — EV High-Voltage Battery Cell Imbalance
- **Severity**: CRITICAL
- **Subsystem**: Electric Vehicle Powertrain / Battery Management System
- **Description**: State-of-Charge (SoC) delta between individual lithium-ion cell packs exceeds 150mV, indicating thermal degradation or internal cell failure.
- **Estimated Operational Risk**: $2,500 - $4,000
- **Operator Recommendation**: Restrict DC fast charging immediately. Schedule shop cell balancing and capacity health degradation test.

### OIL_DUE — Engine Oil Life Depleted
- **Severity**: CRITICAL if <= 5%, HIGH if <= 10%
- **Subsystem**: Preventive Maintenance
- **Description**: Engine lubrication viscosity compromised from thermal cycles and operating hours. High risk of bearing friction and premature valve wear.
- **Estimated Operational Risk**: $400 - $950
- **Operator Recommendation**: Book express lube service and filter change within 48 hours.

### TPMS_LOW — Low Tire Pressure
- **Severity**: HIGH if <= 24 PSI, MEDIUM if <= 28 PSI
- **Subsystem**: Running Gear / Tires
- **Description**: Under-inflated tire increases rolling resistance, lowers fuel economy by up to 5%, and increases risk of high-speed tread blowout.
- **Estimated Operational Risk**: $150 - $400
- **Operator Recommendation**: Instruct driver to inflate tire to OEM placard pressure (typically 32-35 PSI). Inspect tire for punctures.
