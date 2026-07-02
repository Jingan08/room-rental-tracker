import React, { useState, useEffect } from 'react';
import { HelpCircle, Sparkles, AlertCircle } from 'lucide-react';
import CustomTags from './CustomTags';

const INITIAL_ROOM_STATE = {
  roomName: '',
  propertyName: '',
  monthlyRent: 600,
  deposit: 1200,
  advanceRental: 600,
  utilitiesCost: 50,
  internetIncluded: false,
  airCon: false,
  privateBathroom: false,
  parking: false,
  washingMachine: false,
  kitchen: false,
  refrigerator: false,
  wardrobe: false,
  studyTable: false,
  bedSize: 'Queen',
  roomSize: 120,
  fullAddress: '',
  area: '',
  city: '',
  state: '',
  googleMapsLink: '',
  distanceToWorkplace: 5,
  distanceToMrtLrt: 0.8,
  distanceToBusStop: 0.2,
  ownerName: '',
  agentName: '',
  phoneNumber: '',
  whatsApp: '',
  email: '',
  sourceWebsite: '',
  listingUrl: '',
  datePosted: '',
  expiryDate: '',
  images: [''],
  videoUrl: '',
  floorPlanUrl: '',
  personalNotes: '### Observations:\n* \n\n### Checklist:\n* [ ] Call owner\n* [ ] Inspect room\n* [ ] Negotiate deposit',
  status: 'Interested',
  rating: 3,
  favorite: false,
  topChoice: false,
  bestValue: false,
  tags: []
};

