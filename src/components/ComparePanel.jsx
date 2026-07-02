import React from 'react';
import { Star, ShieldAlert, Sparkles, Printer, ArrowLeft, Check, X } from 'lucide-react';
import { calculateRoomScore } from '../utils/scoring';

export default function ComparePanel({ rooms = [], selectedIds = [], onToggleSelect, onBack, scoringWeights }) {
  const selectedRooms = rooms.filter(r => selectedIds.includes(r.id)).slice(0, 5);

  // If no rooms are selected
  if (selectedRooms.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        <ShieldAlert size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
        <h3 style={{ marginBottom: '8px' }}>No Rooms Selected for Comparison</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
          Select up to 5 rooms from the dashboard/list to compare their features side-by-side.
        </p>
        <button className="btn btn-primary" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>
    );
  }

  // Pre-calculate smart scores for each room
  // We need to calculate rent boundaries for scaling rent score correctly
  const rents = rooms.map(r => Number(r.monthlyRent) || 0);
  const minRent = rents.length ? Math.min(...rents) : 300;
  const maxRent = rents.length ? Math.max(...rents) : 1800;

  const roomsWithScores = selectedRooms.map(room => {
    const scoreObj = calculateRoomScore(room, scoringWeights, minRent, maxRent);
    return {
      ...room,
      scoreDetails: scoreObj
    };
  });

  // Highlight logic: find the optimal values among the selected rooms
  const minRentVal = Math.min(...roomsWithScores.map(r => Number(r.monthlyRent) || Infinity));
  const minDistanceVal = Math.min(...roomsWithScores.map(r => Number(r.distanceToWorkplace) || Infinity));
  const maxRatingVal = Math.max(...roomsWithScores.map(r => Number(r.rating) || 0));
  const maxScoreVal = Math.max(...roomsWithScores.map(r => r.scoreDetails.score || 0));

  const handlePrint = () => {
    window.print();
  };

  const renderBooleanIcon = (val) => {
    return val ? (
      <Check size={18} style={{ color: 'var(--accent-green)' }} />
    ) : (
      <X size={18} style={{ color: 'var(--accent-red)' }} />
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '8px' }}>
            <ArrowLeft size={16} /> Back to Rooms
          </button>
          <h2>Side-by-Side Room Comparison</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Comparing {roomsWithScores.length} of max 5 rooms. Highlighted values denote optimal features.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handlePrint}>
          <Printer size={16} /> Export PDF Report
        </button>
      </div>

      {/* Comparison Table */}
      <div className="compare-container">
        <table className="compare-table">
          <thead>
            <tr>
              <th style={{ width: '200px', position: 'sticky', left: 0, backgroundColor: 'var(--bg-surface-hover)', zIndex: 10 }}>Feature</th>
              {roomsWithScores.map(room => (
                <th key={room.id} style={{ minWidth: '180px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <img
                      src={room.images?.[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'}
                      alt=""
                      style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                    />
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {room.roomName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {room.propertyName}
                    </div>
                    <button
                      className="btn btn-danger"
                      onClick={() => onToggleSelect(room.id)}
                      style={{ padding: '2px 8px', fontSize: '0.7rem', borderRadius: 'var(--radius-sm)' }}
                    >
                      Remove
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Rent Row */}
            <tr>
              <td style={{ fontWeight: 500, position: 'sticky', left: 0, backgroundColor: 'var(--bg-surface)', zIndex: 5 }}>Rent</td>
              {roomsWithScores.map(room => {
                const isLowest = Number(room.monthlyRent) === minRentVal;
                return (
                  <td key={room.id} className={isLowest ? 'highlight-best' : ''} style={{ textAlign: 'center', fontSize: '1rem', fontWeight: isLowest ? '700' : 'normal' }}>
                    RM {room.monthlyRent}/mo
                    {isLowest && <span style={{ display: 'block', fontSize: '0.675rem', fontWeight: 600 }}>Lowest Rent</span>}
                  </td>
                );
              })}
            </tr>

            {/* Deposit Row */}
            <tr>
              <td style={{ fontWeight: 500, position: 'sticky', left: 0, backgroundColor: 'var(--bg-surface)', zIndex: 5 }}>Deposit</td>
              {roomsWithScores.map(room => (
                <td key={room.id} style={{ textAlign: 'center' }}>
                  RM {room.deposit}
                </td>
              ))}
            </tr>

            {/* Utilities Row */}
            <tr>
              <td style={{ fontWeight: 500, position: 'sticky', left: 0, backgroundColor: 'var(--bg-surface)', zIndex: 5 }}>Utilities Cost</td>
              {roomsWithScores.map(room => (
                <td key={room.id} style={{ textAlign: 'center' }}>
                  RM {room.utilitiesCost}/mo
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {room.internetIncluded ? 'Internet Incl.' : 'Internet Excl.'}
                  </div>
                </td>
              ))}
            </tr>

            {/* Commute Distance Row */}
            <tr>
              <td style={{ fontWeight: 500, position: 'sticky', left: 0, backgroundColor: 'var(--bg-surface)', zIndex: 5 }}>Commute Distance</td>
              {roomsWithScores.map(room => {
                const isClosest = Number(room.distanceToWorkplace) === minDistanceVal;
                return (
                  <td key={room.id} className={isClosest ? 'highlight-best' : ''} style={{ textAlign: 'center', fontWeight: isClosest ? '600' : 'normal' }}>
                    {room.distanceToWorkplace} km
                    {isClosest && <span style={{ display: 'block', fontSize: '0.675rem', fontWeight: 600 }}>Closest</span>}
                  </td>
                );
              })}
            </tr>

            {/* Room Size Row */}
            <tr>
              <td style={{ fontWeight: 500, position: 'sticky', left: 0, backgroundColor: 'var(--bg-surface)', zIndex: 5 }}>Room Size</td>
              {roomsWithScores.map(room => (
                <td key={room.id} style={{ textAlign: 'center' }}>
                  {room.roomSize} sqft
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Bed: {room.bedSize}
                  </div>
                </td>
              ))}
            </tr>

            {/* Furnished Status Row */}
            <tr>
              <td style={{ fontWeight: 500, position: 'sticky', left: 0, backgroundColor: 'var(--bg-surface)', zIndex: 5 }}>Furnishing</td>
              {roomsWithScores.map(room => (
                <td key={room.id} style={{ textAlign: 'center' }}>
                  <span className={`badge ${room.furnishedStatus === 'Fully Furnished' ? 'badge-primary' : room.furnishedStatus === 'Semi-Furnished' ? 'badge-purple' : 'badge-warning'}`}>
                    {room.furnishedStatus || 'Unfurnished'}
                  </span>
                </td>
              ))}
            </tr>

            {/* Amenities breakdown */}
            <tr>
              <td style={{ fontWeight: 500, position: 'sticky', left: 0, backgroundColor: 'var(--bg-surface)', zIndex: 5 }}>Aircon</td>
              {roomsWithScores.map(room => (
                <td key={room.id} style={{ textAlign: 'center' }}>{renderBooleanIcon(room.airCon)}</td>
              ))}
            </tr>
            <tr>
              <td style={{ fontWeight: 500, position: 'sticky', left: 0, backgroundColor: 'var(--bg-surface)', zIndex: 5 }}>Private Bathroom</td>
              {roomsWithScores.map(room => (
                <td key={room.id} style={{ textAlign: 'center' }}>{renderBooleanIcon(room.privateBathroom)}</td>
              ))}
            </tr>
            <tr>
              <td style={{ fontWeight: 500, position: 'sticky', left: 0, backgroundColor: 'var(--bg-surface)', zIndex: 5 }}>Parking Included</td>
              {roomsWithScores.map(room => (
                <td key={room.id} style={{ textAlign: 'center' }}>{renderBooleanIcon(room.parking)}</td>
              ))}
            </tr>
            <tr>
              <td style={{ fontWeight: 500, position: 'sticky', left: 0, backgroundColor: 'var(--bg-surface)', zIndex: 5 }}>Washing Machine</td>
              {roomsWithScores.map(room => (
                <td key={room.id} style={{ textAlign: 'center' }}>{renderBooleanIcon(room.washingMachine)}</td>
              ))}
            </tr>
            <tr>
              <td style={{ fontWeight: 500, position: 'sticky', left: 0, backgroundColor: 'var(--bg-surface)', zIndex: 5 }}>Kitchen Allowed</td>
              {roomsWithScores.map(room => (
                <td key={room.id} style={{ textAlign: 'center' }}>{renderBooleanIcon(room.kitchen)}</td>
              ))}
            </tr>
            <tr>
              <td style={{ fontWeight: 500, position: 'sticky', left: 0, backgroundColor: 'var(--bg-surface)', zIndex: 5 }}>Refrigerator</td>
              {roomsWithScores.map(room => (
                <td key={room.id} style={{ textAlign: 'center' }}>{renderBooleanIcon(room.refrigerator)}</td>
              ))}
            </tr>

            {/* Rating Row */}
            <tr>
              <td style={{ fontWeight: 500, position: 'sticky', left: 0, backgroundColor: 'var(--bg-surface)', zIndex: 5 }}>User Rating</td>
              {roomsWithScores.map(room => {
                const isHighestRating = Number(room.rating) === maxRatingVal;
                return (
                  <td key={room.id} className={isHighestRating ? 'highlight-best' : ''} style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <Star size={16} fill="var(--accent-yellow)" color="var(--accent-yellow)" />
                      <span style={{ fontWeight: isHighestRating ? '600' : 'normal' }}>{room.rating} / 5</span>
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Status Row */}
            <tr>
              <td style={{ fontWeight: 500, position: 'sticky', left: 0, backgroundColor: 'var(--bg-surface)', zIndex: 5 }}>Status</td>
              {roomsWithScores.map(room => (
                <td key={room.id} style={{ textAlign: 'center' }}>
                  <span className={`badge status-badge ${
                    ['Booked', 'Shortlisted'].includes(room.status) ? 'badge-success' :
                    ['Rejected'].includes(room.status) ? 'badge-danger' :
                    ['Negotiating', 'Viewing Scheduled'].includes(room.status) ? 'badge-purple' : 'badge-primary'
                  }`}>
                    {room.status}
                  </span>
                </td>
              ))}
            </tr>

            {/* Recommendation Score Row */}
            <tr style={{ borderTop: '2px solid var(--border-color)', backgroundColor: 'var(--primary-light)' }}>
              <td style={{ fontWeight: 700, position: 'sticky', left: 0, backgroundColor: 'var(--primary-light)', zIndex: 5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)' }}>
                  <Sparkles size={16} /> Smart Score
                </div>
              </td>
              {roomsWithScores.map(room => {
                const isBest = room.scoreDetails.score === maxScoreVal;
                return (
                  <td key={room.id} style={{ textAlign: 'center', padding: '16px' }} className={isBest ? 'highlight-best' : ''}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                      {room.scoreDetails.score} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>/100</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {room.scoreDetails.label}
                    </div>
                    {isBest && (
                      <span
                        style={{
                          display: 'inline-block',
                          marginTop: '4px',
                          padding: '2px 8px',
                          backgroundColor: 'var(--accent-green)',
                          color: '#fff',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.65rem',
                          fontWeight: 700
                        }}
                      >
                        🏆 Best Value Choice
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
