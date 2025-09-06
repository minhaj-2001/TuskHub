// frontend/app/component/dashboard/StageTimeTracking.tsx
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Timer } from "lucide-react";
import { format, differenceInDays } from "date-fns";

interface StageTimeData {
  name: string;
  days: number;
}

interface StageTimeTrackingProps {
  projects: any[];
  selectedProjectId?: string;
}

export const StageTimeTracking: React.FC<StageTimeTrackingProps> = ({ 
  projects, 
  selectedProjectId 
}) => {
  const [chartData, setChartData] = useState<StageTimeData[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>(selectedProjectId || 'all');
  
  // Get all projects with stages for the dropdown
  const projectOptions = [
    { value: 'all', label: 'All Projects' },
    ...projects.map(project => ({
      value: project._id,
      label: project.project_name
    }))
  ];
  
  // Process stages data to calculate completion times
  useEffect(() => {
    const allStages: any[] = [];
    
    // Collect all stages from projects
    projects.forEach(project => {
      if (project.stages && Array.isArray(project.stages)) {
        project.stages.forEach((stage: any) => {
          // Only include completed stages with both start and completion dates
          if (stage.status === 'Completed' && stage.start_date && stage.completion_date) {
            allStages.push({
              ...stage,
              project_name: project.project_name,
              project_id: project._id
            });
          }
        });
      }
    });
    
    // Filter by selected project if not 'all'
    const filteredStages = selectedProject === 'all' 
      ? allStages 
      : allStages.filter(stage => stage.project_id === selectedProject);
    
    // Calculate completion time in days for each stage
    const stageTimeData = filteredStages.map(stage => {
      const startDate = new Date(stage.start_date);
      const completionDate = new Date(stage.completion_date);
      const days = differenceInDays(completionDate, startDate);
      
      return {
        name: stage.stage.stage_name,
        days: days > 0 ? days : 1, // Ensure at least 1 day
        project: stage.project_name
      };
    });
    
    // Sort by days (ascending)
    stageTimeData.sort((a, b) => a.days - b.days);
    
    setChartData(stageTimeData);
  }, [projects, selectedProject]);
  
  const handleProjectChange = (value: string) => {
    setSelectedProject(value);
  };
  
  return (
    <Card className="col-span-1">
      <CardHeader>
        <div className="flex flex-col space-y-4">
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-purple-600" />
            Stage Completion Time
          </CardTitle>
          
          <div className="w-full">
            <Select value={selectedProject} onValueChange={handleProjectChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projectOptions.map(option => (
                  <SelectItem key={option.value} value={option.value} className="max-w-xs">
                    <div className="break-words">{option.label}</div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-80">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value) => [`${value} days`, 'Completion Time']}
                labelFormatter={(label) => `Stage: ${label}`}
              />
              <Legend />
              <Bar 
                dataKey="days" 
                fill="#8884d8" 
                name="Days to Complete"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Timer className="h-12 w-12 mb-4 text-gray-400" />
              <p className="mb-2">No stage completion data available</p>
              <p className="text-sm">Complete some project stages to see completion times</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};