export default function AddRoomModal({ roomToEdit, onClose, onSave }) {
  const [formState, setFormState] = useState(INITIAL_ROOM_STATE);
  const [activeFormTab, setActiveFormTab] = useState('basic');
  const [imageUrlInputs, setImageUrlInputs] = useState(['']);

  useEffect(() => {
    if (roomToEdit) {
      setFormState({ ...INITIAL_ROOM_STATE, ...roomToEdit });
      setImageUrlInputs(roomToEdit.images && roomToEdit.images.length > 0 ? roomToEdit.images : ['']);
    } else {
      setFormState(INITIAL_ROOM_STATE);
      setImageUrlInputs(['']);
    }
  }, [roomToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  const handleImageInputUpdate = (index, value) => {
    const updated = [...imageUrlInputs];
    updated[index] = value;
    setImageUrlInputs(updated);
  };

  const handleAddImageUrlField = () => {
    setImageUrlInputs([...imageUrlInputs, '']);
  };

  const handleRemoveImageUrlField = (index) => {
    setImageUrlInputs(imageUrlInputs.filter((_, idx) => idx !== index));
  };

  const handleTagsChange = (tags) => {
    setFormState(prev => ({ ...prev, tags }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.roomName || !formState.propertyName) {
      alert('Please fill in Room Name and Property Name.');
      return;
    }

    // Filter out blank images
    const cleanImages = imageUrlInputs.filter(url => url.trim() !== '');

    const finalRoom = {
      ...formState,
      id: roomToEdit ? roomToEdit.id : `room-${Date.now()}`,
      images: cleanImages.length > 0 ? cleanImages : ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'],
      dateAdded: roomToEdit ? roomToEdit.dateAdded : new Date().toISOString(),
      whatsApp: formState.phoneNumber ? `https://wa.me/${formState.phoneNumber.replace(/[^\d]/g, '')}` : '',
      // Add initial timeline item if this is a new room
      timeline: roomToEdit ? formState.timeline : [
        {
          status: formState.status,
          date: new Date().toISOString(),
          note: `Listing added with status: ${formState.status}`
        }
      ]
    };

    onSave(finalRoom);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        
        {/* Header */}
        <div className="modal-header">
          <h3>{roomToEdit ? 'Edit Room Listing' : 'Add New Room Listing'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>
            &times;
          </button>
        </div>

        {/* Multi-step Form Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)', padding: '0 20px', overflowX: 'auto' }}>
          {[
            { id: 'basic', label: '1. Basic Info' },
            { id: 'amenities', label: '2. Amenities' },
            { id: 'location', label: '3. Location & Transit' },
            { id: 'contact', label: '4. Contact & Media' },
            { id: 'notes', label: '5. Notes & Tags' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFormTab(tab.id)}
              style={{
                padding: '12px 16px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: activeFormTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: activeFormTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Element */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ minHeight: '380px' }}>

            {/* TAB 1: Basic Info */}
            {activeFormTab === 'basic' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Room Title Name *</label>
                    <input
                      type="text"
                      name="roomName"
                      className="form-input"
                      placeholder="e.g. Cozy Balcony Room"
                      value={formState.roomName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Property Name *</label>
                    <input
                      type="text"
                      name="propertyName"
                      className="form-input"
                      placeholder="e.g. Skyline Condominium"
                      value={formState.propertyName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Monthly Rent (RM) *</label>
                    <input
                      type="number"
                      name="monthlyRent"
                      className="form-input"
                      value={formState.monthlyRent}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Deposit (RM)</label>
                    <input
                      type="number"
                      name="deposit"
                      className="form-input"
                      value={formState.deposit}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Advance Rent (RM)</label>
                    <input
                      type="number"
                      name="advanceRental"
                      className="form-input"
                      value={formState.advanceRental}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Utilities Fee (RM)</label>
                    <input
                      type="number"
                      name="utilitiesCost"
                      className="form-input"
                      value={formState.utilitiesCost}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Bed Size</label>
                    <select name="bedSize" className="form-select" value={formState.bedSize} onChange={handleChange}>
                      <option value="Single">Single Bed</option>
                      <option value="Super Single">Super Single Bed</option>
                      <option value="Queen">Queen Bed</option>
                      <option value="King">King Bed</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Room Size (sqft)</label>
                    <input
                      type="number"
                      name="roomSize"
                      className="form-input"
                      value={formState.roomSize}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Furnishing Status</label>
                    <select name="furnishedStatus" className="form-select" value={formState.furnishedStatus} onChange={handleChange}>
                      <option value="Fully Furnished">Fully Furnished</option>
                      <option value="Semi-Furnished">Semi-Furnished</option>
                      <option value="Unfurnished">Unfurnished</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Tracking Status</label>
                    <select name="status" className="form-select" value={formState.status} onChange={handleChange}>
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
                  <div className="form-group">
                    <label className="form-label">Personal Rating (1-5)</label>
                    <select name="rating" className="form-select" value={formState.rating} onChange={handleChange}>
                      <option value={1}>⭐ (Poor)</option>
                      <option value={2}>⭐⭐ (Average)</option>
                      <option value={3}>⭐⭐⭐ (Good)</option>
                      <option value={4}>⭐⭐⭐⭐ (Very Good)</option>
                      <option value={5}>⭐⭐⭐⭐⭐ (Excellent)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Amenities */}
            {activeFormTab === 'amenities' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Select Included Conveniences</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
                  {[
                    { name: 'airCon', label: 'Air Conditioning' },
                    { name: 'privateBathroom', label: 'Private Bathroom' },
                    { name: 'parking', label: 'Parking Space Included' },
                    { name: 'washingMachine', label: 'Washing Machine' },
                    { name: 'kitchen', label: 'Kitchen (Cooking allowed)' },
                    { name: 'refrigerator', label: 'Refrigerator' },
                    { name: 'wardrobe', label: 'Wardrobe Closet' },
                    { name: 'studyTable', label: 'Study Table & Chair' },
                    { name: 'internetIncluded', label: 'WiFi / Internet Included' }
                  ].map(amenity => (
                    <label key={amenity.name} className="form-group-checkbox" style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                      <input
                        type="checkbox"
                        name={amenity.name}
                        checked={formState[amenity.name] || false}
                        onChange={handleChange}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                      />
                      <span style={{ fontWeight: 500 }}>{amenity.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Location */}
            {activeFormTab === 'location' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Full Address</label>
                  <input
                    type="text"
                    name="fullAddress"
                    className="form-input"
                    placeholder="e.g. Unit 22-05, block B, Sky Villa, Kuala Lumpur"
                    value={formState.fullAddress}
                    onChange={handleChange}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Area (Sub-district)</label>
                    <input
                      type="text"
                      name="area"
                      className="form-input"
                      placeholder="e.g. Bangsar, Cheras"
                      value={formState.area}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      name="city"
                      className="form-input"
                      placeholder="e.g. Kuala Lumpur"
                      value={formState.city}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      name="state"
                      className="form-input"
                      placeholder="e.g. Selangor"
                      value={formState.state}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Google Maps Link</label>
                  <input
                    type="url"
                    name="googleMapsLink"
                    className="form-input"
                    placeholder="https://maps.google.com/?q=..."
                    value={formState.googleMapsLink}
                    onChange={handleChange}
                  />
                </div>

                <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginTop: '12px' }}>Commute & Transit Distances</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">To Work/School (km)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="distanceToWorkplace"
                      className="form-input"
                      value={formState.distanceToWorkplace}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">To LRT/MRT Station (km)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="distanceToMrtLrt"
                      className="form-input"
                      value={formState.distanceToMrtLrt}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">To Bus Stop (km)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="distanceToBusStop"
                      className="form-input"
                      value={formState.distanceToBusStop}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Contact & Media */}
            {activeFormTab === 'contact' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Owner / Agent Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Owner Name</label>
                    <input
                      type="text"
                      name="ownerName"
                      className="form-input"
                      value={formState.ownerName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Agent Name & Agency</label>
                    <input
                      type="text"
                      name="agentName"
                      className="form-input"
                      placeholder="e.g. John (IQI Realty)"
                      value={formState.agentName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Phone / WhatsApp Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      className="form-input"
                      placeholder="e.g. +60123456789"
                      value={formState.phoneNumber}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      value={formState.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginTop: '12px' }}>Listing Source Web Link</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Source Website Name</label>
                    <input
                      type="text"
                      name="sourceWebsite"
                      className="form-input"
                      placeholder="e.g. PropertyGuru, iProperty"
                      value={formState.sourceWebsite}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Listing Link URL</label>
                    <input
                      type="url"
                      name="listingUrl"
                      className="form-input"
                      placeholder="https://..."
                      value={formState.listingUrl}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginTop: '12px' }}>Photos (Image URLs)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {imageUrlInputs.map((url, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="url"
                        className="form-input"
                        placeholder="Paste image URL (Unsplash, imgur, etc.)"
                        value={url}
                        onChange={(e) => handleImageInputUpdate(idx, e.target.value)}
                        style={{ flex: 1 }}
                      />
                      {imageUrlInputs.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-danger"
                          style={{ padding: '8px 12px' }}
                          onClick={() => handleRemoveImageUrlField(idx)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleAddImageUrlField}
                    style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    + Add More Photo URLs
                  </button>
                </div>
              </div>
            )}

            {/* TAB 5: Notes & Tags */}
            {activeFormTab === 'notes' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <CustomTags selectedTags={formState.tags} onChange={handleTagsChange} />
                
                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label className="form-label">Personal Observations & Markdown Checklist</label>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Type markdown headers (e.g. <code>### Features</code>) or interactive tasks list checkmarks (e.g. <code>* [ ] Call agent</code> or <code>* [x] Viewed unit</code>).
                  </p>
                  <textarea
                    name="personalNotes"
                    className="form-input"
                    rows={8}
                    value={formState.personalNotes}
                    onChange={handleChange}
                    style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Listing details
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
