/* @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { clone, announce } from '../src/utils/dom.js';

describe('dom utils', () => {
  it('clone makes a deep copy', () => {
    const src = { a: 1, b: { c: 2 } };
    const copy = clone(src);
    expect(copy).toEqual(src);
    expect(copy).not.toBe(src);
    copy.b.c = 3;
    expect(src.b.c).toBe(2);
  });

  it('announce creates or updates live region', () => {
    document.body.innerHTML = '';
    announce('hello');
    const region = document.getElementById('guardcan-live');
    expect(region).toBeTruthy();
    expect(region.textContent).toBe('hello');
    announce('updated');
    expect(region.textContent).toBe('updated');
  });
});
