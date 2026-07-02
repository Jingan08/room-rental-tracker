import React from 'react';
import { Star, MapPin, Heart, Award, CheckSquare, Eye, Award as BestValueIcon } from 'lucide-react';
import { calculateRoomScore } from '../utils/scoring';

export default function RoomCard({
  room,
  isCompared,
  onToggleCompare,
  onToggleWishlist,
  onViewDetails,
  scoringWeights,
  minRent,
  maxRent
}) {
  const scoreObj = calculateRoomScore(room, scoringWeights, minRent, maxRent);

  // Status badges color map
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Booked':
      case 'Shortlisted':
        return 'badge-success';
      case 'Rejected':
        return 'badge-danger';
      case 'Negotiating':
      case 'Viewing Scheduled':
        return 'badge-purple';
      case 'Contacted':
        return 'badge-warning';
      default:
        return 'badge-primary';
    }
  };

  return (
    <div className="room-card">
      {/* Thumbnail section */}
      <div className="room-card-image-container">
        <img
          src={room.images?.[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'}
          alt={room.roomName}
          className="room-card-image"
        />
        
        {/* Top Badges */}
        <div className="room-card-badges">
          <span className={`badge status-badge ${getStatusBadgeClass(room.status)}`}>
            {room.status}
          </span>
        </div>

        {/* Favorite & Quick Wishlist Controls */}
        <div className="room-card-actions">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleWishlist(room.id, 'favorite'); }}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              background: room.favorite ? 'var(--accent-red-light)' : 'rgba(0, 0, 0, 0.45)',
              color: room.favorite ? 'var(--accent-red)' : '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'var(--transition-all)'
            }}
          >
            <Heart size={16} fill={room.favorite ? 'var(--accent-red)' : 'none'} />
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); onToggleWishlist(room.id, 'topChoice'); }}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              background: room.topChoice ? 'var(--accent-yellow-light)' : 'rgba(0, 0, 0, 0.45)',
              color: room.topChoice ? 'var(--accent-yellow)' : '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'var(--transition-all)'
            }}
          >
            <Star size={16} fill={room.topChoice ? 'var(--accent-yellow)' : 'none'} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onToggleWishlist(room.id, 'bestValue'); }}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              background: room.bestValue ? 'var(--accent-green-light)' : 'rgba(0, 0, 0, 0.45)',
              color: room.bestValue ? 'var(--accent-green)' : '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'var(--transition-all)'
            }}
          >
            <BestValueIcon size={16} fill={room.bestValue ? 'var(--accent-green)' : 'none'} />
          </button>
        </div>
      </div>

      {/* Main card body */}
      <div className="room-card-content">
        <div className="room-card-title-row">
          <h4 className="room-card-title">{room.roomName}</h4>
        </div>
        <div className="room-card-subtitle">
          <MapPin size={14} /> {room.propertyName} ({room.area})
        </div>

        <div className="room-card-rent-row">
          <span className="room-card-rent-val">RM {room.monthlyRent}</span>
          <span className="room-card-rent-period">/ month</span>
        </div>

        {/* Dynamic Spec List */}
        <div className="room-card-specs">
          <div className="room-card-spec-item">
            <span>🚇 MRT:</span>
            <strong style={{ color: 'var(--text-main)' }}>{room.distanceToMrtLrt} km</strong>
          </div>
          <div className="room-card-spec-item">
            <span>🏫 Commute:</span>
            <strong style={{ color: 'var(--text-main)' }}>{room.distanceToWorkplace} km</strong>
          </div>
          <div className="room-card-spec-item">
            <span>📐 Size:</span>
            <strong style={{ color: 'var(--text-main)' }}>{room.roomSize} sqft</strong>
          </div>
          <div className="room-card-spec-item">
            <span>🛋️ Bed:</span>
            <strong style={{ color: 'var(--text-main)' }}>{room.bedSize}</strong>
          </div>
        </div>

        {/* Bottom Panel (Rating and Smart Score) */}
        <div className="room-card-score">
          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Star size={16} fill="var(--accent-yellow)" color="var(--accent-yellow)" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{room.rating}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ 5</span>
          </div>

          {/* Smart Score Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--primary-light)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(15, 98, 254, 0.1)'
            }}
          >
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--primary)', uppercase: 'true' }}>
              SCORE:
            </span>
            <strong style={{ fontSize: '0.95rem', color: 'var(--primary)', fontWeight: 800 }}>
              {scoreObj.score}
            </strong>
          </div>
        </div>

        {/* Compare Checkbox & View Actions */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
          <label
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              color: isCompared ? 'var(--primary)' : 'var(--text-muted)'
            }}
          >
            <input
              type="checkbox"
              checked={isCompared}
              onChange={() => onToggleCompare(room.id)}
              style={{
                width: '16px',
                height: '16px',
                accentColor: 'var(--primary)',
                cursor: 'pointer'
              }}
            />
            {isCompared ? 'Comparing' : 'Compare'}
          </label>

          <button
            className="btn btn-secondary"
            onClick={() => onViewDetails(room)}
            style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
          >
            <Eye size={14} /> View Details
          </button>
        </div>
      </div>
    </div>
  );
}
