import { useState, useEffect } from 'react';
import mapImage from '../images/map.png';
import { STALL_POSITIONS } from '../utils/stall_positions';
import './InteractiveStallMap.css';

export default function InteractiveStallMap({ onStallSelect, selectedStall }) {
  const [activeStall, setActiveStall] = useState(null);
  const [stallsWithStatus, setStallsWithStatus] = useState(STALL_POSITIONS);

  // Sync active stall when selectedStall prop changes from parent
  useEffect(() => {
    if (selectedStall) {
      const cleanNum = String(selectedStall.stallNumber).trim().replace(/^0+(?=\d)/, '');
      const zoneLetter = String(selectedStall.zone || '').replace('Zone ', '').toUpperCase();
      const category = getCategoryFromSection(selectedStall.section || selectedStall.category);
      setActiveStall(`stall-${category}-${zoneLetter}-${cleanNum}`);
    } else {
      setActiveStall(null);
    }
  }, [selectedStall]);

  // Fetch real-time status of all stalls from the DB
  useEffect(() => {
    fetch('/api/renter/stalls')
      .then(res => res.json())
      .then(dbStalls => {
        if (!Array.isArray(dbStalls)) return;

        // Create a quick lookup map of category-zone-number -> stall
        const dbStallMap = {};
        dbStalls.forEach(dbStall => {
          const num = String(dbStall.stallNumber || '').trim().replace(/^0+(?=\d)/, '');
          const zoneLetter = String(dbStall.zone || '').replace('Zone ', '').toUpperCase();
          const sec = String(dbStall.section || '').toLowerCase();
          let category = 'meat';
          if (sec.includes('fish') || sec.includes('sea')) category = 'fish';
          else if (sec.includes('veg') || sec.includes('produce')) category = 'veggies';

          if (num && zoneLetter) {
            dbStallMap[`${category}-${zoneLetter}-${num}`] = dbStall;
          }
        });

        // Merge DB data into STALL_POSITIONS
        const merged = STALL_POSITIONS.map(s => {
          const key = `${s.category}-${s.zone}-${s.number}`;
          const dbStall = dbStallMap[key];
          if (dbStall) {
            return {
              ...s,
              status: dbStall.status || 'available',
              dbStall: dbStall
            };
          }
          return {
            ...s,
            status: 'available'
          };
        });

        setStallsWithStatus(merged);
      })
      .catch(err => {
        console.error('Failed to fetch stall statuses on interactive map:', err);
      });
  }, []);

  const getCategoryFromSection = (section) => {
    const sec = String(section || '').toLowerCase();
    if (sec.includes('fish') || sec.includes('sea')) return 'fish';
    if (sec.includes('veg') || sec.includes('produce')) return 'veggies';
    return 'meat';
  };

  const handleStallClick = async (category, zone, number) => {
    try {
      const response = await fetch(`/api/stalls/search?zone=${zone}&stallNumber=${number}`);
      const data = await response.json();
      
      if (data.success && data.stall) {
        onStallSelect(data.stall);
        setActiveStall(`stall-${category}-${zone}-${number}`);
      }
    } catch (error) {
      console.error('Failed to fetch stall:', error);
    }
  };

  return (
    <div className="interactive-map-container">
      <div className="map-wrapper">
        <svg
          viewBox="0 0 2305 1824"
          preserveAspectRatio="xMidYMid meet"
          className="map-overlay-svg"
        >
          {/* Background Map Image inside SVG */}
          <image xlinkHref={mapImage} href={mapImage} x="-20" y="-15" width="2305" height="1824" preserveAspectRatio="none" />

          {/* Render all interactive circles & rectangles */}
          {stallsWithStatus.map((stall) => {
            const stallId = `stall-${stall.category}-${stall.zone}-${stall.number}`;
            const isActive = activeStall === stallId;
            
            // Color mapping based on status & selection
            let statusClass = 'status-available';
            if (isActive) {
              statusClass = 'status-active';
            } else if (stall.status === 'occupied') {
              statusClass = 'status-occupied';
            } else if (stall.status === 'pending') {
              statusClass = 'status-pending';
            }

            return (
              <g 
                key={stallId} 
                className={`interactive-stall-group ${statusClass}`}
                onClick={() => handleStallClick(stall.category, stall.zone, stall.number)}
              >
                {/* Stall Box (Rectangle) */}
                <rect
                  id={`box-${stall.zone}-${stall.number}`}
                  x={stall.boxX}
                  y={stall.boxY}
                  width={stall.boxWidth}
                  height={stall.boxHeight}
                  className="stall-rect-hotspot"
                />

                {/* Clickable Circle */}
                <circle
                  id={`circle-${stall.zone}-${stall.number}`}
                  cx={stall.circleX}
                  cy={stall.circleY}
                  r={stall.circleRadius}
                  className="stall-circle-hotspot"
                />
                
                {/* Circle Label/Number */}
                <text
                  x={stall.circleX}
                  y={stall.circleY}
                  dy="5.5"
                  className="stall-circle-label"
                >
                  {stall.number}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
