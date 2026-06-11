import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong p-3 rounded-xl text-xs shadow-lg border border-border">
      <p className="text-text-muted mb-2 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-text-secondary">{p.name}:</span>
          <span className="font-bold" style={{ color: p.color }}>${p.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

export default function MaintenanceCostChart({ data }) {
  return (
    <div className="recharts-custom">
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradCost" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748B' }} />
          <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#64748B' }} width={50} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#64748B' }} width={60} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }} />
          <Bar yAxisId="left" dataKey="cost" name="Period Cost" fill="url(#gradCost)" radius={[6, 6, 0, 0]} barSize={24} />
          <Line yAxisId="right" type="monotone" dataKey="cumulative" name="Cumulative" stroke="#00D4FF" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
