// frontend/app/component/dashboard/Dashboard.tsx
import React, { useState, useEffect } from "react";
import { StatsCard } from "./StatsCard";
import { ProjectStatusChart } from "./ProjectStatusChart";
import { ProjectCountOverTime } from "./ProjectCountOverTime";
import { ProjectStageInfo } from "./ProjectStageInfo";
import { StageTimeTracking } from "./StageTimeTracking";
import { RecentProjects } from "./RecentProjects"; // Import the new component
import { useDashboard, type TimePeriod } from "@/hooks/useDashboard";
import { useOutletContext } from "react-router-dom";
import { 
  FolderKanban, 
  Clock, 
  CheckCircle, 
  ListTodo, 
  Loader2,
  TrendingUp,
  Calendar,
  AlertCircle,
  BarChart3
} from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, getYear } from "date-fns";
import { useProjects } from "@/hooks/use-projects";

interface DashboardContext {
  selectedProject: any;
}

const Dashboard = () => {
  const { selectedProject } = useOutletContext<DashboardContext>();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>({
    type: 'month',
    value: new Date().getFullYear().toString()
  });
  
  // Get all projects, not filtered by time period
  const { projects, isLoading, error, fetchProjects, refetch } = useProjects();
  const [localSelectedProject, setLocalSelectedProject] = useState(selectedProject);
  
  // Use the useDashboard hook with all projects for the stats cards
  const {
    totalProjects,
    ongoingProjects,
    completedProjects,
    pendingProjects,
    totalStages,
    ongoingStages,
    completedStages,
    projectStatusData,
    recentProjects,
    upcomingStages,
    isLoading: dashboardLoading
  } = useDashboard(undefined, projects); // Pass undefined as time period to get all projects
  
  // Handle project selection
  const handleProjectSelect = (project: any) => {
    console.log("Dashboard handleProjectSelect:", project); // Debug log
    setLocalSelectedProject(project);
  };
  
  // Handle time period change with useCallback to prevent unnecessary re-renders
  const handleTimePeriodChange = React.useCallback((period: TimePeriod) => {
    setTimePeriod(period);
    console.log("Time period changed to:", period); // Debug log
  }, []);
  
  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600">{error}</p>
        </div>
        <button 
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        {/* <div className="text-sm text-gray-500">
          {timePeriod.type === 'year' 
            ? `Showing data for ${timePeriod.value === 'all' ? 'all years' : timePeriod.value}` 
            : `Showing data for ${timePeriod.value}`}
        </div> */}
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Projects"
          value={totalProjects}
          icon={FolderKanban}
          filterType="all"
        />
        <StatsCard
          title="Ongoing Projects"
          value={ongoingProjects}
          icon={Clock}
          description="Currently in progress"
          filterType="ongoing"
        />
        <StatsCard
          title="Completed Projects"
          value={completedProjects}
          icon={CheckCircle}
          description="Successfully finished"
          filterType="completed"
        />
        <StatsCard
          title="Pending Projects"
          value={pendingProjects}
          icon={AlertCircle}
          description="Not started yet"
          filterType="pending"
        />
      </div>
      
      {/* Charts and Project Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <ProjectStatusChart data={projectStatusData} />
        <ProjectStageInfo 
          project={localSelectedProject} 
          onProjectSelect={handleProjectSelect} 
        />
      </div>
      
      {/* Recent Projects and Time-based Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <RecentProjects projects={recentProjects} /> {/* Add the RecentProjects component */}
        <ProjectCountOverTime 
          projects={projects} // Pass all projects, not filtered ones
          onTimePeriodChange={handleTimePeriodChange} 
        />
      </div>
      
      {/* Additional Time-based Chart */}
      <div className="grid gap-4 md:grid-cols-1">
        <StageTimeTracking 
          projects={recentProjects} 
          selectedProjectId={localSelectedProject?._id} 
        />
      </div>
    </div>
  );
};

export default Dashboard;