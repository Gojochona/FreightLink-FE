'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/dashboard/header';
import { DisputesList } from '@/components/DisputesList';
import { disputesApi } from '@/lib/api';
import { Dispute, ApiErrorClass } from '@/lib/api/types';
import { Loader } from 'lucide-react';

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await disputesApi.listDisputes();
      setDisputes(data);
    } catch (err) {
      const apiError = err as ApiErrorClass;
      setError(apiError.message || 'Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header
        title="Disputes"
        subtitle="Resolve disputes and view their status"
      />

      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-6">Your Disputes</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded">
              {error}
            </div>
          ) : (
            <DisputesList disputes={disputes} onDisputeResolved={fetchDisputes} />
          )}
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Need help?</h3>
          <p className="text-blue-800 text-sm">
            If you have a dispute with a delivery, you can raise it here and our
            support team will help resolve it. Make sure to provide clear details
            about the issue.
          </p>
        </div>
      </div>
    </>
  );
}
