import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

const SUGGESTED_TAGS = [
  'Near MRT',
  'Walking Distance',
  'Quiet Area',
  'New Unit',
  'Female Only',
  'Male Only',
  'Pet Friendly',
  'No Agent Fee',
  'High Floor',
  'Corner Unit'
];

export default function CustomTags({ selectedTags = [], onChange }) {
  const [newTagInput, setNewTagInput] = useState('');

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter(t => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = (e) => {
    e.preventDefault();
    const cleanTag = newTagInput.trim();
    if (cleanTag && !selectedTags.includes(cleanTag)) {
      onChange([...selectedTags, cleanTag]);
      setNewTagInput('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <label className="form-label">Tags & Labels</label>
      
      {/* Active Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {selectedTags.map(tag => (
          <span
            key={tag}
            className="badge badge-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '0.8rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              cursor: 'pointer'
            }}
            onClick={() => toggleTag(tag)}
          >
            {tag}
            <X size={14} style={{ display: 'inline-block' }} />
          </span>
        ))}
      </div>

      {/* Suggested Quick Tags */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          Suggested tags (click to select):
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {SUGGESTED_TAGS.filter(tag => !selectedTags.includes(tag)).map(tag => (
            <button
              key={tag}
              type="button"
              className="btn btn-secondary"
              style={{
                padding: '4px 10px',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 500
              }}
              onClick={() => toggleTag(tag)}
            >
              + {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Add Input */}
      <form onSubmit={handleAddCustomTag} style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Add custom tag (e.g. Balcony)"
          value={newTagInput}
          onChange={(e) => setNewTagInput(e.target.value)}
          style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
        />
        <button
          type="submit"
          className="btn btn-secondary"
          style={{ padding: '8px 14px', borderRadius: 'var(--radius-md)' }}
        >
          <Plus size={16} />
          Add
        </button>
      </form>
    </div>
  );
}
