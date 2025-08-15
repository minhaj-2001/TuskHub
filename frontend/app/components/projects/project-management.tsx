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






// // frontend/app/component/projects/project-management.tsx
// "use client";
// import React, { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Plus, Grid, List } from "lucide-react";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { TriangleAlert } from "lucide-react";
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
// import { useProjects } from "@/hooks/use-projects";
// import { projectSchema, type ProjectEntry } from "@/lib/schema";
// import { z } from "zod";
// import { ProjectFilterControls } from "./ProjectFilterControls";
// import { ProjectTable } from "./ProjectTable";
// import { ProjectCards } from "./projects-card";
// import { ProjectForm } from "./ProjectForm";
// import { useProjectFilters } from "./hooks/useProjectFilters";
// import { useNavigate, useSearchParams } from "react-router-dom";

// const ProjectManagement = () => {
//   const { projects, isLoading, error, createProject, updateProject, deleteProject } = useProjects();
//   const [showForm, setShowForm] = useState(false);
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
//   const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
//   const [currentProject, setCurrentProject] = useState<ProjectEntry | null>(null);
//   const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
//   const [statusFilter, setStatusFilter] = useState<string>('all');
//   const [searchTerm, setSearchTerm] = useState<string>('');
//   const [dateRange, setDateRange] = useState<{ startDate: Date | undefined; endDate: Date | undefined; }>({ startDate: undefined, endDate: undefined });
//   const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
  
//   // Get filter from URL parameters
//   useEffect(() => {
//     const filterParam = searchParams.get('filter');
//     console.log("Filter param from URL:", filterParam); // Debug log
    
//     if (filterParam) {
//       if (filterParam.toLowerCase() === 'all') {
//         setStatusFilter('all');
//       } else if (['ongoing', 'completed', 'pending', 'archived'].includes(filterParam.toLowerCase())) {
//         // Convert to proper case (first letter capitalized)
//         const properCaseFilter = filterParam.charAt(0).toUpperCase() + filterParam.slice(1);
//         console.log("Setting status filter to:", properCaseFilter); // Debug log
//         setStatusFilter(properCaseFilter);
//       }
//     }
//   }, [searchParams]);
  
//   const { filteredAndSortedProjects, hasProjects, hasFilteredProjects } = useProjectFilters({
//     projects,
//     sortBy,
//     statusFilter,
//     searchTerm,
//     dateRange: {
//       startDate: dateRange.startDate ? dateRange.startDate.toISOString().split('T')[0] : undefined,
//       endDate: dateRange.endDate ? dateRange.endDate.toISOString().split('T')[0] : undefined
//     }
//   });
  
//   // Debug logs
//   useEffect(() => {
//     console.log("Current status filter:", statusFilter);
//     console.log("Filtered projects:", filteredAndSortedProjects);
//     console.log("All projects:", projects);
//     console.log("Projects with ongoing status:", projects.filter(p => p.status === 'Ongoing'));
//     console.log("Projects with completed status:", projects.filter(p => p.status === 'Completed'));
//     console.log("Projects with pending status:", projects.filter(p => p.status === 'Pending'));
//   }, [statusFilter, filteredAndSortedProjects, projects]);
  
//   const handleAddClick = () => {
//     setCurrentProject(null);
//     setShowForm(true);
//   };
  
//   const handleEditClick = (project: ProjectEntry) => {
//     setCurrentProject(project);
//     setShowForm(true);
//   };
  
//   const handleDeleteClick = (_id: string) => {
//     setProjectToDelete(_id);
//     setShowDeleteDialog(true);
//   };
  
//   const handleConfirmDelete = async () => {
//     if (projectToDelete) {
//       await deleteProject(projectToDelete);
//     }
//     setShowDeleteDialog(false);
//     setProjectToDelete(null);
//   };
  
//   const handleSubmit = async (values: z.infer<typeof projectSchema>) => {
//     if (currentProject) {
//       await updateProject(currentProject._id, values);
//     } else {
//       await createProject(values);
//     }
//     setShowForm(false);
//   };
  
//   // Handle sort toggle
//   const toggleSort = () => {
//     setSortBy(sortBy === 'newest' ? 'oldest' : 'newest');
//   };
  
//   // Handle project click
//   const handleProjectClick = (projectId: string) => {
//     navigate(`/projects/${projectId}`);
//   };
  
//   // Handle status filter change
//   const handleStatusFilterChange = (status: string) => {
//     console.log("Status filter changed to:", status); // Debug log
//     setStatusFilter(status);
//     // Update URL to reflect the current filter
//     const params = new URLSearchParams(searchParams);
//     if (status === 'all') {
//       params.delete('filter');
//     } else {
//       params.set('filter', status.toLowerCase());
//     }
//     console.log("Updating URL to:", `/projects?${params.toString()}`); // Debug log
//     navigate(`/projects?${params.toString()}`, { replace: true });
//   };
  
//   return (
//     <div className="container mx-auto p-4 pt-0">
//       {/* Header with no bottom margin */}
//       <div className="flex items-center justify-between mb-0">
//         <h3 className="text-xl font-bold">Project Management</h3>
//         <div className="flex items-center gap-2">
//           <Button onClick={handleAddClick} className="flex items-center gap-1 text-sm py-1 h-8">
//             <Plus className="h-3 w-3" />
//             Create Project
//           </Button>
//           <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')} className="flex items-center gap-1">
//             {viewMode === 'table' ? (
//               <>
//                 <Grid className="h-4 w-4" />
//                 Cards
//               </>
//             ) : (
//               <>
//                 <List className="h-4 w-4" />
//                 Table
//               </>
//             )}
//           </Button>
//         </div>
//       </div>
      
//       {/* Filter Controls */}
//       <ProjectFilterControls
//         sortBy={sortBy}
//         statusFilter={statusFilter}
//         searchTerm={searchTerm}
//         dateRange={dateRange}
//         onSortChange={setSortBy}
//         onStatusFilterChange={handleStatusFilterChange}
//         onSearchChange={setSearchTerm}
//         onDateRangeChange={setDateRange}
//       />
      
//       {error && (
//         <Alert variant="destructive" className="mb-2">
//           <TriangleAlert className="h-4 w-4" />
//           <AlertTitle>Error</AlertTitle>
//           <AlertDescription>{error}</AlertDescription>
//         </Alert>
//       )}
      
//       {/* Scrollable content container */}
//       <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
//         {isLoading ? (
//           <div className="flex items-center justify-center h-32">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//           </div>
//         ) : (
//           <>
//             {viewMode === 'table' ? (
//               <ProjectTable
//                 projects={filteredAndSortedProjects}
//                 onEdit={handleEditClick}
//                 onDelete={handleDeleteClick}
//                 onProjectClick={handleProjectClick}
//                 onSortToggle={toggleSort}
//                 sortBy={sortBy}
//                 isLoading={isLoading}
//                 hasProjects={hasProjects}
//                 hasFilteredProjects={hasFilteredProjects}
//               />
//             ) : (
//               <ProjectCards
//                 projects={filteredAndSortedProjects}
//                 onEdit={handleEditClick}
//                 onDelete={handleDeleteClick}
//                 onProjectClick={handleProjectClick}
//               />
//             )}
//           </>
//         )}
//       </div>
      
//       {/* Form for Adding & Editing Projects */}
//       <ProjectForm
//         isOpen={showForm}
//         onClose={() => setShowForm(false)}
//         project={currentProject}
//         onSubmit={handleSubmit}
//       />
      
//       {/* Custom Confirmation Dialog for Deleting */}
//       <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This action cannot be undone. This will permanently delete the project.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={handleConfirmDelete}>Continue</AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// };

// export default ProjectManagement;







