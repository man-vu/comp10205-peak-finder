export default function StatsPanel({ data, peaks, closestPairs, closestDist, lowest, mostFrequent, currentStep }) {
  if (!data) return null;

  return (
    <div className="stats-panel">
      <h3>Statistics</h3>
      <table>
        <tbody>
          <tr><td>Grid Size</td><td>{data.rows} x {data.cols}</td></tr>
          <tr><td>Exclusion Radius</td><td>{data.exclusionRadius}</td></tr>
          <tr><td>Elevation Range</td><td>{data.min} - {data.max}</td></tr>
          {lowest && (
            <tr><td>Lowest Elevation</td><td>{lowest.elevation} (x{lowest.count})</td></tr>
          )}
          {mostFrequent && (
            <tr><td>Most Frequent</td><td>{mostFrequent.elevation} (x{mostFrequent.count})</td></tr>
          )}
          {peaks && (
            <tr><td>Local Peaks Found</td><td>{peaks.length}</td></tr>
          )}
          {closestPairs && (
            <>
              <tr><td>Closest Distance</td><td>{closestDist.toFixed(2)}</td></tr>
              <tr><td>Closest Pairs</td><td>{closestPairs.length}</td></tr>
            </>
          )}
        </tbody>
      </table>

      {currentStep && (
        <div className="step-info">
          <h4>Current Step</h4>
          <p>
            <strong>Type:</strong> {currentStep.type}
            {currentStep.depth !== undefined && <> | <strong>Depth:</strong> {currentStep.depth}</>}
            {currentStep.distance !== undefined && <> | <strong>Dist:</strong> {currentStep.distance.toFixed(2)}</>}
          </p>
          {currentStep.type === 'compare' && (
            <p>
              Comparing [{currentStep.a.row},{currentStep.a.col}] vs [{currentStep.b.row},{currentStep.b.col}]
            </p>
          )}
        </div>
      )}

      {closestPairs && closestPairs.length > 0 && (
        <div className="pairs-list">
          <h4>Closest Pairs</h4>
          {closestPairs.map((p, i) => (
            <div key={i} className="pair-item">
              [{p.a.row},{p.a.col}] (elev {p.a.elevation}) &harr; [{p.b.row},{p.b.col}] (elev {p.b.elevation})
              &mdash; dist: {p.distance.toFixed(2)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
