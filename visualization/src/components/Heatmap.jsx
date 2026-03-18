import { useRef, useEffect, useMemo } from 'react';
import { elevationToRGB } from '../utils/colors';

export default function Heatmap({ data, peaks, closestPairs, currentStep, showPeaks, showPairs }) {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);

  const { matrix, rows, cols, min, max } = data;

  // Compute a reasonable canvas size
  const maxWidth = 900;
  const maxHeight = 600;
  const scale = Math.max(1, Math.min(
    Math.floor(maxWidth / cols),
    Math.floor(maxHeight / rows)
  ));
  const width = cols * Math.max(scale, 1);
  const height = rows * Math.max(scale, 1);
  const pixelScale = Math.max(scale, 1);

  // Draw heatmap on main canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !matrix.length) return;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);
    const buf = imageData.data;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const [red, green, blue] = elevationToRGB(matrix[r][c], min, max);
        for (let dy = 0; dy < pixelScale; dy++) {
          for (let dx = 0; dx < pixelScale; dx++) {
            const idx = ((r * pixelScale + dy) * width + (c * pixelScale + dx)) * 4;
            buf[idx] = red;
            buf[idx + 1] = green;
            buf[idx + 2] = blue;
            buf[idx + 3] = 255;
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [matrix, rows, cols, min, max, width, height, pixelScale]);

  // Draw overlay (peaks, pairs, algorithm steps)
  useEffect(() => {
    const canvas = overlayRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    // Draw exclusion zone border
    const er = data.exclusionRadius;
    if (er > 0) {
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(
        er * pixelScale,
        er * pixelScale,
        (cols - 2 * er) * pixelScale,
        (rows - 2 * er) * pixelScale
      );
      ctx.setLineDash([]);
    }

    // Draw algorithm step visualization
    if (currentStep) {
      if (currentStep.type === 'split') {
        ctx.strokeStyle = 'rgba(0, 200, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        const x = currentStep.midCol * pixelScale;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (currentStep.type === 'strip') {
        const x1 = (currentStep.midCol - currentStep.stripWidth) * pixelScale;
        const x2 = (currentStep.midCol + currentStep.stripWidth) * pixelScale;
        ctx.fillStyle = 'rgba(0, 200, 255, 0.1)';
        ctx.fillRect(x1, 0, x2 - x1, height);
        ctx.strokeStyle = 'rgba(0, 200, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x1, 0, x2 - x1, height);
      }

      if (currentStep.type === 'compare') {
        const ax = currentStep.a.col * pixelScale + pixelScale / 2;
        const ay = currentStep.a.row * pixelScale + pixelScale / 2;
        const bx = currentStep.b.col * pixelScale + pixelScale / 2;
        const by = currentStep.b.row * pixelScale + pixelScale / 2;

        ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }
    }

    // Draw peaks
    if (showPeaks && peaks) {
      const radius = Math.max(3, pixelScale * 2);
      for (const peak of peaks) {
        const cx = peak.col * pixelScale + pixelScale / 2;
        const cy = peak.row * pixelScale + pixelScale / 2;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Draw closest pairs connections
    if (showPairs && closestPairs) {
      for (const pair of closestPairs) {
        const ax = pair.a.col * pixelScale + pixelScale / 2;
        const ay = pair.a.row * pixelScale + pixelScale / 2;
        const bx = pair.b.col * pixelScale + pixelScale / 2;
        const by = pair.b.row * pixelScale + pixelScale / 2;

        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();

        // Highlight endpoints
        const eRadius = Math.max(4, pixelScale * 2.5);
        for (const [x, y] of [[ax, ay], [bx, by]]) {
          ctx.beginPath();
          ctx.arc(x, y, eRadius, 0, Math.PI * 2);
          ctx.fillStyle = '#00ffff';
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }
  }, [peaks, closestPairs, currentStep, showPeaks, showPairs, width, height, pixelScale, cols, rows, data.exclusionRadius]);

  // Tooltip state
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor(x / pixelScale);
    const row = Math.floor(y / pixelScale);
    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      e.currentTarget.title = `[${row}, ${col}] elevation: ${matrix[row][col]}`;
    }
  };

  return (
    <div className="heatmap-container" style={{ position: 'relative', display: 'inline-block' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      <canvas
        ref={overlayRef}
        onMouseMove={handleMouseMove}
        style={{ position: 'absolute', top: 0, left: 0, cursor: 'crosshair' }}
      />
    </div>
  );
}
