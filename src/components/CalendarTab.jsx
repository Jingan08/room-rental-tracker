import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, MapPin, AlignLeft, ChevronLeft, ChevronRight, Plus, Trash2, CheckCircle, Bell } from 'lucide-react';

export default function CalendarTab({ rooms = [], reminders = [], onAddReminder, onRemoveReminder, onToggleReminderComplete }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1)); // Default to July 2026 as per local time
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [title, setTitle] = useState('');
  const [dateStr, setDateStr] = useState('2026-07-01');
  const [timeStr, setTimeStr] = useState('10:00');
  const [type, setType] = useState('viewing');
  const [notes, setNotes] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get days in month
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  const prevMonthDays = getDaysInMonth(year, month - 1);

  // Navigate Months
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Compile calendar cells
  const cells = [];
  
  // Previous month buffer days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const dateFormatted = `${month === 0 ? year - 1 : year}-${String(month === 0 ? 12 : month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, isCurrentMonth: false, dateString: dateFormatted });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateFormatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, isCurrentMonth: true, dateString: dateFormatted });
  }

  // Next month buffer days
  const remainingCells = 42 - cells.length; // 6 rows of 7 days
  for (let d = 1; d <= remainingCells; d++) {
    const dateFormatted = `${month === 11 ? year + 1 : year}-${String(month === 11 ? 1 : month + 2).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, isCurrentMonth: false, dateString: dateFormatted });
  }

  // Gather deadlines and listings expiries from room objects to overlay on calendar dynamically
  const dynamicRoomEvents = [];
  rooms.forEach(room => {
    if (room.expiryDate) {
      dynamicRoomEvents.push({
        id: `dyn-exp-${room.id}`,
        roomId: room.id,
        roomName: room.roomName,
        title: `Listing Expiry: ${room.propertyName}`,
        date: room.expiryDate,
        time: '23:59',
        type: 'deadline',
        notes: `Source listing at ${room.sourceWebsite} will expire.`,
        completed: false,
        isDynamic: true
      });
    }
  });

  const allEvents = [...reminders, ...dynamicRoomEvents];

  const handleDayClick = (cell) => {
    setDateStr(cell.dateString);
    setShowAddForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return;

    const matchedRoom = rooms.find(r => r.id === selectedRoomId);
    const newEvent = {
      id: `rem-${Date.now()}`,
      roomId: selectedRoomId,
      roomName: matchedRoom ? matchedRoom.roomName : 'General Task',
      title,
      date: dateStr,
      time: timeStr,
      type,
      notes,
      completed: false
    };

    onAddReminder(newEvent);
    setShowAddForm(false);
    setTitle('');
    setNotes('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>Viewing & Deadline Schedule</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Coordinate your visits and keep track of deposit deadlines, lease approvals, and listing expirations.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
          <Plus size={16} /> Add Calendar Event
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Calendar Card */}
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          {/* Month Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarIcon size={20} style={{ color: 'var(--primary)' }} />
              {monthNames[month]} {year}
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-icon" onClick={handlePrevMonth}><ChevronLeft size={16} /></button>
              <button className="btn-icon" onClick={handleNextMonth}><ChevronRight size={16} /></button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} style={{ textAlign: 'center', fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-muted)', paddingBottom: '8px' }}>
                {day}
              </div>
            ))}

            {cells.map((cell, index) => {
              const dayEvents = allEvents.filter(e => e.date === cell.dateString);
              const isToday = cell.dateString === '2026-07-01'; // match clock system date 2026-07-01
              
              return (
                <div
                  key={index}
                  onClick={() => handleDayClick(cell)}
                  style={{
                    minHeight: '90px',
                    backgroundColor: cell.isCurrentMonth ? 'var(--bg-surface)' : 'var(--bg-app)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    opacity: cell.isCurrentMonth ? 1 : 0.5,
                    cursor: 'pointer',
                    outline: isToday ? '2px solid var(--primary)' : 'none',
                    position: 'relative',
                    transition: 'var(--transition-all)'
                  }}
                  onMouseEnter={(e) => {
                    if (cell.isCurrentMonth) e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (cell.isCurrentMonth) e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isToday ? 'var(--primary)' : 'var(--text-main)' }}>
                      {cell.day}
                    </span>
                    {isToday && (
                      <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--primary)', color: '#fff', padding: '1px 4px', borderRadius: '4px' }}>
                        Today
                      </span>
                    )}
                  </div>
                  
                  {/* Event Badges */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', overflowY: 'auto', flex: 1 }}>
                    {dayEvents.map(e => (
                      <div
                        key={e.id}
                        onClick={(event) => {
                          event.stopPropagation();
                          alert(`Event: ${e.title}\nTime: ${e.time}\nRoom: ${e.roomName}\nNotes: ${e.notes}`);
                        }}
                        style={{
                          fontSize: '0.675rem',
                          padding: '3px 6px',
                          borderRadius: '4px',
                          backgroundColor: e.type === 'viewing' ? 'var(--primary-light)' : e.type === 'deadline' ? 'var(--accent-red-light)' : 'var(--accent-yellow-light)',
                          color: e.type === 'viewing' ? 'var(--primary)' : e.type === 'deadline' ? 'var(--accent-red)' : 'var(--accent-yellow)',
                          fontWeight: 500,
                          textDecoration: e.completed ? 'line-through' : 'none',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {e.time} {e.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reminders / Agenda Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={18} style={{ color: 'var(--accent-yellow)' }} /> Up Next Agenda
            </h3>

            {allEvents.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '20px 0' }}>
                No events scheduled.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
                {allEvents.sort((a,b) => a.date.localeCompare(b.date)).map(e => (
                  <div
                    key={e.id}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface-hover)',
                      border: '1px solid var(--border-color)',
                      opacity: e.completed ? 0.6 : 1,
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <span className={`badge ${e.type === 'viewing' ? 'badge-primary' : e.type === 'deadline' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                        {e.type}
                      </span>
                      {!e.isDynamic && onRemoveReminder && (
                        <button
                          onClick={() => onRemoveReminder(e.id)}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                          onMouseEnter={(el) => el.target.style.color = 'var(--accent-red)'}
                          onMouseLeave={(el) => el.target.style.color = 'var(--text-muted)'}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px', textDecoration: e.completed ? 'line-through' : 'none' }}>
                      {e.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      <Clock size={12} /> {e.date} @ {e.time}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      {e.roomName}
                    </div>
                    {e.notes && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', borderTop: '1px dashed var(--border-color)', paddingTop: '4px', marginTop: '4px' }}>
                        {e.notes}
                      </div>
                    )}
                    
                    {!e.isDynamic && onToggleReminderComplete && (
                      <button
                        onClick={() => onToggleReminderComplete(e.id)}
                        className="btn btn-secondary"
                        style={{ width: '100%', padding: '4px', fontSize: '0.75rem', marginTop: '8px', gap: '4px', borderRadius: '4px' }}
                      >
                        <CheckCircle size={12} />
                        {e.completed ? 'Completed' : 'Mark Complete'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Event Modal overlay */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>Create Calendar Event</h3>
              <button
                onClick={() => setShowAddForm(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div className="form-group">
                  <label className="form-label">Event Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Viewing Unit, Pay deposit"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Link to Room</label>
                  <select
                    className="form-select"
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                  >
                    <option value="">-- None (General Event) --</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.roomName}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input
                      type="date"
                      className="form-input"
                      value={dateStr}
                      onChange={(e) => setDateStr(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time *</label>
                    <input
                      type="time"
                      className="form-input"
                      value={timeStr}
                      onChange={(e) => setTimeStr(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Event Type</label>
                  <select
                    className="form-select"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="viewing">Viewing Appointment</option>
                    <option value="deadline">Deposit Deadline</option>
                    <option value="task">General Task / Call</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="e.g. Meet landlord David at Lobby"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
