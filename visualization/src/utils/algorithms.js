// Find local peaks using complete search (mirrors Java implementation)
export function findLocalPeaks(matrix, exclusionRadius, peakThreshold) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const peaks = [];

  for (let row = exclusionRadius; row < rows - exclusionRadius; row++) {
    for (let col = exclusionRadius; col < cols - exclusionRadius; col++) {
      if (matrix[row][col] < peakThreshold) continue;

      let isPeak = true;
      for (let lr = row - exclusionRadius; lr <= row + exclusionRadius && isPeak; lr++) {
        for (let lc = col - exclusionRadius; lc <= col + exclusionRadius && isPeak; lc++) {
          if (lr === row && lc === col) continue;
          if (matrix[lr][lc] >= matrix[row][col]) {
            isPeak = false;
          }
        }
      }

      if (isPeak) {
        peaks.push({ row, col, elevation: matrix[row][col] });
        col += exclusionRadius; // skip ahead optimization
      }
    }
  }

  return peaks;
}

// Find lowest elevation using frequency array
export function findLowestElevation(matrix, minPossible, maxPossible) {
  const freq = new Array(maxPossible + 1).fill(0);
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      freq[matrix[r][c]]++;
    }
  }
  for (let i = minPossible; i <= maxPossible; i++) {
    if (freq[i] > 0) return { elevation: i, count: freq[i], freq };
  }
  return null;
}

// Find most frequent elevation
export function findMostFrequent(freq, minPossible, maxPossible) {
  let bestVal = -1, bestCount = 0;
  for (let i = minPossible; i <= maxPossible; i++) {
    if (freq[i] > bestCount) {
      bestCount = freq[i];
      bestVal = i;
    }
  }
  return { elevation: bestVal, count: bestCount };
}

// Distance between two peaks
function dist(a, b) {
  return Math.sqrt((a.row - b.row) ** 2 + (a.col - b.col) ** 2);
}

// Divide-and-conquer closest pairs with step recording for visualization
export function findClosestPairsWithSteps(peaks) {
  const steps = [];
  const sorted = [...peaks].sort((a, b) => a.col - b.col);

  let closestDist = Infinity;
  let closestPairs = [];

  function recordPair(a, b, d) {
    if (d < closestDist) {
      closestDist = d;
      closestPairs = [{ a, b, distance: d }];
    } else if (Math.abs(d - closestDist) < 0.0001) {
      const exists = closestPairs.some(
        p => (p.a.row === a.row && p.a.col === a.col && p.b.row === b.row && p.b.col === b.col) ||
             (p.a.row === b.row && p.a.col === b.col && p.b.row === a.row && p.b.col === a.col)
      );
      if (!exists) closestPairs.push({ a, b, distance: d });
    }
  }

  function solve(pts, depth) {
    const n = pts.length;

    steps.push({
      type: 'divide',
      points: pts.map(p => ({ ...p })),
      depth,
    });

    if (n <= 3) {
      let minD = Infinity;
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const d = dist(pts[i], pts[j]);
          steps.push({ type: 'compare', a: { ...pts[i] }, b: { ...pts[j] }, distance: d, depth });
          recordPair(pts[i], pts[j], d);
          if (d < minD) minD = d;
        }
      }
      return minD;
    }

    const mid = Math.floor(n / 2);
    const midPoint = pts[mid];

    steps.push({
      type: 'split',
      midCol: midPoint.col,
      depth,
    });

    const dL = solve(pts.slice(0, mid), depth + 1);
    const dR = solve(pts.slice(mid), depth + 1);
    let d = Math.min(dL, dR);

    const strip = pts.filter(p => Math.abs(p.col - midPoint.col) < d);
    strip.sort((a, b) => a.row - b.row);

    steps.push({
      type: 'strip',
      strip: strip.map(p => ({ ...p })),
      midCol: midPoint.col,
      stripWidth: d,
      depth,
    });

    for (let i = 0; i < strip.length; i++) {
      for (let j = i + 1; j < strip.length && (strip[j].row - strip[i].row) < d; j++) {
        const dd = dist(strip[i], strip[j]);
        steps.push({ type: 'compare', a: { ...strip[i] }, b: { ...strip[j] }, distance: dd, depth });
        recordPair(strip[i], strip[j], dd);
        if (dd < d) d = dd;
      }
    }

    return d;
  }

  const resultDist = sorted.length >= 2 ? solve(sorted, 0) : Infinity;

  return { closestDist: resultDist, closestPairs, steps };
}
