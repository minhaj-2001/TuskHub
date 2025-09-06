import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Pencil, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { type ProjectEntry } from "@/lib/schema";

interface ProjectTableProps {
  projects: ProjectEntry[];
  onEdit: (project: ProjectEntry) => void;
  onDelete: (id: string) => void;
  onProjectClick: (id: string) => void;
  onSortToggle: () => void;
  sortBy: 'newest' | 'oldest';
  isLoading: boolean;
  hasProjects: boolean;
  hasFilteredProjects: boolean;
  canEdit: boolean;
}

export const ProjectTable: React.FC<ProjectTableProps> = ({ 
  projects, 
  onEdit, 
  onDelete,
  onProjectClick,
  onSortToggle, 
  sortBy, 
  isLoading, 
  hasProjects, 
  hasFilteredProjects,
  canEdit
}) => {
  // Format date for display in the table
  const formatDisplayDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };
  
  // Get status badge color based on status value
  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Ongoing': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800'; // Default for undefined or other values
    }
  };
  
  if (isLoading) {
    return <div>Loading projects...</div>;
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead className="w-[200px]">Project Name</TableHead>
            <TableHead className="w-[300px]">Description</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[120px]">
              <Button variant="ghost" className="h-auto p-0 font-semibold flex items-center gap-1" onClick={onSortToggle}>
                Created At <ArrowUpDown className="h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-32">
                {hasProjects ? "No projects match the selected filters." : "No projects found."}
              </TableCell>
            </TableRow>
          ) : (
            projects.map((project, index) => (
              <TableRow 
                key={project._id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onProjectClick(project._id)}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell className="whitespace-normal break-words" title={project.project_name}>
                  {project.project_name}
                </TableCell>
                <TableCell className="whitespace-normal break-words" title={project.description}>
                  {project.description}
                </TableCell>
                <TableCell>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(project.status)}`}>
                    {project.status || 'Unknown'}
                  </div>
                </TableCell>
                <TableCell>
                  {formatDisplayDate(project.created_at)}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-500 hover:text-blue-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      onProjectClick(project._id);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {canEdit && (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-yellow-500 hover:text-yellow-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(project);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700 ml-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(project._id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};