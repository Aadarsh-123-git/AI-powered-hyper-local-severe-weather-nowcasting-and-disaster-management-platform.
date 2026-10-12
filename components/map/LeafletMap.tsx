'use client';

import React, { useEffect, useRef, useState } from 'react';
import { RiskPrediction, LocationZone } from '@/lib/types';
import L from 'leaflet';

interface LeafletMapProps {
  locations?: LocationZone[];
  predictions: RiskPrediction[];
  selectedLocationId?: string | null;
  onSelectLocation?: (prediction: RiskPrediction) => void;
  height?: string;
  zoomLevel?: number;
  center?: [number, number];
}

// Key Storm & Flood Drainage Basin Corridors for map overlay
const BASIN_CORRIDORS = [
  {
    name: 'Shella-Sohra Escarpment Orographic Moisture Corridor',
    points: [
      [25.1000, 91.6800],
      [25.1800, 91.7100],
      [25.2702, 91.7323],
    ] as [number, number][],
    color: '#2563eb', // Blue for cloudburst surge corridor
    weight: 4,
    dashArray: '6, 4',
  },
  {
    name: 'Upper Teesta Himalayan Gorge Drainage Basin',
    points: [
      [27.3314, 88.6138],
      [27.4200, 88.5600],
      [27.5126, 88.5283],
      [27.6015, 88.6472],
    ] as [number, number][],
    color: '#dc2626',
    weight: 3.5,
    dashArray: '5, 5',
  },
  {
    name: 'Bhagirathi Himalayan Watershed Corridor',
    points: [
      [30.4000, 78.3000],
      [30.5500, 78.3800],
      [30.7268, 78.4372],
    ] as [number, number][],
    color: '#0284c7',
    weight: 3.5,
  },
  {
    name: 'Mithi Estuary & Urban Flood Drain Corridor',
    points: [
      [19.0300, 72.8500],
      [19.0650, 72.8790],
      [19.0760, 72.8777],
    ] as [number, number][],
    color: '#ea580c',
    weight: 3,
  },
];

