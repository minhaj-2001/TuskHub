import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Calendar, Eye } from "lucide-react";
import { format } from "date-fns";
import { type ProjectEntry } from "@/lib/schema";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProjectCardProps {
  project: ProjectEntry;
  onEdit: (project: ProjectEntry) => void;
  onDelete: (id: string) => void;
  onProjectClick: (id: string) => void;
  canEdit: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  onEdit, 
  onDelete,
  onProjectClick,
  canEdit
}) => {
  // Get status badge color based on status value
  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Ongoing': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Format date for display
  const formatDisplayDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };
  
  return (
    <Card 
      className="h-full flex flex-col cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onProjectClick(project._id)}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <Tooltip>
            <TooltipTrigger asChild>
              <CardTitle className="text-lg font-semibold line-clamp-2">
                {project.project_name}
              </CardTitle>
            </TooltipTrigger>
            <TooltipContent>
              <p>{project.project_name}</p>
            </TooltipContent>
          </Tooltip>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-500 hover:text-blue-700 h-8 w-8 p-0"
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
                  className="text-yellow-500 hover:text-yellow-700 h-8 w-8 p-0"
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
                  className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(project._id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary" className={getStatusBadgeClass(project.status)}>
            {project.status || 'Unknown'}
          </Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-1 h-3 w-3" />
            {formatDisplayDate(project.created_at)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="line-clamp-3 text-sm">
          {project.description || "No description provided."}
        </CardDescription>
      </CardContent>
    </Card>
  );
};


// import React from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Pencil, Trash2, Calendar } from "lucide-react";
// import { format } from "date-fns";
// import { type ProjectEntry } from "@/lib/schema";

// interface ProjectCardProps {
//   project: ProjectEntry;
//   onEdit: (project: ProjectEntry) => void;
//   onDelete: (id: string) => void;
// }

// export const ProjectCard: React.FC<ProjectCardProps> = ({
//   project,
//   onEdit,
//   onDelete
// }) => {
//   // Get status badge color based on status value
//   const getStatusBadgeClass = (status?: string) => {
//     switch (status) {
//       case 'Pending':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'Ongoing':
//         return 'bg-blue-100 text-blue-800';
//       case 'Completed':
//         return 'bg-green-100 text-green-800';
//       case 'Archived':
//         return 'bg-gray-100 text-gray-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   // Format date for display
//   const formatDisplayDate = (dateString: string) => {
//     try {
//       return format(new Date(dateString), "MMM dd, yyyy");
//     } catch (error) {
//       return dateString;
//     }
//   };

//   return (
//     <Card className="h-full flex flex-col">
//       <CardHeader className="pb-3">
//         <div className="flex justify-between items-start">
//           <CardTitle className="text-lg font-semibold line-clamp-2">
//             {project.project_name}
//           </CardTitle>
//           <div className="flex gap-1">
//             <Button
//               variant="ghost"
//               size="sm"
//               className="text-yellow-500 hover:text-yellow-700 h-8 w-8 p-0"
//               onClick={() => onEdit(project)}
//             >
//               <Pencil className="h-4 w-4" />
//             </Button>
//             <Button
//               variant="ghost"
//               size="sm"
//               className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
//               onClick={() => onDelete(project._id)}
//             >
//               <Trash2 className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>
//         <div className="flex items-center gap-2 mt-2">
//           <Badge 
//             variant="secondary" 
//             className={getStatusBadgeClass(project.status)}
//           >
//             {project.status || 'Unknown'}
//           </Badge>
//           <div className="flex items-center text-sm text-muted-foreground">
//             <Calendar className="mr-1 h-3 w-3" />
//             {formatDisplayDate(project.created_at)}
//           </div>
//         </div>
//       </CardHeader>
//       <CardContent className="flex-grow">
//         <CardDescription className="line-clamp-3 text-sm">
//           {project.description || "No description provided."}
//         </CardDescription>
//       </CardContent>
//     </Card>
//   );
// };



// // frontend/app/components/projects/project-card.tsx
// import React from 'react';
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Pencil, Trash2, Calendar } from "lucide-react";
// import { format } from "date-fns";
// import { type ProjectEntry } from "@/lib/schema";

// interface ProjectCardProps {
//   project: ProjectEntry;
//   onEdit: (project: ProjectEntry) => void;
//   onDelete: (id: string) => void;
// }

// export const ProjectCard: React.FC<ProjectCardProps> = ({
//   project,
//   onEdit,
//   onDelete
// }) => {
//   // Get status badge color based on status value
//   const getStatusBadgeClass = (status?: string) => {
//     switch (status) {
//       case 'Pending':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'Ongoing':
//         return 'bg-blue-100 text-blue-800';
//       case 'Completed':
//         return 'bg-green-100 text-green-800';
//       case 'Archived':
//         return 'bg-gray-100 text-gray-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   // Format date for display
//   const formatDisplayDate = (dateString: string) => {
//     try {
//       return format(new Date(dateString), "MMM dd, yyyy");
//     } catch (error) {
//       return dateString;
//     }
//   };

//   return (
//     <Card className="h-full flex flex-col">
//       <CardHeader className="pb-3">
//         <div className="flex justify-between items-start">
//           <CardTitle className="text-lg font-semibold line-clamp-2">
//             {project.project_name}
//           </CardTitle>
//           <div className="flex gap-1">
//             <Button
//               variant="ghost"
//               size="sm"
//               className="text-yellow-500 hover:text-yellow-700 h-8 w-8 p-0"
//               onClick={() => onEdit(project)}
//             >
//               <Pencil className="h-4 w-4" />
//             </Button>
//             <Button
//               variant="ghost"
//               size="sm"
//               className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
//               onClick={() => onDelete(project._id)}
//             >
//               <Trash2 className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>
//         <div className="flex items-center gap-2 mt-2">
//           <Badge 
//             variant="secondary" 
//             className={getStatusBadgeClass(project.status)}
//           >
//             {project.status || 'Unknown'}
//           </Badge>
//           <div className="flex items-center text-sm text-muted-foreground">
//             <Calendar className="mr-1 h-3 w-3" />
//             {formatDisplayDate(project.created_at)}
//           </div>
//         </div>
//       </CardHeader>
//       <CardContent className="flex-grow">
//         <CardDescription className="line-clamp-3 text-sm">
//           {project.description || "No description provided."}
//         </CardDescription>
//       </CardContent>
//       <CardFooter className="pt-1">
//         {/* <div className="flex justify-between items-center">
//           <span className="text-xs text-muted-foreground">
//             ID: {project._id}
//           </span>
//           <div className="flex gap-2">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => onEdit(project)}
//             >
//               Edit
//             </Button>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => onDelete(project._id)}
//               className="text-red-500 hover:text-red-700"
//             >
//               Delete
//             </Button>
//           </div>
//         </div> */}
//       </CardFooter>
//     </Card>
//   );
// };