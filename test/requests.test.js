import { describe, it, expect } from 'vitest';
import { buildRequestTable } from '../src/components/requests.js';

describe('requests component', () => {
  it('renders table for requests', () => {
    const requests = [
      { id: 'r1', title: 'T1', port: 'P1', scheduledFor: '2025-11-18T08:00:00', status: 'pending', assignedOperatorId: null, clientId: 'c1' }
    ];

    const helpers = {
      resolveUser: (id) => ({ id, name: 'Operator' }),
      escapeHtml: (v) => String(v),
      formatDate: (v) => '18 nov 2025',
      buildStatusChip: (s) => `<span>${s}</span>`,
      emptyState: (t, s) => `<div>${t}</div>`
    };

    const out = buildRequestTable(requests, 'all', null, helpers);
    expect(out).toContain('<table');
    expect(out).toContain('T1');
    expect(out).toContain('18 nov 2025');
  });
});
