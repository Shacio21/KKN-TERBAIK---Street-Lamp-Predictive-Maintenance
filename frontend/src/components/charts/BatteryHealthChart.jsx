import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong p-3 rounded-xl text-xs shadow-lg border border-border">
      <p className="text-text-muted mb-2 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-text-secondary">{p.name}:</span>
          <span className="font-bold" style={{ color: p.color }}>{p.value}%</span>
        </p>
      ))}
    </div>
  );
}

export default function BatteryHealthChart({ data }) {
  return (
    <div className="recharts-custom">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748B' }} interval={4} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748B' }} width={35} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }} />
          <ReferenceLine y={50} stroke="#F59E0B" strokeDasharray="5 5" strokeOpacity={0.5} label={{ value: 'Warning', fill: '#F59E0B', fontSize: 10, position: 'left' }} />
          <ReferenceLine y={25} stroke="#EF4444" strokeDasharray="5 5" strokeOpacity={0.5} label={{ value: 'Critical', fill: '#EF4444', fontSize: 10, position: 'left' }} />
          <Line type="monotone" dataKey="average" name="Average" stroke="#00FF88" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="minimum" name="Minimum" stroke="#EF4444" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
          <Line type="monotone" dataKey="maximum" name="Maximum" stroke="#8B5CF6" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