// // frontend/app/components/projects/project-management.tsx
// "use client";
// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Plus, Grid, List } from "lucide-react";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { TriangleAlert } from "lucide-react";
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
// import { useProjects } from "@/hooks/use-projects";
// import { projectSchema, type ProjectEntry } from "@/lib/schema";
// import { z } from "zod";
// import { ProjectFilterControls } from "./ProjectFilterControls";
// import { ProjectTable } from "./ProjectTable";
// import { ProjectCards } from "./projects-card";
// import { ProjectForm } from "./ProjectForm";
// import { useProjectFilters } from "./hooks/useProjectFilters";
// import { useNavigate } from "react-router-dom";

// const ProjectManagement = () => {
//   const { projects, isLoading, error, createProject, updateProject, deleteProject } = useProjects();
//   const [showForm, setShowForm] = useState(false);
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
//   const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
//   const [currentProject, setCurrentProject] = useState<ProjectEntry | null>(null);
//   const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
//   const [statusFilter, setStatusFilter] = useState<string>('all');
//   const [searchTerm, setSearchTerm] = useState<string>('');
//   const [dateRange, setDateRange] = useState<{ startDate: Date | undefined; endDate: Date | undefined; }>({ startDate: undefined, endDate: undefined });
//   const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
//   const navigate = useNavigate();

//   const { filteredAndSortedProjects, hasProjects, hasFilteredProjects } = useProjectFilters({
//     projects,
//     sortBy,
//     statusFilter,
//     searchTerm,
//     dateRange: {
//       startDate: dateRange.startDate ? dateRange.startDate.toISOString().split('T')[0] : undefined,
//       endDate: dateRange.endDate ? dateRange.endDate.toISOString().split('T')[0] : undefined
//     }
//   });

//   const handleAddClick = () => {
//     setCurrentProject(null);
//     setShowForm(true);
//   };

//   const handleEditClick = (project: ProjectEntry) => {
//     setCurrentProject(project);
//     setShowForm(true);
//   };

//   const handleDeleteClick = (_id: string) => {
//     setProjectToDelete(_id);
//     setShowDeleteDialog(true);
//   };

//   const handleConfirmDelete = async () => {
//     if (projectToDelete) {
//       await deleteProject(projectToDelete);
//     }
//     setShowDeleteDialog(false);
//     setProjectToDelete(null);
//   };

//   const handleSubmit = async (values: z.infer<typeof projectSchema>) => {
//     if (currentProject) {
//       await updateProject(currentProject._id, values);
//     } else {
//       await createProject(values);
//     }
//     setShowForm(false);
//   };

//   // Handle sort toggle
//   const toggleSort = () => {
//     setSortBy(sortBy === 'newest' ? 'oldest' : 'newest');
//   };

//   // Handle project click
//   const handleProjectClick = (projectId: string) => {
//     navigate(`/projects/${projectId}`);
//   };

//   return (
//     <div className="container mx-auto p-4 pt-0">
//       {/* Header with no bottom margin */}
//       <div className="flex items-center justify-between mb-0">
//         <h3 className="text-xl font-bold">Project Management</h3>
//         <div className="flex items-center gap-2">
//           <Button onClick={handleAddClick} className="flex items-center gap-1 text-sm py-1 h-8">
//             <Plus className="h-3 w-3" />
//             Create Project
//           </Button>
//           <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')} className="flex items-center gap-1">
//             {viewMode === 'table' ? (
//               <>
//                 <Grid className="h-4 w-4" />
//                 Cards
//               </>
//             ) : (
//               <>
//                 <List className="h-4 w-4" />
//                 Table
//               </>
//             )}
//           </Button>
//         </div>
//       </div>

//       {/* Filter Controls */}
//       <ProjectFilterControls
//         sortBy={sortBy}
//         statusFilter={statusFilter}
//         searchTerm={searchTerm}
//         dateRange={dateRange}
//         onSortChange={setSortBy}
//         onStatusFilterChange={setStatusFilter}
//         onSearchChange={setSearchTerm}
//         onDateRangeChange={setDateRange}
//       />

//       {error && (
//         <Alert variant="destructive" className="mb-2">
//           <TriangleAlert className="h-4 w-4" />
//           <AlertTitle>Error</AlertTitle>
//           <AlertDescription>{error}</AlertDescription>
//         </Alert>
//       )}

//       {/* Scrollable content container */}
//       <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
//         {isLoading ? (
//           <div className="flex items-center justify-center h-32">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//           </div>
//         ) : (
//           <>
//             {viewMode === 'table' ? (
//               <ProjectTable
//                 projects={filteredAndSortedProjects}
//                 onEdit={handleEditClick}
//                 onDelete={handleDeleteClick}
//                 onProjectClick={handleProjectClick}
//                 onSortToggle={toggleSort}
//                 sortBy={sortBy}
//                 isLoading={isLoading}
//                 hasProjects={hasProjects}
//                 hasFilteredProjects={hasFilteredProjects}
//               />
//             ) : (
//               <ProjectCards
//                 projects={filteredAndSortedProjects}
//                 onEdit={handleEditClick}
//                 onDelete={handleDeleteClick}
//                 onProjectClick={handleProjectClick}
//               />
//             )}
//           </>
//         )}
//       </div>

//       {/* Form for Adding & Editing Projects */}
//       <ProjectForm
//         isOpen={showForm}
//         onClose={() => setShowForm(false)}
//         project={currentProject}
//         onSubmit={handleSubmit}
//       />

//       {/* Custom Confirmation Dialog for Deleting */}
//       <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This action cannot be undone. This will permanently delete the project.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={handleConfirmDelete}>Continue</AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// };

// export default ProjectManagement;




// // frontend/app/components/projects/project-management.tsx
// "use client";
// import { useNavigate } from "react-router-dom";
// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Plus, Grid, List } from "lucide-react";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { TriangleAlert } from "lucide-react";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { useProjects } from "@/hooks/use-projects";
// import { projectSchema, type ProjectEntry } from "@/lib/schema";
// import { z } from "zod";
// import { ProjectFilterControls } from "./ProjectFilterControls";
// import { ProjectTable } from "./ProjectTable";
// import { ProjectCards } from "./projects-card";
// import { ProjectForm } from "./ProjectForm";
// import { useProjectFilters } from "./hooks/useProjectFilters";

// const ProjectManagement = () => {
//   const { projects, isLoading, error, createProject, updateProject, deleteProject } = useProjects();
//   const [showForm, setShowForm] = useState(false);
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
//   const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
//   const [currentProject, setCurrentProject] = useState<ProjectEntry | null>(null);
//   const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
//   const [statusFilter, setStatusFilter] = useState<string>('all');
//   const [searchTerm, setSearchTerm] = useState<string>('');
//   const [dateRange, setDateRange] = useState<{
//     startDate: Date | undefined;
//     endDate: Date | undefined;
//   }>({ startDate: undefined, endDate: undefined });
//   const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
//   const { filteredAndSortedProjects, hasProjects, hasFilteredProjects } = useProjectFilters({
//     projects,
//     sortBy,
//     statusFilter,
//     searchTerm,
//     dateRange: {
//       startDate: dateRange.startDate ? dateRange.startDate.toISOString().split('T')[0] : undefined,
//       endDate: dateRange.endDate ? dateRange.endDate.toISOString().split('T')[0] : undefined
//     }
//   });

//   const handleAddClick = () => {
//     setCurrentProject(null);
//     setShowForm(true);
//   };

//   const handleEditClick = (project: ProjectEntry) => {
//     setCurrentProject(project);
//     setShowForm(true);
//   };

//   const handleDeleteClick = (_id: string) => {
//     setProjectToDelete(_id);
//     setShowDeleteDialog(true);
//   };

