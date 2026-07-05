'use client';

import React, { useEffect, useState } from 'react';
import { dashboardApi } from '@/lib/api';
import { DashboardStats, ApiErrorClass } from '@/lib/api/types';

interface DashboardStatsDisplayProps {
  refreshInterval?: number; // ms, 0 = no auto-refresh
}

export const DashboardStatsDisplay: React.FC<DashboardStatsDisplayProps> = ({
  refreshInterval = 300000, // 5 minutes default
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setError(null);
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (err) {
      const error = err as ApiErrorClass;
      setError(error.message || 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (!stats) return null;

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const StatCard = ({
    title,
    value,
    icon,
    subtext,
  }: {
    title: string;
    value: string | number;
    icon: string;
    subtext?: string;
  }) => (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {subtext && (
            <p className="text-xs text-gray-500 mt-1">{subtext}</p>
          )}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Completed Trips"
          value={stats.completed_trips}
          icon="✈️"
          subtext="Created"
        />
        <StatCard
          title="Active Bookings"
          value={stats.active_bookings}
          icon="📦"
          subtext="In progress"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.total_revenue)}
          icon="💰"
          subtext="All time"
        />
        <StatCard
          title="Pending Payouts"
          value={formatCurrency(stats.pending_payouts)}
          icon="⏳"
          subtext="Awaiting release"
        />
        <StatCard
          title="Wallet Balance"
          value={formatCurrency(stats.wallet_balance)}
          icon="💳"
          subtext="Available"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={fetchStats}
          disabled={loading}
          className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 transition"
        >
          🔄 Refresh
        </button>
      </div>
    </div>
  );
};

export default DashboardStatsDisplay;
