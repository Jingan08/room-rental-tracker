import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { AMENITIES_LIST } from '../utils/scoring';
import { TrendingUp, BarChart3, PieChart } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function StatisticsTab({ rooms = [] }) {
  if (rooms.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        <BarChart3 size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
        <h3>No Room Data Available</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Please add room listings on the dashboard to visualize statistics.
        </p>
      </div>
    );
  }

  // 1. Rent by Area (Average Rent grouped by Area)
  const areaGroups = {};
  rooms.forEach(room => {
    const area = room.area || 'Unknown';
    const rent = Number(room.monthlyRent) || 0;
    if (!areaGroups[area]) {
      areaGroups[area] = { sum: 0, count: 0 };
    }
    areaGroups[area].sum += rent;
    areaGroups[area].count += 1;
  });

  const areas = Object.keys(areaGroups);
  const avgRents = areas.map(area => Math.round(areaGroups[area].sum / areaGroups[area].count));

  const rentByAreaColors = areas.map((_, i) => `hsla(${220 + (i * 30) % 140}, 90%, 55%, 0.75)`);
  const rentByAreaBorderColors = areas.map((_, i) => `hsla(${220 + (i * 30) % 140}, 90%, 55%, 1)`);

  const rentByAreaData = {
    labels: areas,
    datasets: [
      {
        label: 'Average Rent (RM)',
        data: avgRents,
        backgroundColor: rentByAreaColors,
        borderColor: rentByAreaBorderColors,
        borderWidth: 1,
        borderRadius: 8
      }
    ]
  };

  // 2. Status Distribution (Count of rooms by status)
  const statusCounts = {};
  rooms.forEach(room => {
    const status = room.status || 'Interested';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  const statuses = Object.keys(statusCounts);
  const statusValues = Object.values(statusCounts);

  const statusColors = [
    '#3b82f6', // Blue (Interested)
    '#a78bfa', // Purple (Contacted)
    '#ec4899', // Pink (Viewing Scheduled)
    '#f59e0b', // Amber (Viewed)
    '#6366f1', // Indigo (Negotiating)
    '#f87171', // Red (Rejected)
    '#10b981', // Emerald (Shortlisted)
    '#059669'  // Dark green (Booked)
  ];

  const statusData = {
    labels: statuses,
    datasets: [
      {
        data: statusValues,
        backgroundColor: statusColors.slice(0, statuses.length),
        borderWidth: 1,
        borderColor: 'var(--bg-surface)'
      }
    ]
  };

  // 3. Most Common Amenities
  const amenityCounts = {};
  AMENITIES_LIST.forEach(key => {
    amenityCounts[key] = 0;
  });

  rooms.forEach(room => {
    AMENITIES_LIST.forEach(key => {
      if (room[key] === true) {
        amenityCounts[key] += 1;
      }
    });
  });

  // Human readable amenity labels
  const amenityLabelsMap = {
    airCon: 'Air Conditioning',
    privateBathroom: 'Private Bathroom',
    parking: 'Parking Lot',
    washingMachine: 'Washing Machine',
    kitchen: 'Kitchen Access',
    refrigerator: 'Refrigerator',
    wardrobe: 'Wardrobe',
    studyTable: 'Study Table'
  };

  const amenities = AMENITIES_LIST.map(key => amenityLabelsMap[key]);
  const counts = AMENITIES_LIST.map(key => amenityCounts[key]);

  const amenitiesData = {
    labels: amenities,
    datasets: [
      {
        label: 'Number of Rooms',
        data: counts,
        backgroundColor: 'rgba(139, 92, 246, 0.75)', // Violet
        borderColor: 'var(--accent-purple)',
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  };

  // 4. Rent vs Distance Trend Line (Sort rooms by commute distance to display a trend)
  const sortedRooms = [...rooms].sort((a, b) => (Number(a.distanceToWorkplace) || 0) - (Number(b.distanceToWorkplace) || 0));
  const distances = sortedRooms.map(r => `${r.distanceToWorkplace} km`);
  const rentsForDistance = sortedRooms.map(r => Number(r.monthlyRent) || 0);

  const rentTrendData = {
    labels: distances,
    datasets: [
      {
        label: 'Rent by Commute Distance',
        data: rentsForDistance,
        fill: false,
        borderColor: 'var(--primary)',
        backgroundColor: 'var(--primary)',
        tension: 0.25,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  };

  // Common chart option parameters
  const getOptions = (titleText) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'var(--text-main)',
          font: { family: 'Outfit', size: 11 }
        }
      },
      title: {
        display: false,
        text: titleText,
        color: 'var(--text-main)',
        font: { family: 'Outfit', size: 14, weight: 'bold' }
      }
    },
    scales: {
      x: {
        grid: { color: 'var(--border-color)' },
        ticks: { color: 'var(--text-muted)', font: { family: 'Outfit', size: 10 } }
      },
      y: {
        grid: { color: 'var(--border-color)' },
        ticks: { color: 'var(--text-muted)', font: { family: 'Outfit', size: 10 } }
      }
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h2>Rental Market Statistics</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Analyze average room rental values, amenity counts, and status breakdowns from your saved room listings.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Rent by Area Bar Chart */}
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} style={{ color: 'var(--primary)' }} /> Average Rent by Area
          </h3>
          <div style={{ flex: 1, position: 'relative' }}>
            <Bar data={rentByAreaData} options={getOptions('Average Rent by Area')} />
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={18} style={{ color: 'var(--accent-green)' }} /> Rooms Status Distribution
          </h3>
          <div style={{ flex: 1, position: 'relative' }}>
            <Pie
              data={statusData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      color: 'var(--text-main)',
                      font: { family: 'Outfit', size: 11 }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Most Common Amenities horizontal chart */}
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} style={{ color: 'var(--accent-purple)' }} /> Frequency of Amenities
          </h3>
          <div style={{ flex: 1, position: 'relative' }}>
            <Bar
              data={amenitiesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  x: {
                    grid: { color: 'var(--border-color)' },
                    ticks: { precision: 0, color: 'var(--text-muted)', font: { family: 'Outfit' } }
                  },
                  y: {
                    grid: { display: false },
                    ticks: { color: 'var(--text-main)', font: { family: 'Outfit', size: 10 } }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Rent vs Commute Distance Line Chart */}
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} style={{ color: 'var(--primary)' }} /> Rent Trend by Commute Distance
          </h3>
          <div style={{ flex: 1, position: 'relative' }}>
            <Line
              data={rentTrendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      title: function (context) {
                        const index = context[0].dataIndex;
                        return sortedRooms[index].roomName;
                      },
                      label: function (context) {
                        const index = context.dataIndex;
                        const room = sortedRooms[index];
                        return ` RM ${room.monthlyRent} (${room.distanceToWorkplace}km, ${room.area})`;
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    title: { display: true, text: 'Commute Distance', color: 'var(--text-muted)' },
                    grid: { color: 'var(--border-color)' },
                    ticks: { color: 'var(--text-muted)' }
                  },
                  y: {
                    title: { display: true, text: 'Rent (RM)', color: 'var(--text-muted)' },
                    grid: { color: 'var(--border-color)' },
                    ticks: { color: 'var(--text-muted)' }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
