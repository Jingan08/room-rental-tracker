import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { DollarSign, Wallet, Car, Utensils, Wifi, HelpCircle } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ExpenseCalculator({ rooms = [] }) {
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0]?.id || '');
  const [rent, setRent] = useState(0);
  const [utilities, setUtilities] = useState(0);
  const [parking, setParking] = useState(0);
  const [internet, setInternet] = useState(0);
  const [transportation, setTransportation] = useState(150); // Default transit cost
  const [foodBudget, setFoodBudget] = useState(400); // Default food cost

  // Update form fields when selected room changes
  useEffect(() => {
    if (selectedRoomId) {
      const room = rooms.find(r => r.id === selectedRoomId);
      if (room) {
        setRent(Number(room.monthlyRent) || 0);
        setUtilities(Number(room.utilitiesCost) || 0);
        setParking(room.parking ? 50 : 0); // Estimate parking space cost if included or not
        setInternet(room.internetIncluded ? 0 : 80); // Estimate internet cost if not included
      }
    } else {
      setRent(0);
      setUtilities(0);
      setParking(0);
      setInternet(0);
    }
  }, [selectedRoomId, rooms]);

  const totalMonthlyExpenses = rent + utilities + parking + internet + transportation + foodBudget;

  // ChartJS configuration
  const chartData = {
    labels: ['Rent', 'Utilities', 'Parking', 'Internet', 'Transportation', 'Food Budget'],
    datasets: [
      {
        label: 'Monthly Expenses (RM)',
        data: [rent, utilities, parking, internet, transportation, foodBudget],
        backgroundColor: [
          '#0f62fe', // Rent (Blue)
          '#8b5cf6', // Utilities (Purple)
          '#fbbf24', // Parking (Amber)
          '#ec4899', // Internet (Pink)
          '#10b981', // Transportation (Emerald)
          '#f97316'  // Food (Orange)
        ],
        borderWidth: 1,
        borderColor: 'var(--bg-surface)'
      }
    ]
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'var(--text-main)',
          font: {
            family: 'Outfit',
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const val = context.raw || 0;
            const pct = totalMonthlyExpenses ? ((val / totalMonthlyExpenses) * 100).toFixed(1) : 0;
            return ` RM ${val} (${pct}%)`;
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2>Living Expense Calculator</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Evaluate the total cost of living by combining room rent with utilities, transportation, and food budgets.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Input Form Card */}
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wallet size={20} className="text-blue-500" style={{ color: 'var(--primary)' }} /> Configure Monthly Budget
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Select Room */}
            <div className="form-group">
              <label className="form-label">Link to Room Listing</label>
              <select
                className="form-select"
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
              >
                <option value="">-- Custom (No linked room) --</option>
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.roomName} (RM {r.monthlyRent})
                  </option>
                ))}
              </select>
            </div>

            {/* Rent Input */}
            <div className="form-group">
              <label className="form-label">Monthly Rent (RM)</label>
              <input
                type="number"
                className="form-input"
                value={rent}
                onChange={(e) => setRent(Math.max(0, Number(e.target.value)))}
              />
            </div>

            {/* Utilities Input */}
            <div className="form-group">
              <label className="form-label">Estimated Utilities (RM)</label>
              <input
                type="number"
                className="form-input"
                value={utilities}
                onChange={(e) => setUtilities(Math.max(0, Number(e.target.value)))}
              />
            </div>

            {/* Parking Input */}
            <div className="form-group">
              <label className="form-label">Parking Cost (RM)</label>
              <input
                type="number"
                className="form-input"
                value={parking}
                onChange={(e) => setParking(Math.max(0, Number(e.target.value)))}
              />
            </div>

            {/* Internet Input */}
            <div className="form-group">
              <label className="form-label">Internet / WiFi Cost (RM)</label>
              <input
                type="number"
                className="form-input"
                value={internet}
                onChange={(e) => setInternet(Math.max(0, Number(e.target.value)))}
              />
            </div>

            {/* Commute/Transportation Input */}
            <div className="form-group">
              <label className="form-label">Transportation / Commuting (RM)</label>
              <input
                type="number"
                className="form-input"
                value={transportation}
                onChange={(e) => setTransportation(Math.max(0, Number(e.target.value)))}
              />
            </div>

            {/* Food budget Input */}
            <div className="form-group">
              <label className="form-label">Food / Grocery Budget (RM)</label>
              <input
                type="number"
                className="form-input"
                value={foodBudget}
                onChange={(e) => setFoodBudget(Math.max(0, Number(e.target.value)))}
              />
            </div>
          </div>
        </div>

        {/* Breakdown Display Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Total Box */}
          <div
            style={{
              backgroundColor: 'var(--primary-light)',
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(15, 98, 254, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Total Projected Cost
              </span>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
                RM {totalMonthlyExpenses}
                <span style={{ fontSize: '1rem', fontWeight: 500 }}> / month</span>
              </div>
            </div>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <DollarSign size={28} style={{ color: 'var(--primary)' }} />
            </div>
          </div>

          {/* Chart Area */}
          <div
            style={{
              flex: 1,
              backgroundColor: 'var(--bg-surface)',
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '300px'
            }}
          >
            <h3 style={{ marginBottom: '16px' }}>Expense Share Breakdown</h3>
            <div style={{ position: 'relative', flex: 1, minHeight: '220px' }}>
              {totalMonthlyExpenses === 0 ? (
                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  Enter values in the budget builder to display visualization.
                </div>
              ) : (
                <Doughnut data={chartData} options={chartOptions} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
