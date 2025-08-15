import { useState, useEffect, useCallback } from "react";
import { useProjects } from "./use-projects";
import { useStages } from "./use-stages";
import { useAuth } from "@/provider/auth-context";
import { type ProjectEntry, type StageEntry, type ProjectStageEntry } from "@/lib/schema";
import { format, startOfYear, endOfYear, startOfMonth, endOfMonth, isWithinInterval, getYear, getMonth } from "date-fns";

export interface TimePeriod {
  type: 'year' | 'month';
  value: string;
}

export const useDashboard = (timePeriod?: TimePeriod, projects?: ProjectEntry[]) => {
  const { user } = useAuth();
  const { isLoading: projectsLoading, error: projectsError } = useProjects();
  const { stages: allStages, isLoading: stagesLoading, error: stagesError } = useStages();
  
  const [dashboardData, setDashboardData] = useState<{
    totalProjects: number;
    ongoingProjects: number;
    completedProjects: number;
    pendingProjects: number;
    totalStages: number;
    ongoingStages: number;
    completedStages: number;
    projectStatusData: any[];
    recentProjects: ProjectEntry[];
    upcomingStages: ProjectStageEntry[];
  }>({
    totalProjects: 0,
    ongoingProjects: 0,
    completedProjects: 0,
    pendingProjects: 0,
    totalStages: 0,
    ongoingStages: 0,
    completedStages: 0,
    projectStatusData: [],
    recentProjects: [],
    upcomingStages: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Process data when projects or stages change
  const processData = useCallback(() => {
    try {
      // Use the projects passed as parameter if available, otherwise use the ones from the hook
      const projectsToUse = projects || [];
      
      // Calculate statistics
      const totalProjects = projectsToUse.length;
      const ongoingProjects = projectsToUse.filter(p => p.status === 'Ongoing').length;
      const completedProjects = projectsToUse.filter(p => p.status === 'Completed').length;
      const pendingProjects = projectsToUse.filter(p => p.status === 'Pending').length;
      
      // Get all project stages from all projects
      const allProjectStages: ProjectStageEntry[] = [];
      projectsToUse.forEach(project => {
        if (project.stages && Array.isArray(project.stages)) {
          project.stages.forEach(stage => {
            // Ensure stage has the required properties
            if (stage && stage._id && stage.status) {
              allProjectStages.push(stage as ProjectStageEntry);
            }
          });
        }
      });
      
      const totalStages = allProjectStages.length;
      const ongoingStages = allProjectStages.filter(s => s.status === 'Ongoing').length;
      const completedStages = allProjectStages.filter(s => s.status === 'Completed').length;
      
      // Project status data for pie chart
      const statusCounts = {
        'Pending': pendingProjects,
        'Ongoing': ongoingProjects,
        'Completed': completedProjects,
        'Archived': projectsToUse.filter(p => p.status === 'Archived').length
      };
      
      const projectStatusData = [
        { name: 'Pending', value: statusCounts.Pending, color: '#FFBB28' },
        { name: 'Ongoing', value: statusCounts.Ongoing, color: '#0088FE' },
        { name: 'Completed', value: statusCounts.Completed, color: '#00C49F' },
        { name: 'Archived', value: statusCounts.Archived, color: '#FF8042' }
      ];
      
      // Recent projects (last 5)
      const sortedProjects = [...projectsToUse]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      
      // Upcoming stages (ongoing stages sorted by start date)
      const sortedStages = [...allProjectStages]
        .filter(stage => stage.status === 'Ongoing')
        .sort((a, b) => {
          const dateA = a.start_date ? new Date(a.start_date).getTime() : Infinity;
          const dateB = b.start_date ? new Date(b.start_date).getTime() : Infinity;
          return dateA - dateB;
        })
        .slice(0, 5);
      
      setDashboardData({
        totalProjects,
        ongoingProjects,
        completedProjects,
        pendingProjects,
        totalStages,
        ongoingStages,
        completedStages,
        projectStatusData,
        recentProjects: sortedProjects,
        upcomingStages: sortedStages
      });
      
      setIsLoading(false);
    } catch (err) {
      console.error("Error processing dashboard data:", err);
      setError("Failed to process dashboard data");
      setIsLoading(false);
    }
  }, [projects]);
  
  // Process data when projects or stages loading state changes
  useEffect(() => {
    if (!projectsLoading && !stagesLoading) {
      processData();
    }
  }, [projectsLoading, stagesLoading, processData]);
  
  // Combine errors
  useEffect(() => {
    if (projectsError || stagesError) {
      setError(projectsError || stagesError || "An error occurred");
    }
  }, [projectsError, stagesError]);
  
  return {
    ...dashboardData,
    isLoading: isLoading || projectsLoading || stagesLoading,
    error,
    refetch: processData
  };
};












// // frontend/app/hooks/useDashboard.ts
// import { useState, useEffect, useCallback } from "react";
// import { useProjects } from "./use-projects";
// import { useStages } from "./use-stages";
// import { type ProjectEntry, type StageEntry, type ProjectStageEntry } from "@/lib/schema";
// import { format, startOfYear, endOfYear, startOfMonth, endOfMonth, isWithinInterval, getYear, getMonth } from "date-fns";

// export interface TimePeriod {
//   type: 'year' | 'month';
//   value: string;
// }

// export const useDashboard = (timePeriod?: TimePeriod, projects?: ProjectEntry[]) => {
//   const { isLoading: projectsLoading, error: projectsError } = useProjects();
//   const { stages: allStages, isLoading: stagesLoading, error: stagesError } = useStages();
  
//   const [dashboardData, setDashboardData] = useState<{
//     totalProjects: number;
//     ongoingProjects: number;
//     completedProjects: number;
//     pendingProjects: number;
//     totalStages: number;
//     ongoingStages: number;
//     completedStages: number;
//     projectStatusData: any[];
//     recentProjects: ProjectEntry[];
//     upcomingStages: ProjectStageEntry[];
//   }>({
//     totalProjects: 0,
//     ongoingProjects: 0,
//     completedProjects: 0,
//     pendingProjects: 0,
//     totalStages: 0,
//     ongoingStages: 0,
//     completedStages: 0,
//     projectStatusData: [],
//     recentProjects: [],
//     upcomingStages: []
//   });
  
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
  
//   // Process data when projects or stages change
//   const processData = useCallback(() => {
//     try {
//       // Use the projects passed as parameter if available, otherwise use the ones from the hook
//       const projectsToUse = projects || [];
      
//       // Calculate statistics
//       const totalProjects = projectsToUse.length;
//       const ongoingProjects = projectsToUse.filter(p => p.status === 'Ongoing').length;
//       const completedProjects = projectsToUse.filter(p => p.status === 'Completed').length;
//       const pendingProjects = projectsToUse.filter(p => p.status === 'Pending').length;
      
//       // Get all project stages from all projects
//       const allProjectStages: ProjectStageEntry[] = [];
//       projectsToUse.forEach(project => {
//         if (project.stages && Array.isArray(project.stages)) {
//           project.stages.forEach(stage => {
//             // Ensure stage has the required properties
//             if (stage && stage._id && stage.status) {
//               allProjectStages.push(stage as ProjectStageEntry);
//             }
//           });
//         }
//       });
      
//       const totalStages = allProjectStages.length;
//       const ongoingStages = allProjectStages.filter(s => s.status === 'Ongoing').length;
//       const completedStages = allProjectStages.filter(s => s.status === 'Completed').length;
      
//       // Project status data for pie chart
//       const statusCounts = {
//         'Pending': pendingProjects,
//         'Ongoing': ongoingProjects,
//         'Completed': completedProjects,
//         'Archived': projectsToUse.filter(p => p.status === 'Archived').length
//       };
      
//       const projectStatusData = [
//         { name: 'Pending', value: statusCounts.Pending, color: '#FFBB28' },
//         { name: 'Ongoing', value: statusCounts.Ongoing, color: '#0088FE' },
//         { name: 'Completed', value: statusCounts.Completed, color: '#00C49F' },
//         { name: 'Archived', value: statusCounts.Archived, color: '#FF8042' }
//       ];
      
//       // Recent projects (last 5)
//       const sortedProjects = [...projectsToUse]
//         .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
//         .slice(0, 5);
      
//       // Upcoming stages (ongoing stages sorted by start date)
//       const sortedStages = [...allProjectStages]
//         .filter(stage => stage.status === 'Ongoing')
//         .sort((a, b) => {
//           const dateA = a.start_date ? new Date(a.start_date).getTime() : Infinity;
//           const dateB = b.start_date ? new Date(b.start_date).getTime() : Infinity;
//           return dateA - dateB;
//         })
//         .slice(0, 5);
      
//       setDashboardData({
//         totalProjects,
//         ongoingProjects,
//         completedProjects,
//         pendingProjects,
//         totalStages,
//         ongoingStages,
//         completedStages,
//         projectStatusData,
//         recentProjects: sortedProjects,
//         upcomingStages: sortedStages
//       });
      
//       setIsLoading(false);
//     } catch (err) {
//       console.error("Error processing dashboard data:", err);
//       setError("Failed to process dashboard data");
//       setIsLoading(false);
//     }
//   }, [projects]);
  
//   // Process data when projects or stages loading state changes
//   useEffect(() => {
//     if (!projectsLoading && !stagesLoading) {
//       processData();
//     }
//   }, [projectsLoading, stagesLoading, processData]);
  
//   // Combine errors
//   useEffect(() => {
//     if (projectsError || stagesError) {
//       setError(projectsError || stagesError || "An error occurred");
//     }
//   }, [projectsError, stagesError]);
  
//   return {
//     ...dashboardData,
//     isLoading: isLoading || projectsLoading || stagesLoading,
//     error,
//     refetch: processData
//   };
// };










// import { useState, useEffect, useCallback } from "react";
// import { useProjects } from "./use-projects";
// import { useStages } from "./use-stages";
// import { type ProjectEntry, type StageEntry, type ProjectStageEntry } from "@/lib/schema";
// import { format, startOfYear, endOfYear, startOfMonth, endOfMonth, isWithinInterval, getYear, getMonth } from "date-fns";

// export interface TimePeriod {
//   type: 'year' | 'month';
//   value: string;
// }

// export const useDashboard = (timePeriod?: TimePeriod) => {
//   const { projects, isLoading: projectsLoading, error: projectsError, fetchProjects, refetch: refetchProjects } = useProjects();
//   const { stages: allStages, isLoading: stagesLoading, error: stagesError } = useStages();
  
//   const [dashboardData, setDashboardData] = useState<{
//     totalProjects: number;
//     ongoingProjects: number;
//     completedProjects: number;
//     pendingProjects: number;
//     totalStages: number;
//     ongoingStages: number;
//     completedStages: number;
//     projectStatusData: any[];
//     recentProjects: ProjectEntry[];
//     upcomingStages: ProjectStageEntry[];
//   }>({
//     totalProjects: 0,
//     ongoingProjects: 0,
//     completedProjects: 0,
//     pendingProjects: 0,
//     totalStages: 0,
//     ongoingStages: 0,
//     completedStages: 0,
//     projectStatusData: [],
//     recentProjects: [],
//     upcomingStages: []
//   });
  
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Process data when projects or stages change
//   const processData = useCallback(() => {
//     try {
//       // Calculate statistics
//       const totalProjects = projects.length;
//       const ongoingProjects = projects.filter(p => p.status === 'Ongoing').length;
//       const completedProjects = projects.filter(p => p.status === 'Completed').length;
//       const pendingProjects = projects.filter(p => p.status === 'Pending').length;
      
//       // Get all project stages from all projects
//       const allProjectStages: ProjectStageEntry[] = [];
//       projects.forEach(project => {
//         if (project.stages && Array.isArray(project.stages)) {
//           project.stages.forEach(stage => {
//             // Ensure stage has the required properties
//             if (stage && stage._id && stage.status) {
//               allProjectStages.push(stage as ProjectStageEntry);
//             }
//           });
//         }
//       });
      
//       const totalStages = allProjectStages.length;
//       const ongoingStages = allProjectStages.filter(s => s.status === 'Ongoing').length;
//       const completedStages = allProjectStages.filter(s => s.status === 'Completed').length;
      
//       // Project status data for pie chart
//       const statusCounts = {
//         'Pending': pendingProjects,
//         'Ongoing': ongoingProjects,
//         'Completed': completedProjects,
//         'Archived': projects.filter(p => p.status === 'Archived').length
//       };
      
//       const projectStatusData = [
//         { name: 'Pending', value: statusCounts.Pending, color: '#FFBB28' },
//         { name: 'Ongoing', value: statusCounts.Ongoing, color: '#0088FE' },
//         { name: 'Completed', value: statusCounts.Completed, color: '#00C49F' },
//         { name: 'Archived', value: statusCounts.Archived, color: '#FF8042' }
//       ];
      
//       // Recent projects (last 5)
//       const sortedProjects = [...projects]
//         .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
//         .slice(0, 5);
      
//       // Upcoming stages (ongoing stages sorted by start date)
//       const sortedStages = [...allProjectStages]
//         .filter(stage => stage.status === 'Ongoing')
//         .sort((a, b) => {
//           const dateA = a.start_date ? new Date(a.start_date).getTime() : Infinity;
//           const dateB = b.start_date ? new Date(b.start_date).getTime() : Infinity;
//           return dateA - dateB;
//         })
//         .slice(0, 5);
      
//       setDashboardData({
//         totalProjects,
//         ongoingProjects,
//         completedProjects,
//         pendingProjects,
//         totalStages,
//         ongoingStages,
//         completedStages,
//         projectStatusData,
//         recentProjects: sortedProjects,
//         upcomingStages: sortedStages
//       });
      
//       setIsLoading(false);
//     } catch (err) {
//       console.error("Error processing dashboard data:", err);
//       setError("Failed to process dashboard data");
//       setIsLoading(false);
//     }
//   }, [projects]);

//   // Process data when projects or stages loading state changes
//   useEffect(() => {
//     if (!projectsLoading && !stagesLoading) {
//       processData();
//     }
//   }, [projectsLoading, stagesLoading, processData]);

//   // Fetch filtered projects when time period changes
//   useEffect(() => {
//     const fetchFilteredProjects = async () => {
//       setIsLoading(true);
//       try {
//         if (timePeriod) {
//           let filters = {};
          
//           if (timePeriod.type === 'year') {
//             filters = { year: timePeriod.value };
//           } else if (timePeriod.type === 'month') {
//             // For month view, we still need to specify the year
//             filters = { year: timePeriod.value };
//           }
          
//           await fetchProjects(filters);
//         } else {
//           await fetchProjects();
//         }
//       } catch (err) {
//         console.error("Error fetching filtered projects:", err);
//         setError("Failed to fetch filtered projects");
//       } finally {
//         setIsLoading(false);
//       }
//     };
    
//     fetchFilteredProjects();
//   }, [timePeriod, fetchProjects]);

//   // Combine errors
//   useEffect(() => {
//     if (projectsError || stagesError) {
//       setError(projectsError || stagesError || "An error occurred");
//     }
//   }, [projectsError, stagesError]);

//   return {
//     ...dashboardData,
//     isLoading: isLoading || projectsLoading || stagesLoading,
//     error,
//     refetch: refetchProjects
//   };
// };





// import { useState, useEffect } from "react";
// import { useProjects } from "./use-projects";
// import { useStages } from "./use-stages";
// import { type ProjectEntry, type StageEntry, type ProjectStageEntry } from "@/lib/schema";

// export const useDashboard = () => {
//   const { projects, isLoading: projectsLoading, error: projectsError, refetch: refetchProjects } = useProjects();
//   const { stages: allStages, isLoading: stagesLoading, error: stagesError } = useStages();
  
//   const [dashboardData, setDashboardData] = useState<{
//     totalProjects: number;
//     ongoingProjects: number;
//     completedProjects: number;
//     totalStages: number;
//     ongoingStages: number;
//     completedStages: number;
//     projectStatusData: any[];
//     stageProgressData: any[];
//     recentProjects: ProjectEntry[];
//     upcomingStages: ProjectStageEntry[];
//   }>({
//     totalProjects: 0,
//     ongoingProjects: 0,
//     completedProjects: 0,
//     totalStages: 0,
//     ongoingStages: 0,
//     completedStages: 0,
//     projectStatusData: [],
//     stageProgressData: [],
//     recentProjects: [],
//     upcomingStages: []
//   });
  
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const processData = () => {
//       try {
//         // Calculate statistics
//         const totalProjects = projects.length;
//         const ongoingProjects = projects.filter(p => p.status === 'Ongoing').length;
//         const completedProjects = projects.filter(p => p.status === 'Completed').length;
        
//         // Get all project stages from all projects
//         const allProjectStages: ProjectStageEntry[] = [];
//         projects.forEach(project => {
//           if (project.stages && Array.isArray(project.stages)) {
//             project.stages.forEach(stage => {
//               // Ensure stage has the required properties
//               if (stage && stage._id && stage.status) {
//                 allProjectStages.push(stage as ProjectStageEntry);
//               }
//             });
//           }
//         });
        
//         const totalStages = allProjectStages.length;
//         const ongoingStages = allProjectStages.filter(s => s.status === 'Ongoing').length;
//         const completedStages = allProjectStages.filter(s => s.status === 'Completed').length;
        
//         // Project status data for pie chart
//         const statusCounts = {
//           'Pending': 0,
//           'Ongoing': 0,
//           'Completed': 0,
//           'Archived': 0
//         };
        
//         projects.forEach(project => {
//           if (project.status && statusCounts.hasOwnProperty(project.status)) {
//             statusCounts[project.status as keyof typeof statusCounts]++;
//           }
//         });
        
//         const projectStatusData = [
//           { name: 'Pending', value: statusCounts.Pending, color: '#FFBB28' },
//           { name: 'Ongoing', value: statusCounts.Ongoing, color: '#0088FE' },
//           { name: 'Completed', value: statusCounts.Completed, color: '#00C49F' },
//           { name: 'Archived', value: statusCounts.Archived, color: '#FF8042' }
//         ];
        
//         // Stage progress data for bar chart (last 6 months)
//         const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
//         const stageProgressData = months.map((month, index) => {
//           // Generate some sample data based on actual counts
//           const baseOngoing = Math.floor(ongoingStages / 6);
//           const baseCompleted = Math.floor(completedStages / 6);
          
//           return {
//             name: month,
//             ongoing: baseOngoing + Math.floor(Math.random() * 3),
//             completed: baseCompleted + Math.floor(Math.random() * 3)
//           };
//         });
        
//         // Recent projects (last 5)
//         const sortedProjects = [...projects]
//           .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
//           .slice(0, 5);
        
//         // Upcoming stages (ongoing stages sorted by start date)
//         const sortedStages = [...allProjectStages]
//           .filter(stage => stage.status === 'Ongoing')
//           .sort((a, b) => {
//             const dateA = a.start_date ? new Date(a.start_date).getTime() : Infinity;
//             const dateB = b.start_date ? new Date(b.start_date).getTime() : Infinity;
//             return dateA - dateB;
//           })
//           .slice(0, 5);
        
//         setDashboardData({
//           totalProjects,
//           ongoingProjects,
//           completedProjects,
//           totalStages,
//           ongoingStages,
//           completedStages,
//           projectStatusData,
//           stageProgressData,
//           recentProjects: sortedProjects,
//           upcomingStages: sortedStages
//         });
        
//         setIsLoading(false);
//       } catch (err) {
//         console.error("Error processing dashboard data:", err);
//         setError("Failed to process dashboard data");
//         setIsLoading(false);
//       }
//     };

//     if (!projectsLoading && !stagesLoading) {
//       processData();
//     }
//   }, [projects, allStages, projectsLoading, stagesLoading]);

//   // Combine errors
//   useEffect(() => {
//     if (projectsError || stagesError) {
//       setError(projectsError || stagesError || "An error occurred");
//     }
//   }, [projectsError, stagesError]);

//   return {
//     ...dashboardData,
//     isLoading: isLoading || projectsLoading || stagesLoading,
//     error,
//     refetch: refetchProjects
//   };
// };