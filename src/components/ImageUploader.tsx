// @ts-nocheck
import React, { useRef, useState } from 'react';
import { Button, Card, Alert } from '@philiaspace/ui-primitives';
import type { ImageUploaderProps } from '../types';

export function ImageUploader({
  onUpload,
  acceptedTypes = 'image/*',
  maxSizeMB = 5,
  className,
  style,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);

    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File must be under ${maxSizeMB}MB`);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      await onUpload(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <Card className={className} style={style}>
      {error && <Alert variant="error" style={{ marginBottom: '1rem' }}>{error}</Alert>}

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        style={{
          border: '2px dashed #334155',
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'border-color 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#3b82f6')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#334155')}
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '6px' }}
          />
        ) : (
          <>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📤</div>
            <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
              Drag & drop an image here, or click to browse
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={acceptedTypes}
          style={{ display: 'none' }}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>

      {uploading && (
        <div style={{ marginTop: '0.75rem', textAlign: 'center', color: '#94a3b8' }}>
          Uploading...
        </div>
      )}
    </Card>
  );
}
