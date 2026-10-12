# MEGH-AI: Production ML & Data Pipeline Architecture

## System Overview
**MEGH-AI** is an AI-driven hyper-local early warning system for severe weather nowcasting (thunderstorms, cloudbursts, flash floods) delivering 2–6 hour lead times across India. It integrates high-resolution regional numerical reanalysis, geostationary satellite telemetry, quantitative precipitation estimation (QPE), and digital elevation models (DEM) into a unified spatiotemporal prediction pipeline.

---

## 1. Multi-Source Data Fusion & Alignment
The platform ingests and standardizes heterogeneous data streams onto a uniform $0.05^\circ \times 0.05^\circ$ grid (~5 km resolution) at 15-minute update intervals:

1. **IMDAA Reanalysis Data**:
   - Multi-level atmospheric profiles: Temperature ($T$), Specific Humidity ($q$), Geopotential Height ($Z$), Horizontal Wind Components ($U, V$) from 1000 hPa to 200 hPa.
   - Provides background thermodynamic and kinematic conditions across the Indian subcontinent.

2. **INSAT-3D / INSAT-3DR Satellite Feeds (MOSDAC)**:
   - **Water Vapor (WV) Channel (6.5–7.1 µm)**: High-resolution upper/mid-tropospheric moisture transport.
   - **Thermal Infrared (TIR1/TIR2) Channels (10.3–12.5 µm)**: Cloud Top Temperature (CTT) monitoring and deep convective updraft tracking.

3. **Satellite Quantitative Precipitation Estimation (QPE)**:
   - Blended INSAT-3D TIR and GPM microwave precipitation estimates providing real-time surface rain-rate ($mm/hr$).

4. **Digital Elevation Model (DEM - CartoDEM / SRTM)**:
   - $30m$ resolution static elevation, slope angle, flow accumulation, and hydrographic watershed basin boundaries for hydrodynamic surface runoff routing.

---

## 2. Dynamic Feature Extraction & Physics-Informed Indicators
From the raw multidimensional rasters, the feature engineering engine extracts 6 core meteorological predictors:

$$\begin{aligned}
\text{Integrated Water Vapor (IWV)} &= \frac{1}{g} \int_{p_{\text{surface}}}^{p_{\text{top}}} q \, dp \quad (\text{kg/m}^2) \\
\text{CAPE} &= g \int_{Z_{\text{LFC}}}^{Z_{\text{EL}}} \frac{T_{v, \text{parcel}} - T_{v, \text{env}}}{T_{v, \text{env}}} \, dz \quad (\text{J/kg}) \\
\text{CIN} &= g \int_{Z_{\text{surface}}}^{Z_{\text{LFC}}} \frac{T_{v, \text{env}} - T_{v, \text{parcel}}}{T_{v, \text{env}}} \, dz \quad (\text{J/kg}) \\
\text{Low-Level Convergence} &= -\left(\frac{\partial U}{\partial x} + \frac{\partial V}{\partial y}\right)_{1000-850\,\text{hPa}} \quad (\text{s}^{-1}) \\
\text{Vertical Wind Shear} &= \sqrt{(U_{6\text{km}} - U_{10\text{m}})^2 + (V_{6\text{km}} - V_{10\text{m}})^2} \quad (\text{m/s}) \\
\text{CTT Drop Rate} &= \frac{T_{\text{cloud\_top}}(t) - T_{\text{cloud\_top}}(t - 15\text{min})}{15} \quad (^\circ\text{C/min})
\end{aligned}$$

---

## 3. Multi-Task Spatiotemporal Transformer Architecture

```
                       [ Input Tensor (5D: B x T x C x H x W) ]
         (IMDAA Reanalysis + INSAT-3D TIR/WV + Satellite QPE + DEM Features)
                                          │
                                          ▼
                     [ 3D Swin-Transformer Encoder Backbone ]
               (Cross-Attention between Satellite Grid & Reanalysis)
                                          │
                  ┌───────────────────────┼───────────────────────┐
                  ▼                       ▼                       ▼
        [ Head 1: Severe Storm ]  [ Head 2: Cloudburst ]  [ Head 3: Flash Flood ]
        (2-6h Lightning & Hail)  (2-4h Rainfall Spikes)  (3D DEM Surface Flow)
                  │                       │                       │
                  └───────────────────────┼───────────────────────┘
                                          ▼
                       [ Explainable AI (XAI) Attribution ]
                       (Integrated Gradients Feature Weights)
```

1. **Shared Encoder Backbone**:
   - 3D Swin-Transformer capturing spatiotemporal interactions across 12 past time-steps ($3\text{ hours}$ of 15-min frames).
   - Cross-attention mechanism aligns fast satellite observations (CTT drop rate) with background reanalysis dynamics (CAPE/CIN).

2. **Multi-Task Learning (MTL) Heads**:
   - **Head 1 (Severe Thunderstorm)**: Predicts probability of severe convective wind, lightning, and hail in $2\text{--}6\text{ hours}$.
   - **Head 2 (Cloudburst)**: Predicts extreme localized rainfall surges ($>100\text{ mm/hr}$) in $2\text{--}4\text{ hours}$.
   - **Head 3 (Flash Flood)**: Combines cloudburst head predictions with DEM topographic flow accumulation and slope gradients to model hydrodynamic overland flood inundation.

---

## 4. Transparent Explainable AI (XAI) Attribution Module
To build trust with operational forecasters and District Emergency Operations Center (DEOC) officers:
- Integrated Gradients and SHAP feature attribution evaluate the relative contribution percentage ($\%$) of each predictor to the final risk score.
- Plain-language driver summaries are generated in real-time (e.g. *"IWV surge +18 kg/m² in 30 min and rapid CTT drop rate of -11°C/15min represent 72% of the cloudburst risk attribution"*).

---

## 5. Automated Alerting & Sachet CAP Dispatch
- **Threshold Gating**: Alerts escalate automatically from `WATCH` ($\ge 35\%$) to `WARNING` ($\ge 55\%$) and `CRITICAL` ($\ge 75\%$).
- **CAP Protocol**: Generates OASIS Common Alerting Protocol (CAP v1.2) XML feeds compatible with NDMA's Sachet national emergency warning platform and direct SMS gateways.
