import {
  BarChart as ReBarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import './BarChart.css'; // Import the new CSS file

export default function BarChart({ 
  data, 
  dataKey, 
  nameKey = 'name', 
  color = '#16a34a', 
  height = 260, 
  label 
}) {
  return (
    <div className="chart-container">
      {label && <p className="chart-label">{label}</p>}
      
      <ResponsiveContainer width="100%" height={height}>
        <ReBarChart 
          data={data} 
          margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={nameKey} />
          <YAxis />
          <Tooltip cursor={{ fill: '#f5f5f5' }} />
          <Bar 
            dataKey={dataKey} 
            fill={color} 
            radius={[4, 4, 0, 0]} 
          />
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}