//   const handleConfirmDelete = async () => {
//     if (projectToDelete) {
//       await deleteProject(projectToDelete);
//     }
//     setShowDeleteDialog(false);
//     setProjectToDelete(null);
//   };

//   const handleSubmit = async (values: z.infer<typeof projectSchema>) => {
//     if (currentProject) {
//       await updateProject(currentProject._id, values);
//     } else {
//       await createProject(values);
//     }
//     setShowForm(false);
//   };

//   // Handle sort toggle
//   const toggleSort = () => {
//     setSortBy(sortBy === 'newest' ? 'oldest' : 'newest');
//   };

//   return (
//     <div className="container mx-auto p-4 pt-0">
//       {/* Header with no bottom margin */}
//       <div className="flex items-center justify-between mb-0">
//         <h3 className="text-xl font-bold">Project Management</h3>
//         <div className="flex items-center gap-2">
//           <Button 
//             onClick={handleAddClick} 
//             className="flex items-center gap-1 text-sm py-1 h-8"
//           >
//             <Plus className="h-3 w-3" /> Create Project
//           </Button>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
//             className="flex items-center gap-1"
//           >
//             {viewMode === 'table' ? (
//               <>
//                 <Grid className="h-4 w-4" /> Cards
//               </>
//             ) : (
//               <>
//                 <List className="h-4 w-4" /> Table
//               </>
//             )}
//           </Button>
//         </div>
//       </div>
      
//       {/* Filter Controls */}
//       <ProjectFilterControls
//         sortBy={sortBy}
//         statusFilter={statusFilter}
//         searchTerm={searchTerm}
//         dateRange={dateRange}
//         onSortChange={setSortBy}
//         onStatusFilterChange={setStatusFilter}
//         onSearchChange={setSearchTerm}
//         onDateRangeChange={setDateRange}
//       />
      
//       {error && (
//         <Alert variant="destructive" className="mb-2">
//           <TriangleAlert className="h-4 w-4" />
//           <AlertTitle>Error</AlertTitle>
//           <AlertDescription>{error}</AlertDescription>
//         </Alert>
//       )}
      
//       {/* Scrollable content container */}
//       <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
//         {isLoading ? (
//           <div className="flex items-center justify-center h-32">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//           </div>
//         ) : (
//           <>
//             {viewMode === 'table' ? (
//               <ProjectTable
//                 projects={filteredAndSortedProjects}
//                 onEdit={handleEditClick}
//                 onDelete={handleDeleteClick}
//                 onSortToggle={toggleSort}
//                 sortBy={sortBy}
//                 isLoading={isLoading}
//                 hasProjects={hasProjects}
//                 hasFilteredProjects={hasFilteredProjects}
//               />
//             ) : (
//               <ProjectCards
//                 projects={filteredAndSortedProjects}
//                 onEdit={handleEditClick}
//                 onDelete={handleDeleteClick}
//               />
//             )}
//           </>
//         )}
//       </div>
      
//       {/* Form for Adding & Editing Projects */}
//       <ProjectForm
//         isOpen={showForm}
//         onClose={() => setShowForm(false)}
//         project={currentProject}
//         onSubmit={handleSubmit}
//       />
      
//       {/* Custom Confirmation Dialog for Deleting */}
//       <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This action cannot be undone. This will permanently delete the project.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={handleConfirmDelete}>Continue</AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// };

// export default ProjectManagement;



// "use client";
// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Plus } from "lucide-react";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { TriangleAlert } from "lucide-react";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { useProjects } from "@/hooks/use-projects";
// import { projectSchema, type ProjectEntry } from "@/lib/schema";
// import { z } from "zod";
// import { ProjectFilterControls } from "./ProjectFilterControls";
// import { ProjectTable } from "./ProjectTable";
// import { ProjectForm } from "./ProjectForm";
// import { useProjectFilters } from "./hooks/useProjectFilters";
// import { SearchBar } from "@/components/ui/search-bar"; // Add this import

// const ProjectManagement = () => {
//   const { projects, isLoading, error, createProject, updateProject, deleteProject } = useProjects();
//   const [showForm, setShowForm] = useState(false);
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
//   const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
//   const [currentProject, setCurrentProject] = useState<ProjectEntry | null>(null);
//   const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
//   const [statusFilter, setStatusFilter] = useState<string>('all');
//   const [searchTerm, setSearchTerm] = useState<string>('');
//   const [dateRange, setDateRange] = useState<{
//     startDate: Date | undefined;
//     endDate: Date | undefined;
//   }>({ startDate: undefined, endDate: undefined });
  
//   const { filteredAndSortedProjects, hasProjects, hasFilteredProjects } = useProjectFilters({
//     projects,
//     sortBy,
//     statusFilter,
//     searchTerm,
//     dateRange: {
//       startDate: dateRange.startDate ? dateRange.startDate.toISOString().split('T')[0] : undefined,
//       endDate: dateRange.endDate ? dateRange.endDate.toISOString().split('T')[0] : undefined
//     }
//   });

//   const handleAddClick = () => {
//     setCurrentProject(null);
//     setShowForm(true);
//   };

//   const handleEditClick = (project: ProjectEntry) => {
//     setCurrentProject(project);
//     setShowForm(true);
//   };

//   const handleDeleteClick = (_id: string) => {
//     setProjectToDelete(_id);
//     setShowDeleteDialog(true);
//   };

//   const handleConfirmDelete = async () => {
//     if (projectToDelete) {
//       await deleteProject(projectToDelete);
//     }
//     setShowDeleteDialog(false);
//     setProjectToDelete(null);
//   };

//   const handleSubmit = async (values: z.infer<typeof projectSchema>) => {
//     if (currentProject) {
//       await updateProject(currentProject._id, values);
//     } else {
//       await createProject(values);
//     }
//     setShowForm(false);
//   };

//   // Handle sort toggle
//   const toggleSort = () => {
//     setSortBy(sortBy === 'newest' ? 'oldest' : 'newest');
//   };

//   return (
//     <div className="container mx-auto p-4 pt-0">
//       {/* Header with no bottom margin */}
//       <div className="flex items-center justify-between mb-0">
//         <h3 className="text-xl font-bold">Project Management</h3>
//         <Button 
//           onClick={handleAddClick} 
//           className="flex items-center gap-1 text-sm py-1 h-8"
//         >
//           <Plus className="h-3 w-3" /> Create Project
//         </Button>
//       </div>
      
//       {/* Filter Controls with SearchBar */}
//       <ProjectFilterControls
//         sortBy={sortBy}
//         statusFilter={statusFilter}
//         searchTerm={searchTerm}
//         dateRange={dateRange}
//         onSortChange={setSortBy}
//         onStatusFilterChange={setStatusFilter}
//         onSearchChange={setSearchTerm}
//         onDateRangeChange={setDateRange}
//       />
      
//       {error && (
//         <Alert variant="destructive" className="mb-2">
//           <TriangleAlert className="h-4 w-4" />
//           <AlertTitle>Error</AlertTitle>
//           <AlertDescription>{error}</AlertDescription>
//         </Alert>
//       )}
      
//       {/* Scrollable table container */}
//       <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
//         <ProjectTable
//           projects={filteredAndSortedProjects}
//           onEdit={handleEditClick}
//           onDelete={handleDeleteClick}
//           onSortToggle={toggleSort}
//           sortBy={sortBy}
//           isLoading={isLoading}
//           hasProjects={hasProjects}
//           hasFilteredProjects={hasFilteredProjects}
//         />
//       </div>
      
//       {/* Form for Adding & Editing Projects */}
//       <ProjectForm
//         isOpen={showForm}
//         onClose={() => setShowForm(false)}
//         project={currentProject}
//         onSubmit={handleSubmit}
//       />
      
