

// frontend/app/component/dashboard/ProjectCountOverTime.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDays } from "lucide-react";
import { format, subYears, startOfYear, endOfYear, startOfMonth, endOfMonth, eachMonthOfInterval, getYear } from "date-fns";
import { useProjects } from "@/hooks/use-projects";

interface ProjectCountData {
  name: string;
  projects: number;
}

export interface TimePeriod {
  type: 'year' | 'month';
  value: string;
}

interface ProjectCountOverTimeProps {
  projects: any[];
  onTimePeriodChange: (period: TimePeriod) => void;
}

export const ProjectCountOverTime: React.FC<ProjectCountOverTimeProps> = ({ 
  projects, 
  onTimePeriodChange 
}) => {
  const [timeRange, setTimeRange] = useState<'year' | 'month'>('year');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [dimensions, setDimensions] = React.useState({ width: 400, height: 300 });
  const { fetchProjectYears } = useProjects();
  
  // Extract unique years from the projects data
  useEffect(() => {
    if (projects && projects.length > 0) {
      const years = new Set<string>();
      projects.forEach(project => {
        if (project.created_at) {
          const projectDate = new Date(project.created_at);
          years.add(projectDate.getFullYear().toString());
        }
      });
      
      const sortedYears = Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
      setAvailableYears(sortedYears);
      
      // Set the initial selected year to the most recent year if not already set
      if (!selectedYear && sortedYears.length > 0) {
        setSelectedYear(sortedYears[0]);
      }
    }
  }, [projects, selectedYear]);
  
  // Process projects data based on selected time range - memoized to prevent recalculation
  const chartData = useMemo(() => {
    if (!projects.length || !availableYears.length) {
      return [];
    }
    
    let data: ProjectCountData[] = [];
    
    if (timeRange === 'year') {
      // Show project count per year for all available years
      const years = availableYears.map(year => parseInt(year));
      
      data = years.map(year => {
        const yearStart = startOfYear(new Date(year, 0, 1));
        const yearEnd = endOfYear(new Date(year, 0, 1));
        
        const count = projects.filter(project => {
          const projectDate = new Date(project.created_at);
          return projectDate >= yearStart && projectDate <= yearEnd;
        }).length;
        
        return {
          name: year.toString(),
          projects: count
        };
      });
    } else {
      // Show project count per month for the selected year
      if (!selectedYear) return [];
      
      const year = parseInt(selectedYear);
      const yearStart = startOfYear(new Date(year, 0, 1));
      const yearEnd = endOfYear(new Date(year, 0, 1));
      const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });
      
      data = months.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        const count = projects.filter(project => {
          const projectDate = new Date(project.created_at);
          return projectDate >= monthStart && projectDate <= monthEnd;
        }).length;
        
        return {
          name: format(month, 'MMM'),
          projects: count
        };
      });
    }
    
    return data;
  }, [projects, timeRange, selectedYear, availableYears]);
  
  // Handle time range change - memoized to prevent unnecessary re-renders
  const handleTimeRangeChange = useCallback((value: 'year' | 'month') => {
    setTimeRange(value);
    // Create a properly typed period object
    const period: TimePeriod = { 
      type: value, 
      value: value === 'year' ? 'all' : (selectedYear || availableYears[0])
    };
    onTimePeriodChange(period);
  }, [onTimePeriodChange, selectedYear, availableYears]);
  
  // Handle year change - memoized to prevent unnecessary re-renders
  const handleYearChange = useCallback((value: string) => {
    setSelectedYear(value);
    // Create a properly typed period object
    const period: TimePeriod = { 
      type: 'month', 
      value
    };
    onTimePeriodChange(period);
  }, [onTimePeriodChange]);
  
  return (
    <Card className="w-full h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex flex-col space-y-4">
          <CardTitle className="text-base sm:text-lg md:text-xl flex items-center gap-2">
            <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
            <span className="truncate">Projects Over Time</span>
          </CardTitle>
          
          <div className="flex flex-wrap gap-2">
            <Select value={timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="w-full sm:w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="year">By Year</SelectItem>
                <SelectItem value="month">By Month</SelectItem>
              </SelectContent>
            </Select>
            {timeRange === 'month' && (
              <Select value={selectedYear} onValueChange={handleYearChange}>
                <SelectTrigger className="w-full sm:w-auto">
                  <SelectValue placeholder="Select a year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-1 sm:p-2 md:p-4 flex-grow flex flex-col overflow-hidden">
        <div className="h-full w-full min-h-[200px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 5,
                  left: 5,
                  bottom: dimensions.width < 400 ? 25 : 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: dimensions.width < 400 ? 8 : dimensions.width < 640 ? 10 : 12 }}
                  angle={dimensions.width < 640 ? -45 : 0}
                  textAnchor={dimensions.width < 640 ? "end" : "middle"}
                  height={dimensions.width < 640 ? 40 : 30}
                  interval={0}
                />
                <YAxis 
                  tick={{ fontSize: dimensions.width < 400 ? 8 : dimensions.width < 640 ? 10 : 12 }} 
                  width={dimensions.width < 400 ? 25 : 30} 
                />
                <Tooltip 
                  formatter={(value) => [`${value} projects`, 'Count']}
                  labelFormatter={(label) => `Period: ${label}`}
                />
                <Legend 
                  iconSize={dimensions.width < 400 ? 8 : 10}
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: dimensions.width < 400 ? '8px' : dimensions.width < 640 ? '10px' : '12px',
                    paddingTop: '5px'
                  }}
                />
                <Line 
                  type="linear" 
                  dataKey="projects" 
                  stroke="#8884d8" 
                  activeDot={{ r: dimensions.width < 400 ? 4 : 6 }}
                  name="Projects"
                  strokeWidth={dimensions.width < 400 ? 1 : 1.5}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <p className="mb-2 text-sm md:text-base">No project data available</p>
                <p className="text-xs md:text-sm">Create projects to see trends over time</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};





// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Button } from "@/components/ui/button";
// import { Calendar, CalendarDays } from "lucide-react";
// import { format, subYears, startOfYear, endOfYear, startOfMonth, endOfMonth, eachMonthOfInterval, eachYearOfInterval } from "date-fns";

// interface ProjectCountData {
//   name: string;
//   projects: number;
// }

// export interface TimePeriod {
//   type: 'year' | 'month';
//   value: string;
// }

// interface ProjectCountOverTimeProps {
//   projects: any[];
//   onTimePeriodChange: (period: TimePeriod) => void;
// }

// export const ProjectCountOverTime: React.FC<ProjectCountOverTimeProps> = ({ 
//   projects, 
//   onTimePeriodChange 
// }) => {
//   const [timeRange, setTimeRange] = useState<'year' | 'month'>('month');
//   const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  
//   // Generate available years (last 5 years) - memoized to prevent recalculation
//   const availableYears = useMemo(() => {
//     return Array.from({ length: 5 }, (_, i) => {
//       const year = new Date().getFullYear() - i;
//       return year.toString();
//     }).reverse();
//   }, []);

//   // Process projects data based on selected time range - memoized to prevent recalculation
//   const chartData = useMemo(() => {
//     if (!projects.length) {
//       return [];
//     }

//     let data: ProjectCountData[] = [];
    
//     if (timeRange === 'year') {
//       // Show project count per year for the last 5 years
//       const years = availableYears.map(year => parseInt(year));
      
//       data = years.map(year => {
//         const yearStart = startOfYear(new Date(year, 0, 1));
//         const yearEnd = endOfYear(new Date(year, 0, 1));
        
//         const count = projects.filter(project => {
//           const projectDate = new Date(project.created_at);
//           return projectDate >= yearStart && projectDate <= yearEnd;
//         }).length;
        
//         return {
//           name: year.toString(),
//           projects: count
//         };
//       });
//     } else {
//       // Show project count per month for the selected year
//       const year = parseInt(selectedYear);
//       const yearStart = startOfYear(new Date(year, 0, 1));
//       const yearEnd = endOfYear(new Date(year, 0, 1));
//       const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });
      
//       data = months.map(month => {
//         const monthStart = startOfMonth(month);
//         const monthEnd = endOfMonth(month);
        
//         const count = projects.filter(project => {
//           const projectDate = new Date(project.created_at);
//           return projectDate >= monthStart && projectDate <= monthEnd;
//         }).length;
        
//         return {
//           name: format(month, 'MMM'),
//           projects: count
//         };
//       });
//     }
    
//     return data;
//   }, [projects, timeRange, selectedYear, availableYears]);

//   // Handle time range change - memoized to prevent unnecessary re-renders
//   const handleTimeRangeChange = useCallback((value: 'year' | 'month') => {
//     setTimeRange(value);
//     // Create a properly typed period object
//     const period: TimePeriod = { 
//       type: value, 
//       value: value === 'year' ? 'all' : selectedYear 
//     };
//     onTimePeriodChange(period);
//   }, [onTimePeriodChange, selectedYear]);

//   // Handle year change - memoized to prevent unnecessary re-renders
//   const handleYearChange = useCallback((value: string) => {
//     setSelectedYear(value);
//     // Create a properly typed period object
//     const period: TimePeriod = { 
//       type: 'month', 
//       value 
//     };
//     onTimePeriodChange(period);
//   }, [onTimePeriodChange]);

//   return (
//     <Card className="col-span-1">
//       <CardHeader>
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
//           <CardTitle className="flex items-center gap-2">
//             <CalendarDays className="h-5 w-5 text-blue-600" />
//             Projects Over Time
//           </CardTitle>
//           <div className="flex gap-2">
//             <Select value={timeRange} onValueChange={handleTimeRangeChange}>
//               <SelectTrigger className="w-32">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="year">By Year</SelectItem>
//                 <SelectItem value="month">By Month</SelectItem>
//               </SelectContent>
//             </Select>
//             {timeRange === 'month' && (
//               <Select value={selectedYear} onValueChange={handleYearChange}>
//                 <SelectTrigger className="w-32">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {availableYears.map(year => (
//                     <SelectItem key={year} value={year}>
//                       {year}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             )}
//           </div>
//         </div>
//       </CardHeader>
//       <CardContent>
//         <div className="h-80">
//           {chartData.length > 0 ? (
//             <ResponsiveContainer width="100%" height="100%">
//               <LineChart
//                 data={chartData}
//                 margin={{
//                   top: 5,
//                   right: 30,
//                   left: 20,
//                   bottom: 5,
//                 }}
//               >
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="name" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Line 
//                   type="monotone" 
//                   dataKey="projects" 
//                   stroke="#8884d8" 
//                   activeDot={{ r: 8 }} 
//                   name="Projects"
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           ) : (
//             <div className="flex items-center justify-center h-full text-gray-500">
//               <div className="text-center">
//                 <p className="mb-2">No project data available</p>
//                 <p className="text-sm">Create projects to see trends over time</p>
//               </div>
//             </div>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// };