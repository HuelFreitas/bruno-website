/* @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest';
import { attachRequestModalHandlers } from '../src/components/modal.js';

describe('modal attach handlers', () => {
  it('calls helpers.showRequestModal when button clicked', () => {
    document.body.innerHTML = `<div><button data-request="r1">Open</button></div>`;
    const user = { id: 'u1' };
    const helpers = {
      findRequestById: (id) => ({ id }),
      showRequestModal: vi.fn(),
    };

    attachRequestModalHandlers(document, user, helpers);
    document.querySelector('[data-request]').click();
    expect(helpers.showRequestModal).toHaveBeenCalled();
  });
});
