// frontend/app/component/projects/hooks/useProjectFilters.tsx
import { useMemo } from 'react';
import { type ProjectEntry } from '@/lib/schema';

interface UseProjectFiltersProps {
  projects: ProjectEntry[];
  sortBy: 'newest' | 'oldest';
  statusFilter: string;
  searchTerm: string;
  dateRange: {
    startDate: string | undefined;
    endDate: string | undefined;
  };
}

export const useProjectFilters = ({
  projects,
  sortBy,
  statusFilter,
  searchTerm,
  dateRange
}: UseProjectFiltersProps) => {
  const filteredAndSortedProjects = useMemo(() => {
    console.log("useProjectFilters called with:", {
      projectsCount: projects.length,
      statusFilter,
      searchTerm,
      dateRange
    });
    
    let result = [...projects];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(project =>
        project.project_name.toLowerCase().includes(term) ||
        (project.description && project.description.toLowerCase().includes(term)) ||
        (project.status && project.status.toLowerCase().includes(term))
      );
    }
    
    // Apply status filter (case insensitive)
    if (statusFilter !== 'all') {
      console.log(`Filtering by status: ${statusFilter}`);
      console.log(`Projects before status filter: ${result.length}`);
      result = result.filter(project => {
        // Compare in lowercase for case insensitivity
        return project.status && project.status.toLowerCase() === statusFilter.toLowerCase();
      });
      console.log(`Projects after status filter: ${result.length}`);
    }
    
    // Apply date range filter
    if (dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      result = result.filter(project => {
        const projectDate = new Date(project.created_at);
        return projectDate >= startDate && projectDate <= endDate;
      });
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      if (sortBy === 'newest') {
        return dateB - dateA; // Most recent first
      } else {
        return dateA - dateB; // Oldest first
      }
    });
    
    console.log("Final filtered projects:", result);
    return result;
  }, [projects, statusFilter, sortBy, searchTerm, dateRange]);
  
  return {
    filteredAndSortedProjects,
    hasProjects: projects.length > 0,
    hasFilteredProjects: filteredAndSortedProjects.length > 0
  };
};







// // frontend/app/hooks/use-projects.ts
// import { useState, useEffect, useCallback } from "react";
// import { type ProjectEntry, projectSchema } from "@/lib/schema";
// import { z } from "zod";

// const API_BASE_URL = "http://localhost:5000/api-v1";

// export const useProjects = () => {
//   const [projects, setProjects] = useState<ProjectEntry[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
  
//   // Memoize fetchProjects to prevent unnecessary re-renders
//   const fetchProjects = useCallback(async (filters?: { year?: string; month?: string }) => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       // Build query string from filters
//       const queryParams = new URLSearchParams();
//       if (filters?.year) queryParams.append('year', filters.year);
//       if (filters?.month) queryParams.append('month', filters.month);
      
//       const queryString = queryParams.toString();
//       const url = `${API_BASE_URL}/projects/all-projects${queryString ? `?${queryString}` : ''}`;
      
//       console.log("Fetching projects from:", url); // Debug log
      
//       const res = await fetch(url);
//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.message || "Failed to fetch projects.");
//       }
//       const data = await res.json();
//       console.log("Projects data received:", data); // Debug log
//       setProjects(data);
//     } catch (err) {
//       console.error("Error fetching projects:", err);
//       setError(err instanceof Error ? err.message : "Failed to load projects. Please try again later.");
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);
  
//   // New function to fetch available years
//   const fetchProjectYears = useCallback(async () => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/project-years`);
//       if (!res.ok) {
//         throw new Error("Failed to fetch project years.");
//       }
//       const data = await res.json();
//       return data;
//     } catch (err) {
//       console.error("Error fetching project years:", err);
//       setError(err instanceof Error ? err.message : "Failed to fetch project years.");
//       return [];
//     }
//   }, []);
  
//   const createProject = useCallback(async (newProject: z.infer<typeof projectSchema>) => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/project`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(newProject),
//       });
//       if (!res.ok) {
//         throw new Error("Failed to create project.");
//       }
//       await fetchProjects();
//     } catch (err) {
//       console.error("Error creating project:", err);
//       setError("Failed to create project. Please try again.");
//     }
//   }, [fetchProjects]);
  
//   // Update to handle partial updates
//   const updateProject = useCallback(async (id: string, updatedProject: Partial<z.infer<typeof projectSchema>>) => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(updatedProject),
//       });
//       if (!res.ok) {
//         throw new Error("Failed to update project.");
//       }
//       await fetchProjects();
//     } catch (err) {
//       console.error("Error updating project:", err);
//       setError("Failed to update project. Please try again.");
//     }
//   }, [fetchProjects]);
  
