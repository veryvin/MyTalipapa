import { useState } from 'react';
import StallSearch from '../../components/StallSearch';
import InteractiveStallMap from '../../components/InteractiveStallMap';
import { MapPin, Phone, Info } from 'lucide-react';
import './FindStall.css';

export default function FindStall() {
  const [selectedStall, setSelectedStall] = useState(null);

  return (
    <div className="find-stall-page">
      {/* Header bar */}
      <div className="find-stall-header">
        <h1>🗺️ Find Your Stall</h1>
        <p>Search for a stall or click directly on any colored stall rectangle or pathway circle to view details and directions.</p>
      </div>

      {/* Grid workspace */}
      <div className="find-stall-grid">
        {/* Left column: Search and Stallholder profile/directions card */}
        <aside className="find-stall-sidebar">
          <StallSearch onStallFound={setSelectedStall} />

          {selectedStall ? (
            <div className="stall-details-card">
              <div className="details-card-header">
                <h3>Stall #{selectedStall.stallNumber}</h3>
                <span className={`details-badge ${selectedStall.status}`}>
                  {selectedStall.status}
                </span>
              </div>

              <div className="details-meta-grid">
                <div className="meta-item-box">
                  <p className="meta-label">Zone</p>
                  <p className="meta-value">{selectedStall.zone}</p>
                </div>
                <div className="meta-item-box">
                  <p className="meta-label">Section</p>
                  <p className="meta-value">{selectedStall.section || 'General'}</p>
                </div>
                <div className="meta-item-box">
                  <p className="meta-label">Size</p>
                  <p className="meta-value">{selectedStall.size || 12} sqm</p>
                </div>
                <div className="meta-item-box">
                  <p className="meta-label">Monthly Rate</p>
                  <p className="meta-value">₱{(selectedStall.monthlyRate || 0).toLocaleString()}</p>
                </div>
              </div>

              <div className="meta-item-box" style={{ width: '100%' }}>
                <p className="meta-label">Vendor Name</p>
                <p className="meta-value">{selectedStall.vendorName || 'No active tenant'}</p>
              </div>

              {selectedStall.phoneNumber && (
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <Phone size={13} className="text-slate-400" />
                  <span><strong>Contact:</strong> {selectedStall.phoneNumber}</span>
                </div>
              )}

              {selectedStall.directions && (
                <div className="directions-instructions-box">
                  <p className="directions-title">
                    <MapPin size={12} />
                    <span>Navigation Directions</span>
                  </p>
                  <p className="directions-desc">{selectedStall.directions}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="stall-details-card" style={{ alignItems: 'center', textAlign: 'center', padding: '30px 20px' }}>
              <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '50%', color: '#64748b', marginBottom: '8px' }}>
                <Info size={24} />
              </div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#334155', margin: '0 0 4px' }}>No Stall Selected</p>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0', lineHeight: '1.4' }}>
                Select a stall from the search results or click a hotspot on the interactive map to view renter and directional details.
              </p>
            </div>
          )}
        </aside>

        {/* Right column: Interactive Floor Map */}
        <main className="find-stall-map-section">
          <InteractiveStallMap 
            onStallSelect={setSelectedStall}
            selectedStall={selectedStall}
          />
        </main>
      </div>
    </div>
  );
}
