import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, List, Calculator, Calendar as CalendarIcon, BarChart3,
  Search, SlidersHorizontal, Plus, Sparkles, Sun, Moon, ArrowUpDown,
  Download, RefreshCw, Layers, Award, Star, Heart, CheckCircle2, ChevronRight, HelpCircle
} from 'lucide-react';

// Utilities & Components
import { calculateRoomScore, DEFAULT_WEIGHTS } from './utils/scoring';
import { MOCK_ROOMS, MOCK_REMINDERS } from './utils/mockData';
import Toast from './components/Toast';
import RoomCard from './components/RoomCard';
import RoomDetailModal from './components/RoomDetailModal';
import AddRoomModal from './components/AddRoomModal';
import ComparePanel from './components/ComparePanel';
import ExpenseCalculator from './components/ExpenseCalculator';
import StatisticsTab from './components/StatisticsTab';
import CalendarTab from './components/CalendarTab';

export default function App() {
  // Navigation View: 'dashboard', 'rooms', 'compare', 'expenses', 'calendar', 'statistics'
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Theme state
  const [theme, setTheme] = useState('light');

  // Core Data Lists
  const [rooms, setRooms] = useState(() => {
    const saved = localStorage.getItem('rental_rooms');
    return saved ? JSON.parse(saved) : MOCK_ROOMS;
  });

  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('rental_reminders');
    return saved ? JSON.parse(saved) : MOCK_REMINDERS;
  });

  const [compareIds, setCompareIds] = useState([]);
  
  const [scoringWeights, setScoringWeights] = useState(() => {
    const saved = localStorage.getItem('scoring_weights');
    return saved ? JSON.parse(saved) : DEFAULT_WEIGHTS;
  });

  // UI Interactive States
  const [toast, setToast] = useState(null);
  const [selectedRoomDetail, setSelectedRoomDetail] = useState(null);
  const [roomToEditForm, setRoomToEditForm] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWeightsEditor, setShowWeightsEditor] = useState(false);

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [maxDistance, setMaxDistance] = useState(30);
  const [statusFilter, setStatusFilter] = useState('');
  const [minRentInput, setMinRentInput] = useState(0);
  const [maxRentInput, setMaxRentInput] = useState(2500);
  const [amenityFilters, setAmenityFilters] = useState({
    airCon: false,
    privateBathroom: false,
    parking: false,
    washingMachine: false,
    internetIncluded: false
  });
  const [wishlistFilter, setWishlistFilter] = useState('all'); // 'all', 'favorite', 'topChoice', 'bestValue'
  const [sortBy, setSortBy] = useState('newest'); // 'lowest-rent', 'highest-rent', 'newest', 'rating', 'nearest'

  // Persist Rooms data
  useEffect(() => {
    localStorage.setItem('rental_rooms', JSON.stringify(rooms));
  }, [rooms]);

  // Persist Reminders data
  useEffect(() => {
    localStorage.setItem('rental_reminders', JSON.stringify(reminders));
  }, [reminders]);

  // Persist Custom Weights
  useEffect(() => {
    localStorage.setItem('scoring_weights', JSON.stringify(scoringWeights));
  }, [scoringWeights]);

  // Theme Syncing
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Toast Trigger Helper
  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Toggle Theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Add / Edit / Update Room Handlers
  const handleSaveRoom = (savedRoom) => {
    const exists = rooms.some(r => r.id === savedRoom.id);
    let updatedRooms;
    if (exists) {
      updatedRooms = rooms.map(r => r.id === savedRoom.id ? savedRoom : r);
      triggerToast('Room listing updated successfully!');
    } else {
      updatedRooms = [savedRoom, ...rooms];
      triggerToast('New room listing saved successfully!');
    }
    setRooms(updatedRooms);
    setShowAddModal(false);
    setRoomToEditForm(null);
    // Sync active detail room if open
    if (selectedRoomDetail && selectedRoomDetail.id === savedRoom.id) {
      setSelectedRoomDetail(savedRoom);
    }
  };

  const handleUpdateRoomDirect = (updatedRoom) => {
    const updated = rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r);
    setRooms(updated);
    if (selectedRoomDetail && selectedRoomDetail.id === updatedRoom.id) {
      setSelectedRoomDetail(updatedRoom);
    }
  };

  const handleDeleteRoom = (roomId) => {
    const updated = rooms.filter(r => r.id !== roomId);
    setRooms(updated);
    setCompareIds(prev => prev.filter(id => id !== roomId));
    setReminders(prev => prev.filter(rem => rem.roomId !== roomId));
    setSelectedRoomDetail(null);
    triggerToast('Room listing removed.', 'warning');
  };

  const handleEditRoomForm = (room) => {
    setRoomToEditForm(room);
    setShowAddModal(true);
  };

  // Wishlist and Compare Handlers
  const handleToggleWishlist = (roomId, type) => {
    // type: 'favorite', 'topChoice', 'bestValue'
    const updated = rooms.map(r => {
      if (r.id === roomId) {
        const newVal = !r[type];
        triggerToast(`${type === 'favorite' ? '❤️ Favorite' : type === 'topChoice' ? '⭐ Top Choice' : '🏆 Best Value'} updated.`);
        
        // Add timeline log
        const timestamp = new Date().toISOString();
        const actionLabel = newVal ? `Marked as ${type}` : `Removed from ${type}`;
        return {
          ...r,
          [type]: newVal,
          timeline: [...(r.timeline || []), { status: r.status, date: timestamp, note: actionLabel }]
        };
      }
      return r;
    });
    setRooms(updated);
  };

  const handleToggleCompare = (roomId) => {
    setCompareIds(prev => {
      if (prev.includes(roomId)) {
        return prev.filter(id => id !== roomId);
      }
      if (prev.length >= 5) {
        triggerToast('You can compare a maximum of 5 rooms side-by-side.', 'error');
        return prev;
      }
      triggerToast('Room added to comparison matrix.');
      return [...prev, roomId];
    });
  };

  // Reminder events scheduling handlers
  const handleAddReminder = (newReminder) => {
    setReminders(prev => [newReminder, ...prev]);
    triggerToast('Activity reminder scheduled.');
  };

  const handleRemoveReminder = (reminderId) => {
    setReminders(prev => prev.filter(r => r.id !== reminderId));
    triggerToast('Reminder deleted.', 'warning');
  };

  const handleToggleReminderComplete = (reminderId) => {
    setReminders(prev => prev.map(r => r.id === reminderId ? { ...r, completed: !r.completed } : r));
    triggerToast('Reminder status toggled.');
  };

  // Weight priority slider edits
  const handleWeightChange = (key, val) => {
    setScoringWeights(prev => ({
      ...prev,
      [key]: Number(val)
    }));
  };

  // Data aggregations for Dashboard Summaries
  const totalRooms = rooms.length;
  const roomsAvailable = rooms.filter(r => r.status !== 'Rejected' && r.status !== 'Booked').length;
  const roomsContacted = rooms.filter(r => ['Contacted', 'Viewing Scheduled', 'Viewed', 'Negotiating', 'Shortlisted'].includes(r.status)).length;
  const roomsVisited = rooms.filter(r => ['Viewed', 'Negotiating', 'Shortlisted'].includes(r.status)).length;
  const roomsBookmarked = rooms.filter(r => r.favorite || r.topChoice || r.bestValue).length;

  const rents = rooms.map(r => Number(r.monthlyRent) || 0);
  const minRent = rents.length ? Math.min(...rents) : 0;
  const maxRent = rents.length ? Math.max(...rents) : 0;
  const avgRent = rents.length ? Math.round(rents.reduce((sum, r) => sum + r, 0) / rents.length) : 0;

  // Get locations list
  const uniqueAreas = [...new Set(rooms.map(r => r.area).filter(Boolean))];
  const favoriteLocations = uniqueAreas.map(area => {
    const count = rooms.filter(r => r.area === area).length;
    return { area, count };
  }).sort((a,b) => b.count - a.count).slice(0, 3);

  // Recent Rooms Added
  const recentRooms = [...rooms].sort((a, b) => b.dateAdded.localeCompare(a.dateAdded)).slice(0, 3);

  // Filtering Rooms List logic
  const filteredRooms = rooms.filter(room => {
    // Search input query
    const matchSearch =
      room.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (room.personalNotes && room.personalNotes.toLowerCase().includes(searchQuery.toLowerCase()));

    // Rent boundaries
    const rent = Number(room.monthlyRent) || 0;
    const matchRent = rent >= minRentInput && rent <= maxRentInput;

    // Sub-district Area
    const matchArea = areaFilter === '' || room.area === areaFilter;

    // Workplace commute radius
    const matchDistance = (Number(room.distanceToWorkplace) || 0) <= maxDistance;

    // Status matching
    const matchStatus = statusFilter === '' || room.status === statusFilter;

    // Amenities multiselect
    const matchAmenities = Object.keys(amenityFilters).every(key => {
      if (!amenityFilters[key]) return true;
      return room[key] === true;
    });

    // Wishlist filters
    let matchWishlist = true;
    if (wishlistFilter === 'favorite') matchWishlist = room.favorite;
    else if (wishlistFilter === 'topChoice') matchWishlist = room.topChoice;
    else if (wishlistFilter === 'bestValue') matchWishlist = room.bestValue;

    return matchSearch && matchRent && matchArea && matchDistance && matchStatus && matchAmenities && matchWishlist;
  });

  // Sorting Rooms list
  const sortedFilteredRooms = [...filteredRooms].sort((a, b) => {
    if (sortBy === 'lowest-rent') {
      return (Number(a.monthlyRent) || 0) - (Number(b.monthlyRent) || 0);
    }
    if (sortBy === 'highest-rent') {
      return (Number(b.monthlyRent) || 0) - (Number(a.monthlyRent) || 0);
    }
    if (sortBy === 'rating') {
      return (Number(b.rating) || 0) - (Number(a.rating) || 0);
    }
    if (sortBy === 'nearest') {
      return (Number(a.distanceToWorkplace) || 0) - (Number(b.distanceToWorkplace) || 0);
    }
    // newest dateAdded default
    return b.dateAdded.localeCompare(a.dateAdded);
  });

  // Export Data to CSV
  const handleExportCSV = () => {
    if (rooms.length === 0) return;
    
    // Define headers
    const headers = [
      'Room Name', 'Property Name', 'Monthly Rent (RM)', 'Deposit (RM)', 'Area', 'Address', 
      'Workplace Distance (km)', 'MRT Distance (km)', 'Status', 'Rating', 'Aircon', 'Bathroom', 'WiFi'
    ];

    const rows = rooms.map(r => [
      `"${r.roomName}"`,
      `"${r.propertyName}"`,
      r.monthlyRent,
      r.deposit,
      `"${r.area}"`,
      `"${r.fullAddress}"`,
      r.distanceToWorkplace,
      r.distanceToMrtLrt,
      `"${r.status}"`,
      r.rating,
      r.airCon ? 'Yes' : 'No',
      r.privateBathroom ? 'Yes' : 'No',
      r.internetIncluded ? 'Yes' : 'No'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Room_Rental_Tracker_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Data exported as CSV!');
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Layers size={24} />
          <span>Room Tracker</span>
        </div>

        <ul className="sidebar-menu">
          <li>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('rooms')}
              className={`sidebar-item ${activeTab === 'rooms' ? 'active' : ''}`}
            >
              <List size={18} /> Room Directory
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('compare')}
              className={`sidebar-item ${activeTab === 'compare' ? 'active' : ''}`}
            >
              <Award size={18} /> Comparison Grid
              {compareIds.length > 0 && (
                <span className="badge badge-success" style={{ marginLeft: 'auto' }}>
                  {compareIds.length}
                </span>
              )}
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`sidebar-item ${activeTab === 'expenses' ? 'active' : ''}`}
            >
              <Calculator size={18} /> Expense Planner
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`sidebar-item ${activeTab === 'calendar' ? 'active' : ''}`}
            >
              <CalendarIcon size={18} /> Schedule Calendar
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('statistics')}
              className={`sidebar-item ${activeTab === 'statistics' ? 'active' : ''}`}
            >
              <BarChart3 size={18} /> Analytics & Stats
            </button>
          </li>
        </ul>

        <div className="sidebar-footer">
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {theme === 'light' ? (
              <>
                <Moon size={16} /> Dark Appearance
              </>
            ) : (
              <>
                <Sun size={16} /> Light Appearance
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="main-content">
        
        {/* Sticky Glassmorphism Header */}
        <header className="header-glass">
          <div>
            <h1 style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>Room Rental Tracker</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Organize, score, and select your ideal rental home.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={handleExportCSV}>
              <Download size={16} /> Export CSV
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                setRoomToEditForm(null);
                setShowAddModal(true);
              }}
            >
              <Plus size={16} /> Add Room
            </button>
          </div>
        </header>

        {/* ==================== 1. DASHBOARD VIEW ==================== */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* Stat summaries grid */}
            <section className="stat-grid">
              <div className="stat-card">
                <div className="stat-card-header">
                  <span>Saved Rooms</span>
                  <div className="stat-card-icon-bg" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                    <Layers size={18} />
                  </div>
                </div>
                <div className="stat-card-value">{totalRooms}</div>
              </div>

              <div className="stat-card" style={{ '--primary': 'var(--accent-green)' }}>
                <div className="stat-card-header">
                  <span>Rooms Available</span>
                  <div className="stat-card-icon-bg" style={{ backgroundColor: 'var(--accent-green-light)', color: 'var(--accent-green)' }}>
                    <CheckCircle2 size={18} />
                  </div>
                </div>
                <div className="stat-card-value">{roomsAvailable}</div>
              </div>

              <div className="stat-card" style={{ '--primary': 'var(--accent-purple)' }}>
                <div className="stat-card-header">
                  <span>Contacted</span>
                  <div className="stat-card-icon-bg" style={{ backgroundColor: 'var(--accent-purple-light)', color: 'var(--accent-purple)' }}>
                    <Heart size={18} />
                  </div>
                </div>
                <div className="stat-card-value">{roomsContacted}</div>
              </div>

              <div className="stat-card" style={{ '--primary': 'var(--accent-yellow)' }}>
                <div className="stat-card-header">
                  <span>Visited</span>
                  <div className="stat-card-icon-bg" style={{ backgroundColor: 'var(--accent-yellow-light)', color: 'var(--accent-yellow)' }}>
                    <Star size={18} />
                  </div>
                </div>
                <div className="stat-card-value">{roomsVisited}</div>
              </div>
            </section>

            {/* Rent Prices Stats */}
            <section className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
              <div style={{ backgroundColor: 'var(--bg-surface)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Average Rent</span>
                  <h3 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginTop: '4px' }}>RM {avgRent}</h3>
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-surface)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lowest Rent</span>
                  <h3 style={{ fontSize: '1.5rem', color: 'var(--accent-green)', marginTop: '4px' }}>RM {minRent}</h3>
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-surface)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Highest Rent</span>
                  <h3 style={{ fontSize: '1.5rem', color: 'var(--accent-red)', marginTop: '4px' }}>RM {maxRent}</h3>
                </div>
              </div>
            </section>

            {/* Smart Score Custom Weights section */}
            <section style={{ backgroundColor: 'var(--bg-surface)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowWeightsEditor(!showWeightsEditor)}>
                <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} style={{ color: 'var(--primary)' }} />
                  Configure Smart Scoring Weights
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                  {showWeightsEditor ? 'Hide Weights Settings' : 'Adjust Priority Weights'}
                </span>
              </div>

              {showWeightsEditor && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                  {[
                    { key: 'rent', label: 'Monthly Rent' },
                    { key: 'distance', label: 'Transit Commute' },
                    { key: 'amenities', label: 'Facilities count' },
                    { key: 'size', label: 'Room Space Size' },
                    { key: 'furnished', label: 'Furnishing' },
                    { key: 'internet', label: 'WiFi Availability' },
                    { key: 'rating', label: 'Personal Rating' }
                  ].map(w => (
                    <div key={w.key} className="form-group">
                      <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{w.label}</span>
                        <strong>{scoringWeights[w.key]}%</strong>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="5"
                        value={scoringWeights[w.key]}
                        onChange={(e) => handleWeightChange(w.key, e.target.value)}
                        style={{ accentColor: 'var(--primary)', cursor: 'ew-resize' }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Lower dashboard split (Locations, Recents, and AI Card) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              
              {/* Popular Locations */}
              <div style={{ backgroundColor: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ marginBottom: '16px' }}>Top Rental Locations</h3>
                {favoriteLocations.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No location data yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {favoriteLocations.map(loc => (
                      <div key={loc.area} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)' }}>
                        <span style={{ fontWeight: 600 }}>{loc.area}</span>
                        <span className="badge badge-primary">{loc.count} listings</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Added listings */}
              <div style={{ backgroundColor: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ marginBottom: '16px' }}>Recent Additions</h3>
                {recentRooms.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No rooms added yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {recentRooms.map(room => (
                      <div key={room.id} onClick={() => setSelectedRoomDetail(room)} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '8px', cursor: 'pointer', borderRadius: 'var(--radius-md)' }} className="sidebar-item">
                        <img src={room.images?.[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} alt="" />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>{room.roomName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RM {room.monthlyRent} - {room.area}</div>
                        </div>
                        <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Features Sandbox */}
              <div style={{ backgroundColor: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--primary)', boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  <span className="badge badge-purple" style={{ textTransform: 'uppercase' }}>Preview</span>
                </div>
                <h3 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={18} style={{ color: 'var(--accent-purple)' }} /> Future AI Features
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px', lineHeight: '1.4' }}>
                  Mock sandbox demonstrating upcoming intelligent features for room rental optimization.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '8px', justifyContent: 'flex-start' }} onClick={() => alert('AI Extraction Demo:\nIn a future release, you will paste a URL (e.g. PropertyGuru) and the AI will auto-populate rent, address, MRT distance, and media details instantly.')}>
                    🔗 Extract Listing from URL
                  </button>
                  <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '8px', justifyContent: 'flex-start' }} onClick={() => alert('AI Screenshot OCR Demo:\nUpload screenshots of chats or property ads. AI OCR will scan and capture key specs (deposit, aircon, washer, parking) to create listings.')}>
                    📸 OCR Screenshot Scanner
                  </button>
                  <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '8px', justifyContent: 'flex-start' }} onClick={() => alert('AI Pros & Cons Summary:\nAI analyzes checklist items, landlord description, and reviews to output bulleted lists of Pros & Cons for each room.')}>
                    🤖 Generate Pros & Cons
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== 2. ROOM LIST VIEW ==================== */}
        {activeTab === 'rooms' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Filters Dashboard Panel */}
            <section className="filters-bar">
              <div className="filters-row">
                {/* Search input */}
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label">Search Room, Property or Notes</label>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Bangsar, balcony, cozy..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ paddingLeft: '38px', width: '100%' }}
                    />
                  </div>
                </div>

                {/* Sub-district Area Filter */}
                <div className="form-group">
                  <label className="form-label">Location Area</label>
                  <select className="form-select" value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}>
                    <option value="">-- All Areas --</option>
                    {uniqueAreas.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>

                {/* Commute Distance slider */}
                <div className="form-group">
                  <label className="form-label">Max Commute: {maxDistance} km</label>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(Number(e.target.value))}
                    style={{ accentColor: 'var(--primary)', cursor: 'ew-resize' }}
                  />
                </div>

                {/* Status selector */}
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">-- All Statuses --</option>
                    <option value="Interested">Interested</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Viewing Scheduled">Viewing Scheduled</option>
                    <option value="Viewed">Viewed</option>
                    <option value="Negotiating">Negotiating</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Booked">Booked</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Sorting and Wishlist row */}
              <div className="filters-row" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', justifyContent: 'space-between' }}>
                {/* Wishlists bookmarks */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { id: 'all', label: 'All Saved' },
                    { id: 'favorite', label: '❤️ Favorites' },
                    { id: 'topChoice', label: '⭐ Top Choice' },
                    { id: 'bestValue', label: '🏆 Best Value' }
                  ].map(w => (
                    <button
                      key={w.id}
                      className={`btn ${wishlistFilter === w.id ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: 'var(--radius-full)' }}
                      onClick={() => setWishlistFilter(w.id)}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>

                {/* Sorting Select */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ArrowUpDown size={14} style={{ color: 'var(--text-muted)' }} />
                  <select
                    className="form-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    <option value="newest">Newest Added</option>
                    <option value="lowest-rent">Rent: Lowest first</option>
                    <option value="highest-rent">Rent: Highest first</option>
                    <option value="rating">Highest Rating</option>
                    <option value="nearest">Nearest Commute</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Room Cards Grid Layout */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Results ({sortedFilteredRooms.length})</h3>
              {compareIds.length > 0 && (
                <button className="btn btn-primary" onClick={() => setActiveTab('compare')} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                  View Comparison matrix ({compareIds.length})
                </button>
              )}
            </div>

            {sortedFilteredRooms.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                <SlidersHorizontal size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                <h3>No Listings match your filters</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
                  Try relaxing your distance range, search term or rental budget.
                </p>
              </div>
            ) : (
              <div className="rooms-grid">
                {sortedFilteredRooms.map(room => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    isCompared={compareIds.includes(room.id)}
                    onToggleCompare={handleToggleCompare}
                    onToggleWishlist={handleToggleWishlist}
                    onViewDetails={setSelectedRoomDetail}
                    scoringWeights={scoringWeights}
                    minRent={minRent}
                    maxRent={maxRent}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== 3. COMPARE VIEW ==================== */}
        {activeTab === 'compare' && (
          <ComparePanel
            rooms={rooms}
            selectedIds={compareIds}
            onToggleSelect={handleToggleCompare}
            onBack={() => setActiveTab('rooms')}
            scoringWeights={scoringWeights}
          />
        )}

        {/* ==================== 4. EXPENSES CALC VIEW ==================== */}
        {activeTab === 'expenses' && (
          <ExpenseCalculator rooms={rooms} />
        )}

        {/* ==================== 5. CALENDAR VIEW ==================== */}
        {activeTab === 'calendar' && (
          <CalendarTab
            rooms={rooms}
            reminders={reminders}
            onAddReminder={handleAddReminder}
            onRemoveReminder={handleRemoveReminder}
            onToggleReminderComplete={handleToggleReminderComplete}
          />
        )}

        {/* ==================== 6. STATISTICS VIEW ==================== */}
        {activeTab === 'statistics' && (
          <StatisticsTab rooms={rooms} />
        )}

      </main>

      {/* Mobile Sticky Bottom Nav (Hidden on desktop via CSS) */}
      <nav className="mobile-bottom-nav">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`mobile-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => setActiveTab('rooms')}
          className={`mobile-nav-item ${activeTab === 'rooms' ? 'active' : ''}`}
        >
          <List size={20} />
          <span>List</span>
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`mobile-nav-item ${activeTab === 'expenses' ? 'active' : ''}`}
        >
          <Calculator size={20} />
          <span>Budget</span>
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`mobile-nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
        >
          <CalendarIcon size={20} />
          <span>Calendar</span>
        </button>
      </nav>

      {/* Modal - Add / Edit Room */}
      {showAddModal && (
        <AddRoomModal
          roomToEdit={roomToEditForm}
          onClose={() => {
            setShowAddModal(false);
            setRoomToEditForm(null);
          }}
          onSave={handleSaveRoom}
        />
      )}

      {/* Modal - Room Detail Page overlay */}
      {selectedRoomDetail && (
        <RoomDetailModal
          room={selectedRoomDetail}
          onClose={() => setSelectedRoomDetail(null)}
          onUpdateRoom={handleUpdateRoomDirect}
          onDeleteRoom={handleDeleteRoom}
          onEditRoomForm={handleEditRoomForm}
          scoringWeights={scoringWeights}
          minRent={minRent}
          maxRent={maxRent}
        />
      )}

      {/* Toast Alert Popups */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
