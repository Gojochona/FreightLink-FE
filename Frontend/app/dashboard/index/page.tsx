'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/dashboard/header';
import DashboardStats from "@/components/DashboardStats";
import { DisputesList } from '@/components/DisputesList';
import { dashboardApi, disputesApi } from '@/lib/api';
import { Dispute, ApiErrorClass } from '@/lib/api/types';
import { Loader } from 'lucide-react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'disputes'>('overview');
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [disputesLoading, setDisputesLoading] = useState(false);
  const [disputesError, setDisputesError] = useState<string | null>(null);

  // Fetch disputes when disputes tab is active
  useEffect(() => {
    if (activeTab === 'disputes') {
      fetchDisputes();
    }
  }, [activeTab]);

  const fetchDisputes = async () => {
    setDisputesLoading(true);
    setDisputesError(null);
    try {
      const data = await disputesApi.listDisputes();
      setDisputes(data);
    } catch (err) {
      const error = err as ApiErrorClass;
      setDisputesError(error.message || 'Failed to load disputes');
    } finally {
      setDisputesLoading(false);
    }
  };

  return (
    <>
      <Header title="Dashboard" subtitle="Your logistics overview" />
      
      <div className="p-6 space-y-6">
        {/* Tab Navigation */}
        <div className="flex gap-4 border-b">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('disputes')}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 'disputes'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Disputes
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
              <DashboardStats refreshInterval={300000} />
            </div>
          </div>
        )}

        {/* Disputes Tab */}
        {activeTab === 'disputes' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Your Disputes</h2>
            {disputesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : disputesError ? (
              <div className="bg-red-50 text-red-600 p-4 rounded">
                {disputesError}
              </div>
            ) : (
              <DisputesList disputes={disputes} onDisputeResolved={fetchDisputes} />
            )}
          </div>
        )}
      </div>
    </>
  );
}
