'use client';

import React, { useEffect, useState } from 'react';
import { disputesApi } from '@/lib/api';
import { Dispute, DisputeStatus, ApiErrorClass } from '@/lib/api/types';

interface DisputesListProps {
  disputes?: Dispute[];
  loading?: boolean;
  error?: string | null;
  onDisputeResolved?: () => void;
}

export const DisputesList: React.FC<DisputesListProps> = ({ 
  disputes: externalDisputes,
  loading: externalLoading,
  error: externalError,
  onDisputeResolved,
}) => {
  const [internalDisputes, setInternalDisputes] = useState<Dispute[]>([]);
  const [internalLoading, setInternalLoading] = useState(true);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [filter, setFilter] = useState<DisputeStatus | 'all'>('all');
  const [selectedDispute, setSelectedDispute] = useState<string | null>(null);

  // Determine if using external or internal data
  const isExternal = externalDisputes !== undefined;
  const disputes = isExternal ? externalDisputes : internalDisputes;
  const loading = isExternal ? (externalLoading ?? false) : internalLoading;
  const error = isExternal ? externalError : internalError;

  useEffect(() => {
    if (!isExternal) {
      fetchDisputes();
    }
  }, [filter, isExternal]);

  const fetchDisputes = async () => {
    try {
      setInternalLoading(true);
      setInternalError(null);
      const params = {
        limit: 50,
        offset: 0,
        status: filter === 'all' ? undefined : filter,
      };
      const data = await disputesApi.listDisputes(params);
      setInternalDisputes(data);
    } catch (err) {
      const apiError = err as ApiErrorClass;
      setInternalError(apiError.message || 'Failed to load disputes');
    } finally {
      setInternalLoading(false);
    }
  };

  const getStatusColor = (status: DisputeStatus) => {
    switch (status) {
      case DisputeStatus.OPEN:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case DisputeStatus.UNDER_REVIEW:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case DisputeStatus.RESOLVED_REFUND:
      case DisputeStatus.RESOLVED_RELEASE:
        return 'bg-green-100 text-green-800 border-green-300';
      case DisputeStatus.CLOSED:
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: DisputeStatus) => {
    return status.replace('_', ' ').toUpperCase();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-20 bg-gray-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 border border-red-200 text-red-700">
        {error}
      </div>
    );
  }

  const filteredDisputes =
    disputes.length === 0 ? (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🎉</div>
        <p className="text-gray-600">No disputes found</p>
      </div>
    ) : (
      <div className="space-y-3">
        {disputes.map((dispute) => (
          <button
            key={dispute.id}
            onClick={() =>
              setSelectedDispute(
                selectedDispute === dispute.id ? null : dispute.id
              )
            }
            className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900">
                    {dispute.reason.replace('_', ' ').toUpperCase()}
                  </span>
                  <span
                    className={`px-3 py-1 text-xs font-medium border rounded-full ${getStatusColor(
                      dispute.status as DisputeStatus
                    )}`}
                  >
                    {getStatusLabel(dispute.status as DisputeStatus)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Raised by: <strong>{dispute.raised_by_name}</strong>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(dispute.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-2xl">
                {selectedDispute === dispute.id ? '▼' : '▶'}
              </div>
            </div>

            {/* Expanded Details */}
            {selectedDispute === dispute.id && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    Description
                  </p>
                  <p className="text-gray-900 text-sm">{dispute.description}</p>
                </div>
                {dispute.resolution_notes && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">
                      Resolution Notes
                    </p>
                    <p className="text-gray-900 text-sm">
                      {dispute.resolution_notes}
                    </p>
                  </div>
                )}
                <div className="pt-3 flex gap-2">
                  <a
                    href={`/dashboard/disputes/${dispute.id}`}
                    className="flex-1 text-center px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                  >
                    View Details
                  </a>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', DisputeStatus.OPEN, DisputeStatus.UNDER_REVIEW, DisputeStatus.CLOSED].map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All' : getStatusLabel(status as DisputeStatus)}
            </button>
          )
        )}
      </div>

      {/* List */}
      {filteredDisputes}
    </div>
  );
};

export default DisputesList;
