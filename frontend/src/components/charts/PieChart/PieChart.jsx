import React from 'react';
import {
  PieChart as RePieChart, Pie, Cell,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import './PieChart.css';

const COLORS = [
  '#10b981', // Emerald 500
  '#06b6d4', // Cyan 500
  '#3b82f6', // Blue 500
  '#8b5cf6', // Violet 500
  '#f43f5e', // Rose 500
  '#f59e0b', // Amber 500
];

export default function PieChart({ data, nameKey = 'name', valueKey = 'value', height = 320, label }) {
  return (
    <div className="chart-container">
      {label && <h3 className="chart-label">{label}</h3>}
      
      <ResponsiveContainer width="100%" height={height}>
        <RePieChart>
          <Pie
            data={data}
            dataKey={valueKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius="65%"
            outerRadius="85%"
            paddingAngle={5}
            cornerRadius={6}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                className="pie-slice"
              />
            ))}
          </Pie>

          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(8px)',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }} 
          />

          <Legend 
            layout="vertical" 
            align="right" 
            verticalAlign="middle" 
            iconType="circle" 
            iconSize={8}
            wrapperStyle={{ paddingLeft: '20px' }}
          />
        </RePieChart>
      </ResponsiveContainer>
    </div>
  );
}