//       {/* Custom Confirmation Dialog for Deleting */}
//       <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This action cannot be undone. This will permanently delete the project.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={handleConfirmDelete}>Continue</AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// };

// export default ProjectManagement;





// "use client";
// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Plus } from "lucide-react";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { TriangleAlert } from "lucide-react";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { useProjects } from "@/hooks/use-projects";
// import { projectSchema, type ProjectEntry } from "@/lib/schema";
// import { z } from "zod";
// import { ProjectFilterControls } from "./ProjectFilterControls";
// import { ProjectTable } from "./ProjectTable";
// import { ProjectForm } from "./ProjectForm";
// import { useProjectFilters } from "./hooks/useProjectFilters";

// const ProjectManagement = () => {
//   const { projects, isLoading, error, createProject, updateProject, deleteProject } = useProjects();
//   const [showForm, setShowForm] = useState(false);
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
//   const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
//   const [currentProject, setCurrentProject] = useState<ProjectEntry | null>(null);
//   const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
//   const [statusFilter, setStatusFilter] = useState<string>('all');
//   const [searchTerm, setSearchTerm] = useState<string>('');
//   const [dateRange, setDateRange] = useState<{
//     startDate: Date | undefined;
//     endDate: Date | undefined;
//   }>({ startDate: undefined, endDate: undefined });
  
//   const { filteredAndSortedProjects, hasProjects, hasFilteredProjects } = useProjectFilters({
//     projects,
//     sortBy,
//     statusFilter,
//     searchTerm,
//     dateRange: {
//       startDate: dateRange.startDate ? dateRange.startDate.toISOString().split('T')[0] : undefined,
//       endDate: dateRange.endDate ? dateRange.endDate.toISOString().split('T')[0] : undefined
//     }
//   });

//   const handleAddClick = () => {
//     setCurrentProject(null);
//     setShowForm(true);
//   };

//   const handleEditClick = (project: ProjectEntry) => {
//     setCurrentProject(project);
//     setShowForm(true);
//   };

//   const handleDeleteClick = (_id: string) => {
//     setProjectToDelete(_id);
//     setShowDeleteDialog(true);
//   };

//   const handleConfirmDelete = async () => {
//     if (projectToDelete) {
//       await deleteProject(projectToDelete);
//     }
//     setShowDeleteDialog(false);
//     setProjectToDelete(null);
//   };

//   const handleSubmit = async (values: z.infer<typeof projectSchema>) => {
//     if (currentProject) {
//       await updateProject(currentProject._id, values);
//     } else {
//       await createProject(values);
//     }
//     setShowForm(false);
//   };

//   // Handle sort toggle
//   const toggleSort = () => {
//     setSortBy(sortBy === 'newest' ? 'oldest' : 'newest');
//   };

//   return (
//     <div className="container mx-auto p-4 pt-0">
//       {/* Header with no bottom margin */}
//       <div className="flex items-center justify-between mb-0">
//         <h3 className="text-xl font-bold">Project Management</h3>
//         <Button 
//           onClick={handleAddClick} 
//           className="flex items-center gap-1 text-sm py-1 h-8"
//         >
//           <Plus className="h-3 w-3" /> Create Project
//         </Button>
//       </div>
      
//       {/* Filter Controls with reduced margin */}
//       <ProjectFilterControls
//         sortBy={sortBy}
//         statusFilter={statusFilter}
//         searchTerm={searchTerm}
//         dateRange={dateRange}
//         onSortChange={setSortBy}
//         onStatusFilterChange={setStatusFilter}
//         onSearchChange={setSearchTerm}
//         onDateRangeChange={setDateRange}
//       />
      
//       {error && (
//         <Alert variant="destructive" className="mb-2">
//           <TriangleAlert className="h-4 w-4" />
//           <AlertTitle>Error</AlertTitle>
//           <AlertDescription>{error}</AlertDescription>
//         </Alert>
//       )}
      
//       {/* Scrollable table container */}
//       <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
//         <ProjectTable
//           projects={filteredAndSortedProjects}
//           onEdit={handleEditClick}
//           onDelete={handleDeleteClick}
//           onSortToggle={toggleSort}
//           sortBy={sortBy}
//           isLoading={isLoading}
//           hasProjects={hasProjects}
//           hasFilteredProjects={hasFilteredProjects}
//         />
//       </div>
      
//       {/* Form for Adding & Editing Projects */}
//       <ProjectForm
//         isOpen={showForm}
//         onClose={() => setShowForm(false)}
//         project={currentProject}
//         onSubmit={handleSubmit}
//       />
      
//       {/* Custom Confirmation Dialog for Deleting */}
//       <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This action cannot be undone. This will permanently delete the project.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={handleConfirmDelete}>Continue</AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// };

// export default ProjectManagement;










// "use client";
// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Plus } from "lucide-react";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { TriangleAlert } from "lucide-react";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { useProjects } from "@/hooks/use-projects";
// import { projectSchema, type ProjectEntry } from "@/lib/schema";
// import { z } from "zod";
// import { ProjectFilterControls } from "./ProjectFilterControls";
// import { ProjectTable } from "./ProjectTable";
// import { ProjectForm } from "./ProjectForm";
// import { useProjectFilters } from "./hooks/useProjectFilters";

// const ProjectManagement = () => {
//   const { projects, isLoading, error, createProject, updateProject, deleteProject } = useProjects();
//   const [showForm, setShowForm] = useState(false);
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
//   const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
//   const [currentProject, setCurrentProject] = useState<ProjectEntry | null>(null);
//   const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
//   const [statusFilter, setStatusFilter] = useState<string>('all');
//   const [searchTerm, setSearchTerm] = useState<string>('');
//   const [dateRange, setDateRange] = useState<{
//     startDate: Date | undefined;
//     endDate: Date | undefined;
//   }>({ startDate: undefined, endDate: undefined });
  
//   const { filteredAndSortedProjects, hasProjects, hasFilteredProjects } = useProjectFilters({
//     projects,
//     sortBy,
//     statusFilter,
//     searchTerm,
//     dateRange: {
//       startDate: dateRange.startDate ? dateRange.startDate.toISOString().split('T')[0] : undefined,
//       endDate: dateRange.endDate ? dateRange.endDate.toISOString().split('T')[0] : undefined
//     }
//   });

//   const handleAddClick = () => {
//     setCurrentProject(null);
//     setShowForm(true);
//   };

//   const handleEditClick = (project: ProjectEntry) => {
//     setCurrentProject(project);
//     setShowForm(true);
//   };

//   const handleDeleteClick = (_id: string) => {
//     setProjectToDelete(_id);
//     setShowDeleteDialog(true);
//   };

//   const handleConfirmDelete = async () => {
//     if (projectToDelete) {
//       await deleteProject(projectToDelete);
//     }
//     setShowDeleteDialog(false);
//     setProjectToDelete(null);
//   };

//   const handleSubmit = async (values: z.infer<typeof projectSchema>) => {
//     if (currentProject) {
//       await updateProject(currentProject._id, values);
//     } else {
//       await createProject(values);
//     }
//     setShowForm(false);
//   };

//   // Handle sort toggle
//   const toggleSort = () => {
//     setSortBy(sortBy === 'newest' ? 'oldest' : 'newest');
//   };

//   return (
//     <div className="container mx-auto p-4 pt-0">
//       {/* Header with no bottom margin */}
//       <div className="flex items-center justify-between mb-0">
//         <h3 className="text-xl font-bold">Project Management</h3>
//         <Button 
//           onClick={handleAddClick} 
//           className="flex items-center gap-1 text-sm py-1 h-8"
//         >
//           <Plus className="h-3 w-3" /> Create Project
//         </Button>
//       </div>
      
