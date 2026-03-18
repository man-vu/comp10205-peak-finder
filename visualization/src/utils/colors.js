// Attempt to use canvas for heatmap rendering (much faster than individual elements)
export function elevationToColor(value, min, max) {
  const t = (value - min) / (max - min);
  // Green -> Yellow -> Red gradient
  const r = Math.floor(t < 0.5 ? t * 2 * 255 : 255);
  const g = Math.floor(t < 0.5 ? 255 : (1 - (t - 0.5) * 2) * 255);
  const b = Math.floor(30 + (1 - t) * 40);
  return `rgb(${r},${g},${b})`;
}

export function elevationToRGB(value, min, max) {
  const t = (value - min) / (max - min);
  const r = t < 0.5 ? Math.floor(t * 2 * 255) : 255;
  const g = t < 0.5 ? 255 : Math.floor((1 - (t - 0.5) * 2) * 255);
  const b = Math.floor(30 + (1 - t) * 40);
  return [r, g, b];
}
