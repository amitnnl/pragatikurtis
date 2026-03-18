import React from 'react';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
    {children}
  </div>
);

export const SalesTrendChart = ({ stats }) => {
  if (!stats || !stats.trend || !Array.isArray(stats.trend) || stats.trend.length === 0) {
    return null; // Or render a loading/empty state message
  }
  const data = {
    labels: stats.trend.map(d => d.day),
    datasets: [{
      label: 'Sales',
      data: stats.trend.map(d => d.total),
      borderColor: '#4f46e5',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      tension: 0.4,
      fill: true,
    }]
  };
  return (
    <Card className="lg:col-span-2 p-8">
      <h3 className="font-bold text-gray-900 mb-4">7-Day Sales Trend</h3>
      <div style={{ height: '300px' }}>
        <Line data={data} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
    </Card>
  );
};

export const OrderStatusChart = ({ stats }) => {
  if (!stats || !stats.order_status || !Array.isArray(stats.order_status) || stats.order_status.length === 0) {
    return null; // Or render a loading/empty state message
  }
  const data = {
    labels: stats.order_status.map(s => s.status),
    datasets: [{
      data: stats.order_status.map(s => s.count),
      backgroundColor: ['#facc15', '#38bdf8', '#4ade80', '#f43f5e', '#a78bfa', '#9ca3af'],
    }]
  };
  return (
    <Card className="p-8">
      <h3 className="font-bold text-gray-900 mb-4">Order Status</h3>
      <div style={{ height: '300px' }}>
        <Doughnut data={data} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
    </Card>
  );
};

export const TopProductsChart = ({ stats }) => {
  if (!stats || !stats.top_products || !Array.isArray(stats.top_products) || stats.top_products.length === 0) {
    return null; // Or render a loading/empty state message
  }
  const data = {
    labels: stats.top_products.map(p => p.name),
    datasets: [{
      label: 'Quantity Sold',
      data: stats.top_products.map(p => p.total_sold),
      backgroundColor: 'rgba(139, 92, 246, 0.6)',
      borderColor: '#8B5CF6',
      borderWidth: 1,
    }]
  };
  return (
    <Card className="p-8">
      <h3 className="font-bold text-gray-900 mb-4">Top 5 Selling Products</h3>
      <Bar data={data} options={{ responsive: true, maintainAspectRatio: true, indexAxis: 'y' }} />
    </Card>
  );
};