//       {/* Filter Controls with reduced margin */}
//       <ProjectFilterControls
//         sortBy={sortBy}
//         statusFilter={statusFilter}
//         searchTerm={searchTerm}
//         dateRange={dateRange}
//         onSortChange={setSortBy}
//         onStatusFilterChange={setStatusFilter}
//         onSearchChange={setSearchTerm}
//         onDateRangeChange={setDateRange}
//       />
      
//       {error && (
//         <Alert variant="destructive" className="mb-2">
//           <TriangleAlert className="h-4 w-4" />
//           <AlertTitle>Error</AlertTitle>
//           <AlertDescription>{error}</AlertDescription>
//         </Alert>
//       )}
      
//       <ProjectTable
//         projects={filteredAndSortedProjects}
//         onEdit={handleEditClick}
//         onDelete={handleDeleteClick}
//         onSortToggle={toggleSort}
//         sortBy={sortBy}
//         isLoading={isLoading}
//         hasProjects={hasProjects}
//         hasFilteredProjects={hasFilteredProjects}
//       />
      
//       {/* Form for Adding & Editing Projects */}
//       <ProjectForm
//         isOpen={showForm}
//         onClose={() => setShowForm(false)}
//         project={currentProject}
//         onSubmit={handleSubmit}
//       />
      
//       {/* Custom Confirmation Dialog for Deleting */}
//       <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This action cannot be undone. This will permanently delete the project.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={handleConfirmDelete}>Continue</AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// };

// export default ProjectManagement;









// "use client";
// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Plus } from "lucide-react";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { TriangleAlert } from "lucide-react";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { useProjects } from "@/hooks/use-projects";
// import { projectSchema, type ProjectEntry } from "@/lib/schema";
// import { z } from "zod";
// import { ProjectFilterControls } from "./ProjectFilterControls";
// import { ProjectTable } from "./ProjectTable";
// import { ProjectForm } from "./ProjectForm";
// import { useProjectFilters } from "./hooks/useProjectFilters";

// const ProjectManagement = () => {
//   const { projects, isLoading, error, createProject, updateProject, deleteProject } = useProjects();
//   const [showForm, setShowForm] = useState(false);
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
//   const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
//   const [currentProject, setCurrentProject] = useState<ProjectEntry | null>(null);
//   const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
//   const [statusFilter, setStatusFilter] = useState<string>('all');
//   const [searchTerm, setSearchTerm] = useState<string>('');
//   const [dateRange, setDateRange] = useState<{
//     startDate: Date | undefined;
//     endDate: Date | undefined;
//   }>({ startDate: undefined, endDate: undefined });
  
//   const { filteredAndSortedProjects, hasProjects, hasFilteredProjects } = useProjectFilters({
//     projects,
//     sortBy,
//     statusFilter,
//     searchTerm,
//     dateRange: {
//       startDate: dateRange.startDate ? dateRange.startDate.toISOString().split('T')[0] : undefined,
//       endDate: dateRange.endDate ? dateRange.endDate.toISOString().split('T')[0] : undefined
//     }
//   });

//   const handleAddClick = () => {
//     setCurrentProject(null);
//     setShowForm(true);
//   };

//   const handleEditClick = (project: ProjectEntry) => {
//     setCurrentProject(project);
//     setShowForm(true);
//   };

//   const handleDeleteClick = (_id: string) => {
//     setProjectToDelete(_id);
//     setShowDeleteDialog(true);
//   };

//   const handleConfirmDelete = async () => {
//     if (projectToDelete) {
//       await deleteProject(projectToDelete);
//     }
//     setShowDeleteDialog(false);
//     setProjectToDelete(null);
//   };

//   const handleSubmit = async (values: z.infer<typeof projectSchema>) => {
//     if (currentProject) {
//       await updateProject(currentProject._id, values);
//     } else {
//       await createProject(values);
//     }
//     setShowForm(false);
//   };

//   // Handle sort toggle
//   const toggleSort = () => {
//     setSortBy(sortBy === 'newest' ? 'oldest' : 'newest');
//   };

//   return (
//     <div className="container mx-auto p-4 pt-0">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-2xl font-bold">Project Management</h3>
//         <Button onClick={handleAddClick} className="flex items-center gap-2">
//           <Plus className="h-4 w-4" /> Create Project
//         </Button>
//       </div>
      
//       {/* Filter Controls */}
//       <ProjectFilterControls
//         sortBy={sortBy}
//         statusFilter={statusFilter}
//         searchTerm={searchTerm}
//         dateRange={dateRange}
//         onSortChange={setSortBy}
//         onStatusFilterChange={setStatusFilter}
//         onSearchChange={setSearchTerm}
//         onDateRangeChange={setDateRange}
//       />
      
//       {error && (
//         <Alert variant="destructive" className="mb-4">
//           <TriangleAlert className="h-4 w-4" />
//           <AlertTitle>Error</AlertTitle>
//           <AlertDescription>{error}</AlertDescription>
//         </Alert>
//       )}
      
//       <ProjectTable
//         projects={filteredAndSortedProjects}
//         onEdit={handleEditClick}
//         onDelete={handleDeleteClick}
//         onSortToggle={toggleSort}
//         sortBy={sortBy}
//         isLoading={isLoading}
//         hasProjects={hasProjects}
//         hasFilteredProjects={hasFilteredProjects}
//       />
      
//       {/* Form for Adding & Editing Projects */}
//       <ProjectForm
//         isOpen={showForm}
//         onClose={() => setShowForm(false)}
//         project={currentProject}
//         onSubmit={handleSubmit}
//       />
      
//       {/* Custom Confirmation Dialog for Deleting */}
//       <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This action cannot be undone. This will permanently delete the project.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={handleConfirmDelete}>Continue</AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// };

// export default ProjectManagement;









// "use client";
// import React, { useState, useMemo } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Calendar } from "@/components/ui/calendar";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { CalendarIcon, ArrowUpDown } from "lucide-react";
// import { format } from "date-fns";
// import { cn } from "@/lib/utils";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Loader } from "@/components/loader";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { TriangleAlert, Trash2, Pencil, Plus } from "lucide-react";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { useProjects } from "@/hooks/use-projects";
// import { projectSchema, type ProjectEntry } from "@/lib/schema";
// import { z } from "zod";

// const ProjectManagement = () => {
//   const { projects, isLoading, error, createProject, updateProject, deleteProject } = useProjects();
//   const [showModal, setShowModal] = useState(false);
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
//   const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
//   const [currentProject, setCurrentProject] = useState<ProjectEntry | null>(null);
//   const [date, setDate] = useState<Date>(new Date());
//   const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
//   const [statusFilter, setStatusFilter] = useState<string>('all');
  
//   const form = useForm<z.infer<typeof projectSchema>>({
//     resolver: zodResolver(projectSchema),
//     defaultValues: {
//       project_name: "",
//       description: "",
//       status: "Pending",
//       created_at: new Date().toISOString().split('T')[0],
//     },
//   });

//   const handleAddClick = () => {
//     setCurrentProject(null);
//     const today = new Date();
//     setDate(today);
//     form.reset({ 
//       project_name: "", 
//       description: "",
//       status: "Pending",
//       created_at: today.toISOString().split('T')[0],
//     });
//     setShowModal(true);
//   };

//   const handleEditClick = (project: ProjectEntry) => {
//     setCurrentProject(project);
//     const projectDate = new Date(project.created_at);
//     setDate(projectDate);
//     form.reset({ 
//       project_name: project.project_name, 
//       description: project.description,
//       status: project.status,
//       created_at: project.created_at,
//     });
//     setShowModal(true);
//   };

