'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { profileApi } from '@/lib/api';
import { ApiErrorClass } from '@/lib/api/types';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  onSuccess,
  onError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      const err = 'Please upload a JPG, PNG, or WebP image';
      setError(err);
      onError?.(err);
      return;
    }

    if (file.size > MAX_SIZE) {
      const err = 'File size must be less than 5MB';
      setError(err);
      onError?.(err);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setLoading(true);
    try {
      const response = await profileApi.uploadAvatar(file);
      onSuccess?.(response.url);
      setError(null);
    } catch (err) {
      const error = err as ApiErrorClass;
      const errorMsg = error.message || 'Failed to upload avatar';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete your profile picture?')) return;

    setLoading(true);
    try {
      await profileApi.deleteAvatar();
      setPreview(null);
      setError(null);
      onSuccess?.('');
    } catch (err) {
      const error = err as ApiErrorClass;
      const errorMsg = error.message || 'Failed to delete avatar';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        {/* Preview */}
        <div className="flex-shrink-0">
          {preview ? (
            <div className="relative w-24 h-24">
              <Image
                src={preview}
                alt="Profile preview"
                fill
                className="rounded-full object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-3xl">
              👤
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            disabled={loading}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition text-sm font-medium"
          >
            {loading ? 'Uploading...' : 'Choose Photo'}
          </button>
          {preview && (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="block w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:bg-gray-200 transition text-sm font-medium"
            >
              Remove Photo
            </button>
          )}
          <p className="text-xs text-gray-500">
            JPG, PNG or WebP up to 5MB
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;
