export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function announce(message) {
  const regionId = 'guardcan-live';
  let region = typeof document !== 'undefined' && document.getElementById(regionId);
  if (!region && typeof document !== 'undefined') {
    region = document.createElement('div');
    region.id = regionId;
    region.className = 'sr-only';
    region.setAttribute('aria-live', 'polite');
    document.body.appendChild(region);
  }
  if (region) region.textContent = message;
}