//   const handleDeleteClick = (_id: string) => {
//     setProjectToDelete(_id);
//     setShowDeleteDialog(true);
//   };

//   const handleConfirmDelete = async () => {
//     if (projectToDelete) {
//       await deleteProject(projectToDelete);
//     }
//     setShowDeleteDialog(false);
//     setProjectToDelete(null);
//   };

//   const handleSubmit = async (values: z.infer<typeof projectSchema>) => {
//     if (currentProject) {
//       await updateProject(currentProject._id, values);
//     } else {
//       await createProject(values);
//     }
//     setShowModal(false);
//   };

//   // Handle date selection from calendar
//   const handleDateSelect = (selectedDate: Date | undefined) => {
//     if (selectedDate) {
//       setDate(selectedDate);
//       // Format date as YYYY-MM-DD for form submission
//       const formattedDate = selectedDate.toISOString().split('T')[0];
//       form.setValue("created_at", formattedDate);
//     }
//   };

//   // Format date for display in the table
//   const formatDisplayDate = (dateString: string) => {
//     try {
//       return format(new Date(dateString), "MMM dd, yyyy");
//     } catch (error) {
//       return dateString;
//     }
//   };

//   // Handle sort toggle
//   const toggleSort = () => {
//     setSortBy(sortBy === 'newest' ? 'oldest' : 'newest');
//   };

//   // Filter and sort projects
//   const filteredAndSortedProjects = useMemo(() => {
//     let result = [...projects];
    
//     // Apply status filter
//     if (statusFilter !== 'all') {
//       result = result.filter(project => project.status === statusFilter);
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
//   }, [projects, statusFilter, sortBy]);

//   return (
//     <div className="container mx-auto p-4">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-2xl font-bold">Project Management</h3>
//         <Button onClick={handleAddClick} className="flex items-center gap-2">
//           <Plus className="h-4 w-4" /> Create Project
//         </Button>
//       </div>
      
//       {/* Filter Controls */}
//       <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
//         <div className="flex items-center gap-2">
//           <span className="text-sm font-medium text-gray-700">Sort:</span>
//           <Button 
//             variant="outline" 
//             size="sm"
//             onClick={toggleSort}
//             className="flex items-center gap-1"
//           >
//             {sortBy === 'newest' ? 'Newest' : 'Oldest'}
//             <ArrowUpDown className="h-3 w-3" />
//           </Button>
//         </div>
        
//         <div className="flex items-center gap-2">
//           <span className="text-sm font-medium text-gray-700">Status:</span>
//           <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
//             <SelectTrigger className="w-40">
//               <SelectValue placeholder="All statuses" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Statuses</SelectItem>
//               <SelectItem value="Pending">Pending</SelectItem>
//               <SelectItem value="Ongoing">Ongoing</SelectItem>
//               <SelectItem value="Completed">Completed</SelectItem>
//               <SelectItem value="Archived">Archived</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       </div>
      
//       {error && (
//         <Alert variant="destructive" className="mb-4">
//           <TriangleAlert className="h-4 w-4" />
//           <AlertTitle>Error</AlertTitle>
//           <AlertDescription>{error}</AlertDescription>
//         </Alert>
//       )}
//       {isLoading ? (
//         <Loader />
//       ) : (
//         <div className="rounded-md border">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="w-[50px]">#</TableHead>
//                 <TableHead className="w-[200px]">Project Name</TableHead>
//                 <TableHead className="w-[300px]">Description</TableHead>
//                 <TableHead className="w-[120px]">Status</TableHead>
//                 <TableHead className="w-[120px]">
//                   <Button 
//                     variant="ghost" 
//                     className="h-auto p-0 font-semibold flex items-center gap-1"
//                     onClick={toggleSort}
//                   >
//                     Created At
//                     <ArrowUpDown className="h-3 w-3" />
//                   </Button>
//                 </TableHead>
//                 <TableHead className="w-[100px] text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filteredAndSortedProjects.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={6} className="text-center">
//                     {projects.length === 0 ? "No projects found." : "No projects match the selected filters."}
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 filteredAndSortedProjects.map((project, index) => (
//                   <TableRow key={project._id}>
//                     <TableCell>{index + 1}</TableCell>
//                     <TableCell className="whitespace-normal break-words" title={project.project_name}>
//                       {project.project_name}
//                     </TableCell>
//                     <TableCell className="whitespace-normal break-words" title={project.description}>
//                       {project.description}
//                     </TableCell>
//                     <TableCell>
//                       <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                         project.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
//                         project.status === 'Ongoing' ? 'bg-blue-100 text-blue-800' :
//                         project.status === 'Completed' ? 'bg-green-100 text-green-800' :
//                         'bg-gray-100 text-gray-800'
//                       }`}>
//                         {project.status}
//                       </div>
//                     </TableCell>
//                     <TableCell>
//                       {formatDisplayDate(project.created_at)}
//                     </TableCell>
//                     <TableCell className="text-right">
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         className="text-yellow-500 hover:text-yellow-700"
//                         onClick={() => handleEditClick(project)}
//                       >
//                         <Pencil className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         className="text-red-500 hover:text-red-700 ml-2"
//                         onClick={() => handleDeleteClick(project._id)}
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       )}
//       {/* Modal for Adding & Editing Projects */}
//       <Dialog open={showModal} onOpenChange={setShowModal}>
//         <DialogContent className="sm:max-w-[425px]">
//           <DialogHeader>
//             <DialogTitle>
//               {currentProject ? "Edit Project" : "Create Project"}
//             </DialogTitle>
//           </DialogHeader>
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(handleSubmit)}>
//               <FormField
//                 control={form.control}
//                 name="project_name"
//                 render={({ field }) => (
//                   <FormItem className="mb-4">
//                     <FormLabel>Project Name</FormLabel>
//                     <FormControl>
//                       <Input placeholder="Enter Project Name" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="description"
//                 render={({ field }) => (
//                   <FormItem className="mb-4">
//                     <FormLabel>Description</FormLabel>
//                     <FormControl>
//                       <Textarea 
//                         placeholder="Enter Project Description" 
//                         className="min-h-[100px]"
//                         {...field} 
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="status"
//                 render={({ field }) => (
//                   <FormItem className="mb-4">
//                     <FormLabel>Status</FormLabel>
//                     <Select onValueChange={field.onChange} defaultValue={field.value}>
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select a status" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         <SelectItem value="Pending">Pending</SelectItem>
//                         <SelectItem value="Ongoing">Ongoing</SelectItem>
//                         <SelectItem value="Completed">Completed</SelectItem>
//                         <SelectItem value="Archived">Archived</SelectItem>
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="created_at"
//                 render={({ field }) => (
//                   <FormItem className="mb-4">
//                     <FormLabel>Created At</FormLabel>
//                     <Popover>
//                       <PopoverTrigger asChild>
//                         <FormControl>
//                           <Button
//                             variant={"outline"}
//                             className={cn(
//                               "w-full pl-3 text-left font-normal",
//                               !date && "text-muted-foreground"
//                             )}
//                           >
//                             {date ? (
//                               format(date, "PPP")
//                             ) : (
//                               <span>Pick a date</span>
//                             )}
//                             <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                           </Button>
//                         </FormControl>
//                       </PopoverTrigger>
//                       <PopoverContent className="w-auto p-0" align="start">
//                         <Calendar
//                           mode="single"
//                           selected={date}
//                           onSelect={handleDateSelect}
//                           disabled={(date) => date < new Date("1900-01-01")}
//                           initialFocus
//                         />
//                       </PopoverContent>
//                     </Popover>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <DialogFooter className="mt-4">
//                 <Button type="submit">
//                   {currentProject ? "Update Project" : "Create Project"}
//                 </Button>
//               </DialogFooter>
//             </form>
//           </Form>
//         </DialogContent>
//       </Dialog>
      
