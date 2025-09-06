// frontend/app/component/projects/project-management.tsx
"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Grid, List } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useProjects } from "@/hooks/use-projects";
import { useAuth } from "@/provider/auth-context";
import { projectSchema, type ProjectEntry } from "@/lib/schema";
import { z } from "zod";
import { ProjectFilterControls } from "./ProjectFilterControls";
import { ProjectTable } from "./ProjectTable";
import { ProjectCard } from "./project-card"; // Import only the component
import { ProjectForm } from "./ProjectForm";
import { useProjectFilters } from "./hooks/useProjectFilters";
import { useNavigate, useSearchParams } from "react-router-dom";

// Define the props interface here since it's not exported from project-card.tsx
interface ProjectCardProps {
  project: ProjectEntry;
  onEdit: (project: ProjectEntry) => void;
  onDelete: (id: string) => void;
  onProjectClick: (id: string) => void;
  canEdit: boolean;
}

const ProjectManagement = () => {
  const { user } = useAuth();
  const { projects, isLoading, error, createProject, updateProject, deleteProject } = useProjects();
  const [showForm, setShowForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<ProjectEntry | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ startDate: Date | undefined; endDate: Date | undefined; }>({ startDate: undefined, endDate: undefined });
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get filter from URL parameters
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    console.log("Filter param from URL:", filterParam); // Debug log
    
    if (filterParam) {
      if (filterParam.toLowerCase() === 'all') {
        setStatusFilter('all');
      } else if (['ongoing', 'completed', 'pending', 'archived'].includes(filterParam.toLowerCase())) {
        // Convert to proper case (first letter capitalized)
        const properCaseFilter = filterParam.charAt(0).toUpperCase() + filterParam.slice(1);
        console.log("Setting status filter to:", properCaseFilter); // Debug log
        setStatusFilter(properCaseFilter);
      }
    }
  }, [searchParams]);
  
  const { filteredAndSortedProjects, hasProjects, hasFilteredProjects } = useProjectFilters({
    projects,
    sortBy,
    statusFilter,
    searchTerm,
    dateRange: {
      startDate: dateRange.startDate ? dateRange.startDate.toISOString().split('T')[0] : undefined,
      endDate: dateRange.endDate ? dateRange.endDate.toISOString().split('T')[0] : undefined
    }
  });
  
  // Debug logs
  useEffect(() => {
    console.log("Current status filter:", statusFilter);
    console.log("Filtered projects:", filteredAndSortedProjects);
    console.log("All projects:", projects);
    console.log("Projects with ongoing status:", projects.filter(p => p.status === 'Ongoing'));
    console.log("Projects with completed status:", projects.filter(p => p.status === 'Completed'));
    console.log("Projects with pending status:", projects.filter(p => p.status === 'Pending'));
  }, [statusFilter, filteredAndSortedProjects, projects]);
  
  const handleAddClick = () => {
    // Only managers can create projects
    if (user?.role !== "manager") {
      alert("Only managers can create projects");
      return;
    }
    
    setCurrentProject(null);
    setShowForm(true);
  };
  
  const handleEditClick = (project: ProjectEntry) => {
    // Only managers can edit projects
    if (user?.role !== "manager") {
      alert("Only managers can edit projects");
      return;
    }
    
    setCurrentProject(project);
    setShowForm(true);
  };
  
  const handleDeleteClick = (_id: string) => {
    // Only managers can delete projects
    if (user?.role !== "manager") {
      alert("Only managers can delete projects");
      return;
    }
    
    setProjectToDelete(_id);
    setShowDeleteDialog(true);
  };
  
  const handleConfirmDelete = async () => {
    if (projectToDelete) {
      await deleteProject(projectToDelete);
    }
    setShowDeleteDialog(false);
    setProjectToDelete(null);
  };
  
  const handleSubmit = async (values: z.infer<typeof projectSchema>) => {
    if (currentProject) {
      await updateProject(currentProject._id, values);
    } else {
      await createProject(values);
    }
    setShowForm(false);
  };
  
  // Handle sort toggle
  const toggleSort = () => {
    setSortBy(sortBy === 'newest' ? 'oldest' : 'newest');
  };
  
  // Handle project click
  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (status: string) => {
    console.log("Status filter changed to:", status); // Debug log
    setStatusFilter(status);
    // Update URL to reflect the current filter
    const params = new URLSearchParams(searchParams);
    if (status === 'all') {
      params.delete('filter');
    } else {
      params.set('filter', status.toLowerCase());
    }
    console.log("Updating URL to:", `/projects?${params.toString()}`); // Debug log
    navigate(`/projects?${params.toString()}`, { replace: true });
  };
  
  // Determine if user can create projects
  const canCreateProjects = user?.role === "manager";
  
  return (
    <div className="container mx-auto p-4 pt-0">
      {/* Header with no bottom margin */}
      <div className="flex items-center justify-between mb-0">
        <h3 className="text-xl font-bold">
          {canCreateProjects ? "Project Management" : "Projects"}
        </h3>
        <div className="flex items-center gap-2">
          {canCreateProjects && (
            <Button onClick={handleAddClick} className="flex items-center gap-1 text-sm py-1 h-8">
              <Plus className="h-3 w-3" />
              Create Project
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')} className="flex items-center gap-1">
            {viewMode === 'table' ? (
              <>
                <Grid className="h-4 w-4" />
                Cards
              </>
            ) : (
              <>
                <List className="h-4 w-4" />
                Table
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Filter Controls */}
      <ProjectFilterControls
        sortBy={sortBy}
        statusFilter={statusFilter}
        searchTerm={searchTerm}
        dateRange={dateRange}
        onSortChange={setSortBy}
        onStatusFilterChange={handleStatusFilterChange}
        onSearchChange={setSearchTerm}
        onDateRangeChange={setDateRange}
      />
      
      {error && (
        <Alert variant="destructive" className="mb-2">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Scrollable content container */}
      <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {viewMode === 'table' ? (
              <ProjectTable
                projects={filteredAndSortedProjects}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onProjectClick={handleProjectClick}
                onSortToggle={toggleSort}
                sortBy={sortBy}
                isLoading={isLoading}
                hasProjects={hasProjects}
                hasFilteredProjects={hasFilteredProjects}
                canEdit={canCreateProjects}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAndSortedProjects.map((project) => (
                  <ProjectCard 
                    key={project._id} 
                    project={project} 
                    onEdit={handleEditClick} 
                    onDelete={handleDeleteClick}
                    onProjectClick={handleProjectClick}
                    canEdit={canCreateProjects}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Form for Adding & Editing Projects - Only for Managers */}
      {canCreateProjects && (
        <ProjectForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          project={currentProject}
          onSubmit={handleSubmit}
        />
      )}
      
      {/* Custom Confirmation Dialog for Deleting - Only for Managers */}
      {canCreateProjects && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the project.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default ProjectManagement;