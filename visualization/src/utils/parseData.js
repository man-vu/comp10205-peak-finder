export async function loadDataset(filename) {
  const response = await fetch(`/data/${filename}`);
  const text = await response.text();
  return parseElevationData(text);
}

function parseElevationData(text) {
  const lines = text.trim().split('\n');
  const header = lines[0].trim().split(/\s+/).map(Number);
  const [rows, cols, exclusionRadius] = header;

  const matrix = [];
  let currentRow = [];
  let rowIdx = 0;

  for (let i = 1; i < lines.length && rowIdx < rows; i++) {
    const values = lines[i].trim().split(/\s+/).map(Number);
    for (const val of values) {
      currentRow.push(val);
      if (currentRow.length === cols) {
        matrix.push(currentRow);
        currentRow = [];
        rowIdx++;
      }
    }
  }

  let min = Infinity, max = -Infinity;
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c] < min) min = matrix[r][c];
      if (matrix[r][c] > max) max = matrix[r][c];
    }
  }

  return { rows, cols, exclusionRadius, matrix, min, max };
}
