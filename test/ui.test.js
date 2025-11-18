import { describe, it, expect } from 'vitest';
import { metricCard, buildStatusFilterTab, createSearchInterface } from '../src/components/ui.js';

describe('ui components', () => {
  it('metricCard returns html with label and value', () => {
    const out = metricCard('Label', '42', 'success');
    expect(out).toContain('Label');
    expect(out).toContain('42');
    expect(out).toContain('status--completed');
  });

  it('buildStatusFilterTab renders button with data-filter', () => {
    const out = buildStatusFilterTab('pending', 'Pendente', 'all');
    expect(out).toContain('data-filter="pending"');
    expect(out).toContain('Pendente');
  });

  it('createSearchInterface returns expected fields', () => {
    const out = createSearchInterface();
    expect(out).toContain('searchText');
    expect(out).toContain('searchStatus');
    expect(out).toContain('searchDateFrom');
  });
});
