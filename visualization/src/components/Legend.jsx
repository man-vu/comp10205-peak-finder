import { elevationToColor } from '../utils/colors';

export default function Legend({ min, max }) {
  const stops = 10;
  const items = [];
  for (let i = 0; i <= stops; i++) {
    const val = min + (max - min) * (i / stops);
    items.push({ val: Math.round(val), color: elevationToColor(val, min, max) });
  }

  return (
    <div className="legend">
      <span className="legend-label">{min}</span>
      <div className="legend-bar">
        {items.map((item, i) => (
          <div
            key={i}
            className="legend-segment"
            style={{ backgroundColor: item.color }}
            title={item.val}
          />
        ))}
      </div>
      <span className="legend-label">{max}</span>
    </div>
  );
}
