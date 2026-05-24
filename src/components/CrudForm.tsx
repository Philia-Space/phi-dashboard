// @ts-nocheck
import React, { useState } from 'react';
import { Input, Button, Card, Alert } from '@philiaspace/ui-primitives';
import type { CrudFormProps, FormField } from '../types';

export function CrudForm<T extends object>({
  fields,
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  className,
  style,
}: CrudFormProps<T>) {
  const [data, setData] = useState<Record<string, unknown>>(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (key: string, value: unknown) => {
    setData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      if (field.required && !data[field.key]) {
        newErrors[field.key] = `${field.label} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(data as T);
  };

  const renderField = (field: FormField) => {
    const value = String(data[field.key] || '');
    const error = errors[field.key];

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 4}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              background: '#0f172a',
              border: `1px solid ${error ? '#ef4444' : '#334155'}`,
              borderRadius: '6px',
              color: '#f8fafc',
              fontSize: '0.875rem',
              resize: 'vertical',
            }}
          />
        );
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleChange(field.key, e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              background: '#0f172a',
              border: `1px solid ${error ? '#ef4444' : '#334155'}`,
              borderRadius: '6px',
              color: '#f8fafc',
              fontSize: '0.875rem',
            }}
          >
            <option value="">Select...</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <Input
            type={field.type === 'number' ? 'number' : 'text'}
            value={value}
            onChange={(e) => handleChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            error={error}
          />
        );
    }
  };

  return (
    <Card className={className} style={style}>
      <form onSubmit={handleSubmit}>
        {Object.keys(errors).length > 0 && (
          <Alert variant="error" title="Validation Error" style={{ marginBottom: '1rem' }}>
            Please fix the errors below.
          </Alert>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {fields.map((field) => (
            <div key={field.key}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: '#94a3b8',
                  marginBottom: '0.25rem',
                }}
              >
                {field.label}
                {field.required && <span style={{ color: '#ef4444' }}> *</span>}
              </label>
              {renderField(field)}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
