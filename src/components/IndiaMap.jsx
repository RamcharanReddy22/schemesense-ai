import React, { useMemo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { schemes } from '../data/schemesData';
import indiaTopoJson from '../data/india-states.json';

// Get counts of schemes per state (excluding 'All' which applies to all)
const getStateSchemeCounts = () => {
  const counts = {};
  schemes.forEach(scheme => {
    if (scheme.state !== 'All') {
      counts[scheme.state] = (counts[scheme.state] || 0) + 1;
    }
  });
  return counts;
};

// Map topojson state names to our state names if they differ slightly
const stateNameMap = {
  'Andaman and Nicobar': 'Andaman and Nicobar Islands',
  'Arunanchal Pradesh': 'Arunachal Pradesh',
  'Delhi': 'Delhi',
  'NCT of Delhi': 'Delhi',
  'Jammu and Kashmir': 'Jammu and Kashmir',
  'Orissa': 'Odisha',
  'Uttaranchal': 'Uttarakhand'
};

const normalizeStateName = (name) => {
  return stateNameMap[name] || name;
};

export default function IndiaMap({ onSelectState }) {
  const stateCounts = useMemo(() => getStateSchemeCounts(), []);
  
  const maxCount = Math.max(...Object.values(stateCounts), 1);
  
  const colorScale = scaleLinear()
    .domain([0, maxCount])
    .range(["#f8fafc", "#f97316"]); // Light gray to saffron

  return (
    <div className="india-map-container" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 900,
          center: [82.8, 22.5] // Center of India
        }}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={indiaTopoJson}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const stateName = normalizeStateName(geo.properties.name);
              const count = stateCounts[stateName] || 0;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={count > 0 ? colorScale(count) : "#f1f5f9"}
                  stroke="#cbd5e1"
                  strokeWidth={0.5}
                  onClick={() => onSelectState(stateName)}
                  style={{
                    default: { outline: "none", transition: "all 250ms" },
                    hover: { fill: "#f97316", outline: "none", cursor: "pointer", transition: "all 250ms" },
                    pressed: { fill: "#ea580c", outline: "none" }
                  }}
                >
                  <title>{stateName}: {count} specific schemes</title>
                </Geography>
              );
            })
          }
        </Geographies>
      </ComposableMap>
      <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
        Click any state to view its local schemes
      </div>
    </div>
  );
}
