export default function Controls({
  dataset, setDataset, loading,
  showPeaks, setShowPeaks,
  showPairs, setShowPairs,
  stepIndex, setStepIndex, totalSteps,
  playing, setPlaying,
  speed, setSpeed,
}) {
  return (
    <div className="controls">
      <div className="control-group">
        <label>Dataset:</label>
        <select value={dataset} onChange={e => setDataset(e.target.value)} disabled={loading}>
          <option value="Sample.TXT">Sample (10x10)</option>
          <option value="ELEVATIONS.TXT">Elevations (600x1250)</option>
        </select>
      </div>

      <div className="control-group">
        <label>
          <input type="checkbox" checked={showPeaks} onChange={e => setShowPeaks(e.target.checked)} />
          Show Peaks
        </label>
        <label>
          <input type="checkbox" checked={showPairs} onChange={e => setShowPairs(e.target.checked)} />
          Show Closest Pairs
        </label>
      </div>

      <div className="control-group">
        <label>Algorithm Steps ({stepIndex + 1} / {totalSteps}):</label>
        <div className="step-controls">
          <button onClick={() => setStepIndex(0)} disabled={stepIndex === 0}>|&lt;</button>
          <button onClick={() => setStepIndex(Math.max(0, stepIndex - 1))} disabled={stepIndex === 0}>&lt;</button>
          <button onClick={() => setPlaying(!playing)}>{playing ? 'Pause' : 'Play'}</button>
          <button onClick={() => setStepIndex(Math.min(totalSteps - 1, stepIndex + 1))} disabled={stepIndex >= totalSteps - 1}>&gt;</button>
          <button onClick={() => setStepIndex(totalSteps - 1)} disabled={stepIndex >= totalSteps - 1}>&gt;|</button>
        </div>
        <input
          type="range"
          min={0}
          max={Math.max(0, totalSteps - 1)}
          value={stepIndex}
          onChange={e => setStepIndex(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <div className="control-group">
        <label>Speed: {speed}ms</label>
        <input
          type="range"
          min={10}
          max={1000}
          step={10}
          value={speed}
          onChange={e => setSpeed(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
}