//       {/* Custom Confirmation Dialog for Deleting */}
//       <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This action cannot be undone. This will permanently delete the project.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={handleConfirmDelete}>Continue</AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// };

// export default ProjectManagement;


















// "use client";
// import React, { useState } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Calendar } from "@/components/ui/calendar";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { CalendarIcon } from "lucide-react";
// import { format } from "date-fns";
// import { cn } from "@/lib/utils";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Loader } from "@/components/loader";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { TriangleAlert, Trash2, Pencil, Plus } from "lucide-react";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { useProjects } from "@/hooks/use-projects";
// import { projectSchema, type ProjectEntry } from "@/lib/schema";
// import { z } from "zod";

// const ProjectManagement = () => {
//   const { projects, isLoading, error, createProject, updateProject, deleteProject } = useProjects();
//   const [showModal, setShowModal] = useState(false);
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
//   const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
//   const [currentProject, setCurrentProject] = useState<ProjectEntry | null>(null);
//   const [date, setDate] = useState<Date>(new Date());

//   const form = useForm<z.infer<typeof projectSchema>>({
//     resolver: zodResolver(projectSchema),
//     defaultValues: {
//       project_name: "",
//       description: "",
//       status: "Pending",
//       created_at: new Date().toISOString().split('T')[0],
//     },
//   });

//   const handleAddClick = () => {
//     setCurrentProject(null);
//     const today = new Date();
//     setDate(today);
//     form.reset({ 
//       project_name: "", 
//       description: "",
//       status: "Pending",
//       created_at: today.toISOString().split('T')[0],
//     });
//     setShowModal(true);
//   };

//   const handleEditClick = (project: ProjectEntry) => {
//     setCurrentProject(project);
//     const projectDate = new Date(project.created_at);
//     setDate(projectDate);
//     form.reset({ 
//       project_name: project.project_name, 
//       description: project.description,
//       status: project.status,
//       created_at: project.created_at,
//     });
//     setShowModal(true);
//   };

//   const handleDeleteClick = (_id: string) => {
//     setProjectToDelete(_id);
//     setShowDeleteDialog(true);
//   };

//   const handleConfirmDelete = async () => {
//     if (projectToDelete) {
//       await deleteProject(projectToDelete);
//     }
//     setShowDeleteDialog(false);
//     setProjectToDelete(null);
//   };

//   const handleSubmit = async (values: z.infer<typeof projectSchema>) => {
//     if (currentProject) {
//       await updateProject(currentProject._id, values);
//     } else {
//       await createProject(values);
//     }
//     setShowModal(false);
//   };

//   // Handle date selection from calendar
//   const handleDateSelect = (selectedDate: Date | undefined) => {
//     if (selectedDate) {
//       setDate(selectedDate);
//       // Format date as YYYY-MM-DD for form submission
//       const formattedDate = selectedDate.toISOString().split('T')[0];
//       form.setValue("created_at", formattedDate);
//     }
//   };

//   // Format date for display in the table
//   const formatDisplayDate = (dateString: string) => {
//     try {
//       return format(new Date(dateString), "MMM dd, yyyy");
//     } catch (error) {
//       return dateString;
//     }
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-2xl font-bold">Project Management</h3>
//         <Button onClick={handleAddClick} className="flex items-center gap-2">
//           <Plus className="h-4 w-4" /> Create Project
//         </Button>
//       </div>
//       {error && (
//         <Alert variant="destructive" className="mb-4">
//           <TriangleAlert className="h-4 w-4" />
//           <AlertTitle>Error</AlertTitle>
//           <AlertDescription>{error}</AlertDescription>
//         </Alert>
//       )}
//       {isLoading ? (
//         <Loader />
//       ) : (
//         <div className="rounded-md border">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="w-[50px]">#</TableHead>
//                 <TableHead className="w-[200px]">Project Name</TableHead>
//                 <TableHead className="w-[300px]">Description</TableHead>
//                 <TableHead className="w-[120px]">Status</TableHead>
//                 <TableHead className="w-[120px]">Created At</TableHead>
//                 <TableHead className="w-[100px] text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {projects.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={6} className="text-center">
//                     No projects found.
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 projects.map((project, index) => (
//                   <TableRow key={project._id}>
//                     <TableCell>{index + 1}</TableCell>
//                     <TableCell className="whitespace-normal break-words" title={project.project_name}>
//                       {project.project_name}
//                     </TableCell>
//                     <TableCell className="whitespace-normal break-words" title={project.description}>
//                       {project.description}
//                     </TableCell>
//                     <TableCell>
//                       <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                         {project.status}
//                       </div>
//                     </TableCell>
//                     <TableCell>
//                       {formatDisplayDate(project.created_at)}
//                     </TableCell>
//                     <TableCell className="text-right">
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         className="text-yellow-500 hover:text-yellow-700"
//                         onClick={() => handleEditClick(project)}
//                       >
//                         <Pencil className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         className="text-red-500 hover:text-red-700 ml-2"
//                         onClick={() => handleDeleteClick(project._id)}
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       )}
//       {/* Modal for Adding & Editing Projects */}
//       <Dialog open={showModal} onOpenChange={setShowModal}>
//         <DialogContent className="sm:max-w-[425px]">
//           <DialogHeader>
//             <DialogTitle>
//               {currentProject ? "Edit Project" : "Create Project"}
//             </DialogTitle>
//           </DialogHeader>
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(handleSubmit)}>
//               <FormField
//                 control={form.control}
//                 name="project_name"
//                 render={({ field }) => (
//                   <FormItem className="mb-4">
//                     <FormLabel>Project Name</FormLabel>
//                     <FormControl>
//                       <Input placeholder="Enter Project Name" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="description"
//                 render={({ field }) => (
//                   <FormItem className="mb-4">
//                     <FormLabel>Description</FormLabel>
//                     <FormControl>
//                       <Textarea 
//                         placeholder="Enter Project Description" 
//                         className="min-h-[100px]"
//                         {...field} 
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="status"
//                 render={({ field }) => (
//                   <FormItem className="mb-4">
//                     <FormLabel>Status</FormLabel>
//                     <Select onValueChange={field.onChange} defaultValue={field.value}>
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select a status" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         <SelectItem value="Pending">Pending</SelectItem>
//                         <SelectItem value="Ongoing">Ongoing</SelectItem>
//                         <SelectItem value="Completed">Completed</SelectItem>
//                         <SelectItem value="Archived">Archived</SelectItem>
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="created_at"
//                 render={({ field }) => (
//                   <FormItem className="mb-4">
//                     <FormLabel>Created At</FormLabel>
//                     <Popover>
//                       <PopoverTrigger asChild>
//                         <FormControl>
//                           <Button
//                             variant={"outline"}
//                             className={cn(
//                               "w-full pl-3 text-left font-normal",
//                               !date && "text-muted-foreground"
//                             )}
//                           >
//                             {date ? (
//                               format(date, "PPP")
//                             ) : (
//                               <span>Pick a date</span>
//                             )}
//                             <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                           </Button>
//                         </FormControl>
//                       </PopoverTrigger>
//                       <PopoverContent className="w-auto p-0" align="start">
//                         <Calendar
//                           mode="single"
//                           selected={date}
//                           onSelect={handleDateSelect}
//                           disabled={(date) => date < new Date("1900-01-01")}
//                           initialFocus
//                         />
//                       </PopoverContent>
//                     </Popover>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <DialogFooter className="mt-4">
//                 <Button type="submit">
//                   {currentProject ? "Update Project" : "Create Project"}
//                 </Button>
//               </DialogFooter>
//             </form>
//           </Form>
//         </DialogContent>
//       </Dialog>
      
