// frontend/app/component/dashboard/ProjectStatusChart.tsx
import React, { useRef, useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProjectStatusData {
  name: string;
  value: number;
  color: string;
}

interface ProjectStatusChartProps {
  data: ProjectStatusData[];
}

const SOFT_COLORS = [
  '#8884d8', // Soft purple
  '#82ca9d', // Soft green
  '#ffc658', // Soft yellow
  '#ff8042', // Soft orange
];

export const ProjectStatusChart: React.FC<ProjectStatusChartProps> = ({ data }) => {
  const hasData = data.some(item => item.value > 0);
  const filteredData = data.filter(item => item.value > 0);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(300);
  const [showLabels, setShowLabels] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
        setShowLabels(containerRef.current.offsetWidth > 200);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Card className="w-full h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="text-base sm:text-lg md:text-xl">
          Project Status Distribution
        </CardTitle>
      </CardHeader>
      <CardContent
        ref={containerRef}
        className="p-1 sm:p-2 md:p-4 flex-grow flex flex-col overflow-hidden"
      >
        <div className="h-full w-full min-h-[200px]">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 20, left: 20, bottom: showLabels ? 60 : 20 }}>
                <Pie
                  data={filteredData}
                  cx="50%"
                  cy="50%"
                  labelLine={showLabels}
                  outerRadius={showLabels ? "65%" : "75%"}
                  fill="#8884d8"
                  dataKey="value"
                  label={showLabels ? ({ name, percent, x, y }) => {
                    const fontSize = Math.max(Math.min(containerWidth / 20, 14), 8);
                    const maxLength = containerWidth < 250 ? 6 : 10;
                    const displayName =
                      name.length > maxLength ? `${name.substring(0, maxLength)}…` : name;
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="#000"
                        fontSize={fontSize}
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        {`${displayName}: ${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  } : false}
                  minAngle={15}
                >
                  {filteredData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || SOFT_COLORS[index % SOFT_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} projects`, 'Count']} />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  iconSize={10}
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: '10px',
                    paddingTop: '5px',
                    paddingBottom: '10px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <p className="mb-2 text-sm md:text-base">No project data available</p>
                <p className="text-xs md:text-sm">Create projects to see status distribution</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};