export default function LeafletMap({
  predictions,
  selectedLocationId,
  onSelectLocation,
  height = '500px',
  center = [23.5, 83.5], // Center of India for pan-India severe weather map
  zoomLevel = 5,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const heatCirclesRef = useRef<L.Circle[]>([]);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const demTileLayerRef = useRef<L.TileLayer | null>(null);

  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showDemOverlay, setShowDemOverlay] = useState<boolean>(true);
  const initialCenterRef = useRef(center);
  const initialZoomRef = useRef(zoomLevel);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current, {
      center: initialCenterRef.current,
      zoom: initialZoomRef.current,
      zoomControl: false,
      attributionControl: true,
    });

    // Base OpenStreetMap Layer
    const baseTile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    baseTileLayerRef.current = baseTile;

    // DEM Elevation Shading Layer (OpenTopoMap DEM representation)
    const demTile = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 16,
      opacity: 0.45,
      attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM / CartoDEM | Map style: &copy; OpenTopoMap',
    });
    demTileLayerRef.current = demTile;
    demTile.addTo(map);

    // Zoom control
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Add Basin Corridors
    BASIN_CORRIDORS.forEach((road) => {
      const polyline = L.polyline(road.points, {
        color: road.color,
        weight: road.weight,
        dashArray: road.dashArray,
        opacity: 0.85,
      }).addTo(map);

      polyline.bindTooltip(
        `<span style="font-size: 11px; font-weight: 600; font-family: sans-serif;">${road.name}</span>`,
        { sticky: true }
      );
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle DEM Layer Toggle
  useEffect(() => {
    const map = mapInstanceRef.current;
    const demTile = demTileLayerRef.current;
    if (!map || !demTile) return;

    if (showDemOverlay) {
      if (!map.hasLayer(demTile)) map.addLayer(demTile);
    } else {
      if (map.hasLayer(demTile)) map.removeLayer(demTile);
    }
  }, [showDemOverlay]);

  // Update Markers & GIS Heatmap Circles whenever predictions change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    heatCirclesRef.current.forEach((circle) => circle.remove());
    heatCirclesRef.current = [];

    predictions.forEach((pred) => {
      const isSelected = pred.id === selectedLocationId || pred.locationId === selectedLocationId;

      let fillColor = '#10b981'; // green
      let borderColor = '#047857';
      let pulseRing = '';

      if (pred.riskLevel === 'CRITICAL') {
        fillColor = pred.hazardType === 'cloudburst' ? '#2563eb' : '#dc2626'; // Blue for cloudburst, Red for flash flood
        borderColor = pred.hazardType === 'cloudburst' ? '#1d4ed8' : '#991b1b';
        pulseRing = `
          <div style="position: absolute; top: -8px; left: -8px; width: 38px; height: 38px; border-radius: 50%; background: ${fillColor}40; animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        `;
      } else if (pred.riskLevel === 'HIGH') {
        fillColor = '#ea580c'; // orange
        borderColor = '#c2410c';
      } else if (pred.riskLevel === 'MODERATE') {
        fillColor = '#d97706'; // amber
        borderColor = '#b45309';
      }

      // Add Heatmap Circle
      if (showHeatmap) {
        const radiusMeters = (pred.riskScore / 100) * 22000 + 5000;
        const circle = L.circle([pred.latitude, pred.longitude], {
          radius: radiusMeters,
          color: fillColor,
          fillColor: fillColor,
          fillOpacity: pred.riskLevel === 'CRITICAL' ? 0.35 : pred.riskLevel === 'HIGH' ? 0.25 : 0.15,
          weight: isSelected ? 2 : 1,
          dashArray: '4, 4',
        }).addTo(map);
        heatCirclesRef.current.push(circle);
      }

      const size = isSelected ? 28 : 22;
      const borderSize = isSelected ? 3 : 2;

      // Symbol per hazard
      let iconSymbol = '⚡';
      if (pred.hazardType === 'cloudburst') iconSymbol = '🌧️';
      else if (pred.hazardType === 'flash_flood') iconSymbol = '🌊';

      const customIcon = L.divIcon({
        className: 'custom-risk-marker',
        html: `
          <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            ${pulseRing}
            <div style="
              width: ${size}px; 
              height: ${size}px; 
              background: ${fillColor}; 
              border: ${borderSize}px solid ${isSelected ? '#ffffff' : borderColor}; 
              border-radius: 50%; 
              box-shadow: 0 2px 6px rgba(0,0,0,0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-weight: 700;
              font-size: 10px;
              font-family: sans-serif;
            ">
              ${iconSymbol}
            </div>
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([pred.latitude, pred.longitude], { icon: customIcon }).addTo(map);

      // Popup Content for Atmospheric Nowcast
      const popupHtml = `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 260px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
            <strong style="font-size: 13px; color: #0f172a;">${pred.location}</strong>
            <span style="
              font-size: 10px; 
              font-weight: 700; 
              padding: 2px 6px; 
              border-radius: 4px; 
              background: ${fillColor}20; 
              color: ${fillColor}; 
              border: 1px solid ${fillColor}50;
            ">${pred.riskLevel}</span>
          </div>

          <div style="font-size: 11px; line-height: 1.5; color: #334155; margin-bottom: 6px;">
            <div><strong>Nowcast Hazard:</strong> <span style="text-transform: uppercase; font-weight: 700; color: #2563eb;">${pred.hazardType.replace('_', ' ')}</span></div>
            <div><strong>Nowcast Risk Score:</strong> ${pred.riskScore}/100 (${Math.round(pred.probability * 100)}% Prob)</div>
            <div><strong>Lead Time Window:</strong> ${pred.forecastWindow}</div>
            <div><strong>IWV Column Moisture:</strong> ${pred.integratedWaterVaporKgM2} kg/m²</div>
            <div><strong>CAPE Instability:</strong> ${pred.capeJkg} J/kg | <strong>CTT Drop:</strong> ${pred.cttDropRateCPerMin}°C/min</div>
            <div><strong>QPE Rain Rate:</strong> ${pred.qpeRainfallRateMmHr} mm/hr</div>
          </div>

          <button id="view-details-btn-${pred.id}" style="
            width: 100%; 
            padding: 6px 12px; 
            background: #2563eb; 
            color: #ffffff; 
            border: none; 
            border-radius: 4px; 
            font-size: 11px; 
            font-weight: 700; 
            cursor: pointer;
            margin-top: 4px;
            transition: background 0.15s ease;
          ">
            Inspect XAI Drivers & Station Details
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-details-btn-${pred.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectLocation) {
              onSelectLocation(pred);
            }
          };
        }
      });

      marker.on('click', () => {
        if (onSelectLocation) {
          onSelectLocation(pred);
        }
      });

      markersRef.current[pred.id] = marker;
    });
  }, [predictions, selectedLocationId, onSelectLocation, showHeatmap]);

  // Pan to selected location
  useEffect(() => {
    if (!selectedLocationId || !mapInstanceRef.current) return;
    const selected = predictions.find((p) => p.id === selectedLocationId || p.locationId === selectedLocationId);
    if (selected) {
      mapInstanceRef.current.flyTo([selected.latitude, selected.longitude], 9, {
        duration: 1.2,
      });
      const marker = markersRef.current[selected.id];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedLocationId, predictions]);

  return (
    <div className="relative w-full rounded-md overflow-hidden border border-slate-200 bg-slate-100" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* Layer Controls: Heatmap & DEM Overlay */}
      <div className="absolute top-3 left-3 z-[400] flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            mapInstanceRef.current?.flyTo(center, zoomLevel, { duration: 1 });
          }}
          className="bg-white/95 backdrop-blur-xs border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold px-2.5 py-1.5 rounded shadow-xs cursor-pointer flex items-center space-x-1"
          title="Reset map view to India national scale"
        >
          <span>🌐 India Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setShowDemOverlay(!showDemOverlay)}
          className={`border text-xs font-semibold px-2.5 py-1.5 rounded shadow-xs cursor-pointer transition-colors flex items-center space-x-1 ${
            showDemOverlay
              ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
              : 'bg-white/95 backdrop-blur-xs text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
          title="Toggle Digital Elevation Model (DEM) terrain shading overlay"
        >
          <span>🏔️ DEM Shading {showDemOverlay ? 'ON' : 'OFF'}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`border text-xs font-semibold px-2.5 py-1.5 rounded shadow-xs cursor-pointer transition-colors flex items-center space-x-1 ${
            showHeatmap
              ? 'bg-red-700 text-white border-red-800 shadow-sm'
              : 'bg-white/95 backdrop-blur-xs text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
          title="Toggle GIS Severe Weather Risk Heatmap"
        >
          <span>🔥 Risk Heatmap {showHeatmap ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs border border-slate-300 rounded px-2.5 py-1.5 shadow-sm text-xs z-[400] flex items-center space-x-3 text-slate-800">
        <span className="font-semibold text-[11px] text-slate-600 uppercase tracking-wider">Hazard Key:</span>
        <span className="flex items-center space-x-1">
          <span className="text-[11px]">🌧️ Cloudburst</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="text-[11px]">🌊 Flash Flood</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="text-[11px]">⚡ Severe Storm</span>
        </span>
      </div>
    </div>
  );
}