//       {/* Custom Confirmation Dialog for Deleting */}
//       <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This action cannot be undone. This will permanently delete the project.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={handleConfirmDelete}>Continue</AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// };

// export default ProjectManagement;




// "use client";
// import React, { useState } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { CalendarIcon } from "lucide-react";
// import { format } from "date-fns";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Loader } from "@/components/loader";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { TriangleAlert, Trash2, Pencil, Plus } from "lucide-react";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { useProjects } from "@/hooks/use-projects";
// import { projectSchema, type ProjectEntry } from "@/lib/schema";
// import { z } from "zod";
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import dayjs from 'dayjs';

// const ProjectManagement = () => {
//   const { projects, isLoading, error, createProject, updateProject, deleteProject } = useProjects();
//   const [showModal, setShowModal] = useState(false);
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
//   const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
//   const [currentProject, setCurrentProject] = useState<ProjectEntry | null>(null);
//   const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(dayjs());

//   const form = useForm<z.infer<typeof projectSchema>>({
//     resolver: zodResolver(projectSchema),
//     defaultValues: {
//       project_name: "",
//       description: "",
//       status: "Pending",
//       created_at: new Date().toISOString().split('T')[0],
//     },
//   });

//   const handleAddClick = () => {
//     setCurrentProject(null);
//     const today = dayjs();
//     setSelectedDate(today);
//     form.reset({ 
//       project_name: "", 
//       description: "",
//       status: "Pending",
//       created_at: today.toISOString().split('T')[0],
//     });
//     setShowModal(true);
//   };

//   const handleEditClick = (project: ProjectEntry) => {
//     setCurrentProject(project);
//     const projectDate = dayjs(project.created_at);
//     setSelectedDate(projectDate);
//     form.reset({ 
//       project_name: project.project_name, 
//       description: project.description,
//       status: project.status,
//       created_at: project.created_at,
//     });
//     setShowModal(true);
//   };

//   const handleDeleteClick = (_id: string) => {
//     setProjectToDelete(_id);
//     setShowDeleteDialog(true);
//   };

//   const handleConfirmDelete = async () => {
//     if (projectToDelete) {
//       await deleteProject(projectToDelete);
//     }
//     setShowDeleteDialog(false);
//     setProjectToDelete(null);
//   };

//   const handleSubmit = async (values: z.infer<typeof projectSchema>) => {
//     if (currentProject) {
//       await updateProject(currentProject._id, values);
//     } else {
//       await createProject(values);
//     }
//     setShowModal(false);
//   };

//   // Handle date selection from MUI DatePicker
//   const handleDateChange = (date: dayjs.Dayjs | null) => {
//     setSelectedDate(date);
//     if (date) {
//       // Format date as YYYY-MM-DD for form submission
//       const formattedDate = date.toISOString().split('T')[0];
//       form.setValue("created_at", formattedDate);
//     }
//   };

//   // Format date for display in the table
//   const formatDisplayDate = (dateString: string) => {
//     try {
//       return format(new Date(dateString), "MMM dd, yyyy");
//     } catch (error) {
//       return dateString;
//     }
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-2xl font-bold">Project Management</h3>
//         <Button onClick={handleAddClick} className="flex items-center gap-2">
//           <Plus className="h-4 w-4" /> Create Project
//         </Button>
//       </div>
//       {error && (
//         <Alert variant="destructive" className="mb-4">
//           <TriangleAlert className="h-4 w-4" />
//           <AlertTitle>Error</AlertTitle>
//           <AlertDescription>{error}</AlertDescription>
//         </Alert>
//       )}
//       {isLoading ? (
//         <Loader />
//       ) : (
//         <div className="rounded-md border">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="w-[50px]">#</TableHead>
//                 <TableHead className="min-w-[200px]">Project Name</TableHead>
//                 <TableHead className="min-w-[300px]">Description</TableHead>
//                 <TableHead className="w-[120px]">Status</TableHead>
//                 <TableHead className="w-[120px]">Created At</TableHead>
//                 <TableHead className="w-[100px] text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {projects.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={6} className="text-center">
//                     No projects found.
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 projects.map((project, index) => (
//                   <TableRow key={project._id} className="h-auto">
//                     <TableCell className="align-top">{index + 1}</TableCell>
//                     <TableCell className="align-top whitespace-normal break-words min-w-[200px]" title={project.project_name}>
//                       {project.project_name}
//                     </TableCell>
//                     <TableCell className="align-top whitespace-normal break-words min-w-[300px]" title={project.description}>
//                       {project.description}
//                     </TableCell>
//                     <TableCell className="align-top">
//                       <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                         {project.status}
//                       </div>
//                     </TableCell>
//                     <TableCell className="align-top">
//                       {formatDisplayDate(project.created_at)}
//                     </TableCell>
//                     <TableCell className="align-top text-right">
//                       <div className="flex flex-col space-y-1">
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           className="text-yellow-500 hover:text-yellow-700 justify-end"
//                           onClick={() => handleEditClick(project)}
//                         >
//                           <Pencil className="h-4 w-4" />
//                         </Button>
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           className="text-red-500 hover:text-red-700 justify-end"
//                           onClick={() => handleDeleteClick(project._id)}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       )}
//       {/* Modal for Adding & Editing Projects */}
//       <Dialog open={showModal} onOpenChange={setShowModal}>
//         <DialogContent className="sm:max-w-[425px]">
//           <DialogHeader>
//             <DialogTitle>
//               {currentProject ? "Edit Project" : "Create Project"}
//             </DialogTitle>
//           </DialogHeader>
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(handleSubmit)}>
//               <FormField
//                 control={form.control}
//                 name="project_name"
//                 render={({ field }) => (
//                   <FormItem className="mb-4">
//                     <FormLabel>Project Name</FormLabel>
//                     <FormControl>
//                       <Input placeholder="Enter Project Name" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="description"
//                 render={({ field }) => (
//                   <FormItem className="mb-4">
//                     <FormLabel>Description</FormLabel>
//                     <FormControl>
//                       <Textarea 
//                         placeholder="Enter Project Description" 
//                         className="min-h-[100px]"
//                         {...field} 
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="status"
//                 render={({ field }) => (
//                   <FormItem className="mb-4">
//                     <FormLabel>Status</FormLabel>
//                     <Select onValueChange={field.onChange} defaultValue={field.value}>
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select a status" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         <SelectItem value="Pending">Pending</SelectItem>
//                         <SelectItem value="Ongoing">Ongoing</SelectItem>
//                         <SelectItem value="Completed">Completed</SelectItem>
//                         <SelectItem value="Archived">Archived</SelectItem>
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="created_at"
//                 render={({ field }) => (
//                   <FormItem className="mb-4">
//                     <FormLabel>Created At</FormLabel>
//                     <FormControl>
//                       <LocalizationProvider dateAdapter={AdapterDayjs}>
//                         <DatePicker 
//                           value={selectedDate}
//                           onChange={handleDateChange}
//                           slotProps={{
//                             textField: {
//                               fullWidth: true,
//                               variant: "outlined",
//                               size: "small"
//                             }
//                           }}
//                         />
//                       </LocalizationProvider>
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <DialogFooter className="mt-4">
//                 <Button type="submit">
//                   {currentProject ? "Update Project" : "Create Project"}
//                 </Button>
//               </DialogFooter>
//             </form>
//           </Form>
//         </DialogContent>
//       </Dialog>
      
//       {/* Custom Confirmation Dialog for Deleting */}
//       <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This action cannot be undone. This will permanently delete the project.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={handleConfirmDelete}>Continue</AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// };

// export default ProjectManagement;