//   const deleteProject = useCallback(async (id: string) => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/delete-project/${id}`, {
//         method: "DELETE",
//       });
//       if (!res.ok) {
//         throw new Error("Failed to delete project.");
//       }
//       await fetchProjects();
//     } catch (err) {
//       console.error("Error deleting project:", err);
//       setError("Failed to delete project. Please try again.");
//     }
//   }, [fetchProjects]);
  
//   // Initial fetch on mount
//   useEffect(() => {
//     fetchProjects();
//   }, [fetchProjects]);
  
//   return {
//     projects,
//     isLoading,
//     error,
//     createProject,
//     updateProject,
//     deleteProject,
//     fetchProjects,
//     fetchProjectYears,
//     refetch: fetchProjects
//   };
// };








// // frontend/app/components/projects/hooks/useProjectFilters.tsx
// import { useMemo } from 'react';
// import { type ProjectEntry } from '@/lib/schema';

// interface UseProjectFiltersProps {
//   projects: ProjectEntry[];
//   sortBy: 'newest' | 'oldest';
//   statusFilter: string;
//   searchTerm: string;
//   dateRange: {
//     startDate: string | undefined;
//     endDate: string | undefined;
//   };
// }

// export const useProjectFilters = ({
//   projects,
//   sortBy,
//   statusFilter,
//   searchTerm,
//   dateRange
// }: UseProjectFiltersProps) => {
//   const filteredAndSortedProjects = useMemo(() => {
//     let result = [...projects];

//     // Apply search filter
//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       result = result.filter(project =>
//         project.project_name.toLowerCase().includes(term) ||
//         (project.description && project.description.toLowerCase().includes(term)) ||
//         (project.status && project.status.toLowerCase().includes(term))
//       );
//     }

//     // Apply status filter
//     if (statusFilter !== 'all') {
//       result = result.filter(project => project.status === statusFilter);
//     }

//     // Apply date range filter
//     if (dateRange.startDate && dateRange.endDate) {
//       const startDate = new Date(dateRange.startDate);
//       const endDate = new Date(dateRange.endDate);
//       result = result.filter(project => {
//         const projectDate = new Date(project.created_at);
//         return projectDate >= startDate && projectDate <= endDate;
//       });
//     }

//     // Apply sorting
//     result.sort((a, b) => {
//       const dateA = new Date(a.created_at).getTime();
//       const dateB = new Date(b.created_at).getTime();
//       if (sortBy === 'newest') {
//         return dateB - dateA; // Most recent first
//       } else {
//         return dateA - dateB; // Oldest first
//       }
//     });

//     return result;
//   }, [projects, statusFilter, sortBy, searchTerm, dateRange]);

//   return {
//     filteredAndSortedProjects,
//     hasProjects: projects.length > 0,
//     hasFilteredProjects: filteredAndSortedProjects.length > 0
//   };
// };


// import { useMemo } from 'react';
// import { type ProjectEntry } from '@/lib/schema';

// interface UseProjectFiltersProps {
//   projects: ProjectEntry[];
//   sortBy: 'newest' | 'oldest';
//   statusFilter: string;
//   searchTerm: string;
//   dateRange: {
//     startDate: string | undefined;
//     endDate: string | undefined;
//   };
// }

// export const useProjectFilters = ({
//   projects,
//   sortBy,
//   statusFilter,
//   searchTerm,
//   dateRange
// }: UseProjectFiltersProps) => {
//   const filteredAndSortedProjects = useMemo(() => {
//     let result = [...projects];
    
//     // Apply search filter
//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       result = result.filter(project => 
//         project.project_name.toLowerCase().includes(term) ||
//         (project.description && project.description.toLowerCase().includes(term)) ||
//         (project.status && project.status.toLowerCase().includes(term))
//       );
//     }
    
//     // Apply status filter
//     if (statusFilter !== 'all') {
//       result = result.filter(project => project.status === statusFilter);
//     }
    
//     // Apply date range filter
//     if (dateRange.startDate && dateRange.endDate) {
//       const startDate = new Date(dateRange.startDate);
//       const endDate = new Date(dateRange.endDate);
//       result = result.filter(project => {
//         const projectDate = new Date(project.created_at);
//         return projectDate >= startDate && projectDate <= endDate;
//       });
//     }
    
//     // Apply sorting
//     result.sort((a, b) => {
//       const dateA = new Date(a.created_at).getTime();
//       const dateB = new Date(b.created_at).getTime();
      
//       if (sortBy === 'newest') {
//         return dateB - dateA; // Most recent first
//       } else {
//         return dateA - dateB; // Oldest first
//       }
//     });
    
//     return result;
//   }, [projects, statusFilter, sortBy, searchTerm, dateRange]);

//   return {
//     filteredAndSortedProjects,
//     hasProjects: projects.length > 0,
//     hasFilteredProjects: filteredAndSortedProjects.length > 0
//   };
// };