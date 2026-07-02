import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    success: <CheckCircle size={18} className="text-green-500" style={{ color: 'var(--accent-green)' }} />,
    error: <XCircle size={18} className="text-red-500" style={{ color: 'var(--accent-red)' }} />,
    warning: <AlertTriangle size={18} className="text-amber-500" style={{ color: 'var(--accent-yellow)' }} />,
    info: <Info size={18} className="text-blue-500" style={{ color: 'var(--primary)' }} />
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success': return 'var(--accent-green)';
      case 'error': return 'var(--accent-red)';
      case 'warning': return 'var(--accent-yellow)';
      default: return 'var(--primary)';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        backgroundColor: 'var(--bg-surface)',
        borderLeft: `4px solid ${getBorderColor()}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 2000,
        maxWidth: '380px',
        animation: 'slideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div>{icons[type]}</div>
      <div style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-main)' }}>
        {message}
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2px',
          borderRadius: '50%'
        }}
        onMouseEnter={(e) => e.target.style.color = 'var(--text-main)'}
        onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
      >
        <X size={16} />
      </button>
    </div>
  );
}
