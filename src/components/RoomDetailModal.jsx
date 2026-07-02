import React, { useState } from 'react';
import {
  X, MapPin, Calendar, User, Phone, Globe, ExternalLink, Star,
  DollarSign, Clock, Check, Plus, Edit3, Trash2, Heart, Award, ArrowUpRight
} from 'lucide-react';
import ImageGallery from './ImageGallery';
import { calculateRoomScore } from '../utils/scoring';

export default function RoomDetailModal({
  room,
  onClose,
  onUpdateRoom,
  onDeleteRoom,
  onEditRoomForm,
  scoringWeights,
  minRent,
  maxRent
}) {
  const [activeTab, setActiveTab] = useState('details');
  const [newEventText, setNewEventText] = useState('');

  const scoreObj = calculateRoomScore(room, scoringWeights, minRent, maxRent);

  // Helper to parse notes markdown (interactive checklist)
  const handleToggleNoteChecklist = (lineIndex) => {
    const lines = room.personalNotes.split('\n');
    const targetLine = lines[lineIndex];

    if (targetLine.includes('[ ]')) {
      lines[lineIndex] = targetLine.replace('[ ]', '[x]');
    } else if (targetLine.includes('[x]')) {
      lines[lineIndex] = targetLine.replace('[x]', '[ ]');
    }

    const updatedNotes = lines.join('\n');
    
    // Trigger timeline entry for note updates
    const updatedRoom = {
      ...room,
      personalNotes: updatedNotes,
      timeline: [
        ...room.timeline,
        { status: room.status, date: new Date().toISOString(), note: 'Updated checklist item in notes.' }
      ]
    };
    onUpdateRoom(updatedRoom);
  };

  const renderNotesMarkdown = (markdownText) => {
    if (!markdownText) return <p style={{ color: 'var(--text-muted)' }}>No notes added.</p>;
    
    const lines = markdownText.split('\n');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: '1.6' }}>
        {lines.map((line, idx) => {
          // Headers
          if (line.startsWith('###')) {
            return <h4 key={idx} style={{ marginTop: '12px', marginBottom: '4px' }}>{line.replace('###', '').trim()}</h4>;
          }
          if (line.startsWith('##')) {
            return <h3 key={idx} style={{ marginTop: '16px', marginBottom: '6px' }}>{line.replace('##', '').trim()}</h3>;
          }
          if (line.startsWith('#')) {
            return <h2 key={idx} style={{ marginTop: '20px', marginBottom: '8px' }}>{line.replace('#', '').trim()}</h2>;
          }

          // Checkboxes [ ] and [x]
          const isUnchecked = line.includes('[ ]');
          const isChecked = line.includes('[x]');
          if (isUnchecked || isChecked) {
            const cleanText = line.replace(/^[*\-\s]+\[[ x]\]/, '').trim();
            return (
              <label
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggleNoteChecklist(idx)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                <span style={{ textDecoration: isChecked ? 'line-through' : 'none', color: isChecked ? 'var(--text-muted)' : 'var(--text-main)' }}>
                  {cleanText}
                </span>
              </label>
            );
          }

          // Bullet points
          if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
            return (
              <li key={idx} style={{ marginLeft: '16px', listStyleType: 'disc', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                {line.replace(/^[*\-\s]+/, '').trim()}
              </li>
            );
          }

          // Bold, Italic text placeholder (basic)
          let processedText = line;
          const boldRegex = /\*\*(.*?)\*\*/g;
          processedText = processedText.replace(boldRegex, '$1');

          return <p key={idx} style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{processedText}</p>;
        })}
      </div>
    );
  };

  // Add timeline activity log item manually
  const handleAddTimelineEvent = (e) => {
    e.preventDefault();
    if (!newEventText.trim()) return;

    const newEvent = {
      status: room.status,
      date: new Date().toISOString(),
      note: newEventText.trim()
    };

    const updatedRoom = {
      ...room,
      timeline: [...room.timeline, newEvent]
    };

    onUpdateRoom(updatedRoom);
    setNewEventText('');
  };

  // Calculate full rent cost summary
  const totalCost = Number(room.monthlyRent || 0) + Number(room.utilitiesCost || 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '960px' }}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className={`badge ${room.status === 'Booked' ? 'badge-success' : 'badge-primary'}`}>
                {room.status}
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {room.favorite && <Heart size={14} fill="var(--accent-red)" style={{ color: 'var(--accent-red)' }} />}
                {room.topChoice && <Star size={14} fill="var(--accent-yellow)" style={{ color: 'var(--accent-yellow)' }} />}
                {room.bestValue && <Award size={14} fill="var(--accent-green)" style={{ color: 'var(--accent-green)' }} />}
              </div>
            </div>
            <h2 style={{ fontSize: '1.5rem', lineHeight: '1.2' }}>{room.roomName}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <MapPin size={14} /> {room.propertyName}, {room.area}, {room.city}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>
            &times;
          </button>
        </div>

        {/* Modal Main Body Tabs */}
        <div style={{ borderBottom: '1px solid var(--border-color)', display: 'flex', padding: '0 28px', backgroundColor: 'var(--bg-surface)' }}>
          {[
            { id: 'details', label: 'Details & Amenities' },
            { id: 'notes', label: 'Observations & Notes' },
            { id: 'timeline', label: 'Timeline & History' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '16px 20px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                transition: 'var(--transition-all)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body Contents */}
        <div className="modal-body">
          {activeTab === 'details' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px' }}>
              
              {/* Left Column: Image Gallery, Google Maps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <ImageGallery images={room.images} />
                
                {/* Google Maps Link Preview (Iframe template) */}
                <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ marginBottom: '10px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={16} /> Location Map Address
                  </h4>
                  <div style={{ fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-main)' }}>
                    {room.fullAddress}
                  </div>
                  {room.googleMapsLink && (
                    <a
                      href={room.googleMapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', width: '100%', padding: '6px' }}
                    >
                      <ArrowUpRight size={14} /> Open in Google Maps
                    </a>
                  )}
                </div>
              </div>

              {/* Right Column: Pricing breakdown, amenities checkboxes, contact person */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Cost Breakdown Box */}
                <div style={{ backgroundColor: 'var(--primary-light)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(15, 98, 254, 0.1)' }}>
                  <h4 style={{ marginBottom: '12px', color: 'var(--primary)' }}>Rental Cost Breakdown</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Base Rent:</span>
                      <strong>RM {room.monthlyRent} / mo</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Estimated Utilities:</span>
                      <strong>RM {room.utilitiesCost} / mo</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
                      <strong>Monthly Total:</strong>
                      <strong style={{ color: 'var(--primary)' }}>RM {totalCost} / mo</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
                      <span>Deposit Required:</span>
                      <span>RM {room.deposit}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>Advance Rental:</span>
                      <span>RM {room.advanceRental}</span>
                    </div>
                  </div>
                </div>

                {/* Score badge summary */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-surface-hover)', padding: '12px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>SMART SCORE</span>
                    <h3 style={{ color: 'var(--primary)' }}>{scoreObj.score} / 100</h3>
                  </div>
                  <span className={`badge ${scoreObj.score >= 85 ? 'badge-success' : 'badge-primary'}`}>
                    {scoreObj.label}
                  </span>
                </div>

                {/* Amenities checklist */}
                <div>
                  <h4 style={{ marginBottom: '10px' }}>Amenities & Facilities</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {[
                      { key: 'airCon', label: 'Air Conditioning' },
                      { key: 'privateBathroom', label: 'Private Bathroom' },
                      { key: 'parking', label: 'Parking Space' },
                      { key: 'washingMachine', label: 'Washing Machine' },
                      { key: 'kitchen', label: 'Kitchen / Cooking' },
                      { key: 'refrigerator', label: 'Refrigerator' },
                      { key: 'wardrobe', label: 'Wardrobe' },
                      { key: 'studyTable', label: 'Study Table' },
                      { key: 'internetIncluded', label: 'WiFi Included' }
                    ].map(item => (
                      <div
                        key={item.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '0.85rem',
                          color: room[item.key] ? 'var(--text-main)' : 'var(--text-muted)',
                          textDecoration: room[item.key] ? 'none' : 'line-through',
                          opacity: room[item.key] ? 1 : 0.6
                        }}
                      >
                        <span
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            backgroundColor: room[item.key] ? 'var(--accent-green-light)' : 'var(--bg-app)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid var(--border-color)'
                          }}
                        >
                          {room[item.key] && <Check size={12} style={{ color: 'var(--accent-green)' }} />}
                        </span>
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contacts Block */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <h4 style={{ marginBottom: '10px' }}>Contact Person</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.875rem' }}>
                    {room.ownerName && (
                      <div>👤 Owner: <strong>{room.ownerName}</strong></div>
                    )}
                    {room.agentName && (
                      <div>👤 Agent: <strong>{room.agentName}</strong></div>
                    )}
                    <div>📞 Phone: <strong>{room.phoneNumber}</strong></div>
                    {room.email && <div>✉️ Email: <strong>{room.email}</strong></div>}
                    
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      {room.whatsApp && (
                        <a
                          href={room.whatsApp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary"
                          style={{ flex: 1, padding: '8px', fontSize: '0.8rem', backgroundColor: '#25D366', borderColor: '#25D366' }}
                        >
                          WhatsApp Direct
                        </a>
                      )}
                      {room.listingUrl && (
                        <a
                          href={room.listingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary"
                          style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}
                        >
                          <ExternalLink size={12} /> View Source
                        </a>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px' }}>
              <div style={{ backgroundColor: 'var(--bg-surface-hover)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', minHeight: '300px' }}>
                <h4 style={{ marginBottom: '12px' }}>Observations & Checklist</h4>
                {renderNotesMarkdown(room.personalNotes)}
              </div>
              <div>
                <h4 style={{ marginBottom: '12px' }}>Checklist Guide</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
                  The markdown notepad supports checklists. Toggle items interactively to update your checklist progress. You can write checklists using `* [ ] Item` syntax in notes editor.
                </p>
                <button className="btn btn-secondary" onClick={() => onEditRoomForm(room)}>
                  <Edit3 size={16} /> Edit Notes & Info
                </button>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px' }}>
              
              {/* Left Timeline Log */}
              <div>
                <h4 style={{ marginBottom: '16px' }}>Chronological Activity History</h4>
                <div className="timeline-list">
                  {room.timeline?.map((event, idx) => (
                    <div key={idx} className="timeline-event-item completed">
                      <div className="timeline-event-title">{event.status}</div>
                      <div className="timeline-event-date">{new Date(event.date).toLocaleString()}</div>
                      <div className="timeline-event-note">{event.note}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Add Event */}
              <div style={{ backgroundColor: 'var(--bg-surface-hover)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', height: 'fit-content' }}>
                <h4 style={{ marginBottom: '12px' }}>Log Activity Note</h4>
                <form onSubmit={handleAddTimelineEvent}>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <textarea
                      className="form-input"
                      rows={3}
                      placeholder="e.g. Discussed utility caps. Agent promised new fan."
                      value={newEventText}
                      onChange={(e) => setNewEventText(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    <Plus size={14} /> Add Log Entry
                  </button>
                </form>
              </div>

            </div>
          )}
        </div>

        {/* Modal Footer actions */}
        <div className="modal-header" style={{ borderTop: '1px solid var(--border-color)', borderBottom: 'none', top: 'auto', bottom: 0, position: 'sticky' }}>
          <button
            className="btn btn-danger"
            onClick={() => {
              if (confirm(`Are you sure you want to delete ${room.roomName}?`)) {
                onDeleteRoom(room.id);
              }
            }}
          >
            <Trash2 size={16} /> Delete Room
          </button>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={() => onEditRoomForm(room)}>
              <Edit3 size={16} /> Edit Room Info
            </button>
            <button className="btn btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
