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