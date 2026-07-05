'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { profileApi } from '@/lib/api';
import { ApiErrorClass } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';

interface AvatarUploadModalProps {
  isOpen: boolean;
  currentAvatarUrl?: string;
  onClose: () => void;
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

export const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({
  isOpen,
  currentAvatarUrl,
  onClose,
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
      setTimeout(() => onClose(), 1000); // Close after success
    } catch (err) {
      const error = err as ApiErrorClass;
      const errorMsg = error.message || 'Failed to upload avatar';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Upload Profile Picture</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/50 text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {preview ? (
            <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-border">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-full aspect-square bg-secondary/30 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground">
              No image selected
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="flex-1"
            >
              Choose Image
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              disabled={loading}
            >
              Cancel
            </Button>
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Supported formats: JPG, PNG, WebP (max 5MB)
          </p>
        </div>
      </div>
    </div>
  );
};
