import SensorWidget from './SensorWidget';

export default function SensorGrid({ sensorMeta, liveSensors, sparklines }) {
  const sensorKeys = Object.keys(sensorMeta);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {sensorKeys.map((key, i) => (
        <SensorWidget
          key={key}
          sensorKey={key}
          meta={sensorMeta[key]}
          liveValue={liveSensors[key]}
          sparkline={sparklines[key]}
          delay={i * 0.05}
        />
      ))}
    </div>
  );
}
