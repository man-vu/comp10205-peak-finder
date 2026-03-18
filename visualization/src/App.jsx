import { useState, useEffect, useRef } from 'react';
import Heatmap from './components/Heatmap';
import Controls from './components/Controls';
import StatsPanel from './components/StatsPanel';
import Legend from './components/Legend';
import { loadDataset } from './utils/parseData';
import { findLocalPeaks, findLowestElevation, findMostFrequent, findClosestPairsWithSteps } from './utils/algorithms';
import './App.css';

const THRESHOLDS = {
  'Sample.TXT': { peak: 90, minElev: 1, maxElev: 99 },
  'ELEVATIONS.TXT': { peak: 98480, minElev: 15000, maxElev: 99000 },
};

function App() {
  const [dataset, setDataset] = useState('Sample.TXT');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [peaks, setPeaks] = useState(null);
  const [lowest, setLowest] = useState(null);
  const [mostFreq, setMostFreq] = useState(null);
  const [closestResult, setClosestResult] = useState(null);
  const [showPeaks, setShowPeaks] = useState(true);
  const [showPairs, setShowPairs] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(200);
  const playRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setData(null);
    setPeaks(null);
    setClosestResult(null);
    setLowest(null);
    setMostFreq(null);
    setStepIndex(0);
    setPlaying(false);

    loadDataset(dataset).then(d => {
      setData(d);
      setLoading(false);
    });
  }, [dataset]);

  useEffect(() => {
    if (!data) return;

    const cfg = THRESHOLDS[dataset];
    const foundPeaks = findLocalPeaks(data.matrix, data.exclusionRadius, cfg.peak);
    setPeaks(foundPeaks);

    const low = findLowestElevation(data.matrix, cfg.minElev, cfg.maxElev);
    setLowest(low);

    if (low) {
      const mf = findMostFrequent(low.freq, cfg.minElev, cfg.maxElev);
      setMostFreq(mf);
    }

    if (foundPeaks.length >= 2) {
      const result = findClosestPairsWithSteps(foundPeaks);
      setClosestResult(result);
    }
  }, [data, dataset]);

  useEffect(() => {
    if (playing && closestResult) {
      playRef.current = setInterval(() => {
        setStepIndex(prev => {
          if (prev >= closestResult.steps.length - 1) {
            setPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }
    return () => clearInterval(playRef.current);
  }, [playing, speed, closestResult]);

  const totalSteps = closestResult ? closestResult.steps.length : 0;
  const currentStep = closestResult && totalSteps > 0 ? closestResult.steps[stepIndex] : null;

  return (
    <div className="app">
      <header>
        <h1>PeakFinder Visualization</h1>
        <p className="subtitle">COMP10205 - Closest Pairs of Local Peaks</p>
      </header>

      <div className="main-layout">
        <div className="sidebar">
          <Controls
            dataset={dataset}
            setDataset={setDataset}
            loading={loading}
            showPeaks={showPeaks}
            setShowPeaks={setShowPeaks}
            showPairs={showPairs}
            setShowPairs={setShowPairs}
            stepIndex={stepIndex}
            setStepIndex={setStepIndex}
            totalSteps={totalSteps}
            playing={playing}
            setPlaying={setPlaying}
            speed={speed}
            setSpeed={setSpeed}
          />
          <StatsPanel
            data={data}
            peaks={peaks}
            closestPairs={closestResult?.closestPairs}
            closestDist={closestResult?.closestDist}
            lowest={lowest}
            mostFrequent={mostFreq}
            currentStep={currentStep}
          />
        </div>

        <div className="visualization">
          {loading && <div className="loading">Loading dataset...</div>}
          {data && (
            <>
              <Heatmap
                data={data}
                peaks={peaks}
                closestPairs={closestResult?.closestPairs}
                currentStep={currentStep}
                showPeaks={showPeaks}
                showPairs={showPairs}
              />
              <Legend min={data.min} max={data.max} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
