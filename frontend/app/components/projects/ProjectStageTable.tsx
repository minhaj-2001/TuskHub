import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, CheckCircle, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { type ProjectStageEntry } from "@/lib/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectStageTableProps {
  stages: ProjectStageEntry[];
  onEdit: (stageId: string) => void;
  onDelete: (stageId: string) => void;
  onMarkComplete: (stageId: string) => void;
  canEdit: boolean;
  projectStatus?: string; // Add this prop
}

export const ProjectStageTable: React.FC<ProjectStageTableProps> = ({
  stages,
  onEdit,
  onDelete,
  onMarkComplete,
  canEdit,
  projectStatus = 'Ongoing' // Default value
}) => {
  const formatDisplayDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ongoing': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Sort stages by date (oldest first)
  const sortedStages = [...stages].sort((a, b) => {
    const dateA = a.start_date ? new Date(a.start_date).getTime() : Infinity;
    const dateB = b.start_date ? new Date(b.start_date).getTime() : Infinity;
    return dateA - dateB;
  });
  
  const canEditStage = canEdit && projectStatus !== 'Completed';
  
  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px] min-w-[40px]">#</TableHead>
              <TableHead className="w-[200px] min-w-[150px] max-w-[250px]">Stage Name</TableHead>
              <TableHead className="w-[250px] min-w-[200px] max-w-[300px]">Description</TableHead>
              <TableHead className="w-[100px] min-w-[80px]">Status</TableHead>
              <TableHead className="w-[120px] min-w-[100px]">Start Date</TableHead>
              <TableHead className="w-[140px] min-w-[120px]">Completion Date</TableHead>
              {canEditStage && <TableHead className="w-[80px] min-w-[80px] text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStages.map((stage, index) => (
              <TableRow key={stage._id}>
                <TableCell className="w-[40px] min-w-[40px]">{index + 1}</TableCell>
                <TableCell className="w-[200px] min-w-[150px] max-w-[250px] whitespace-normal break-words">
                  <div className="flex items-center gap-2">
                    {stage.stage.stage_name}
                    {stage.stage.isCustom && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        Custom
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="w-[250px] min-w-[200px] max-w-[300px] whitespace-normal break-words">
                  {stage.stage.description || "No description"}
                </TableCell>
                <TableCell className="w-[100px] min-w-[80px]">
                  <Badge className={getStatusColor(stage.status)}>
                    {stage.status}
                  </Badge>
                </TableCell>
                <TableCell className="w-[120px] min-w-[100px]">
                  {formatDisplayDate(stage.start_date)}
                </TableCell>
                <TableCell className="w-[140px] min-w-[120px]">
                  {formatDisplayDate(stage.completion_date)}
                </TableCell>
                {canEditStage && (
                  <TableCell className="w-[80px] min-w-[80px] text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
  <DropdownMenuItem onClick={() => onEdit(stage._id)}>
    <Edit className="mr-2 h-4 w-4" />
    Edit
  </DropdownMenuItem>
  <DropdownMenuItem onClick={() => onDelete(stage._id)} className="text-red-500">
    <Trash2 className="mr-2 h-4 w-4" />
    {stage.stage.isCustom ? "Delete Permanently" : "Remove from Project"}
  </DropdownMenuItem>
  {stage.status === 'Ongoing' && (
    <DropdownMenuItem onClick={() => onMarkComplete(stage._id)}>
      <CheckCircle className="mr-2 h-4 w-4" />
      Mark Stage Complete
    </DropdownMenuItem>
  )}
</DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
















// import React from "react";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Trash2, Edit, CheckCircle, MoreHorizontal } from "lucide-react";
// import { format } from "date-fns";
// import { type ProjectStageEntry } from "@/lib/schema";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// interface ProjectStageTableProps {
//   stages: ProjectStageEntry[];
//   onEdit: (stageId: string) => void;
//   onDelete: (stageId: string) => void;
//   onMarkComplete: (stageId: string) => void;
//   canEdit: boolean;
// }

// export const ProjectStageTable: React.FC<ProjectStageTableProps> = ({
//   stages,
//   onEdit,
//   onDelete,
//   onMarkComplete,
//   canEdit
// }) => {
//   const formatDisplayDate = (dateString?: string) => {
//     if (!dateString) return "Not set";
//     try {
//       return format(new Date(dateString), "MMM dd, yyyy");
//     } catch (error) {
//       return dateString;
//     }
//   };
  
//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'Ongoing': return 'bg-blue-100 text-blue-800';
//       case 'Completed': return 'bg-green-100 text-green-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };
  
//   // Sort stages by date (oldest first)
//   const sortedStages = [...stages].sort((a, b) => {
//     const dateA = a.start_date ? new Date(a.start_date).getTime() : Infinity;
//     const dateB = b.start_date ? new Date(b.start_date).getTime() : Infinity;
//     return dateA - dateB;
//   });
  
//   return (
//     <div className="rounded-md border overflow-hidden">
//       <div className="overflow-x-auto">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead className="w-[40px] min-w-[40px]">#</TableHead>
//               <TableHead className="w-[200px] min-w-[150px] max-w-[250px]">Stage Name</TableHead>
//               <TableHead className="w-[250px] min-w-[200px] max-w-[300px]">Description</TableHead>
//               <TableHead className="w-[100px] min-w-[80px]">Status</TableHead>
//               <TableHead className="w-[120px] min-w-[100px]">Start Date</TableHead>
//               <TableHead className="w-[140px] min-w-[120px]">Completion Date</TableHead>
//               {canEdit && <TableHead className="w-[80px] min-w-[80px] text-right">Actions</TableHead>}
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {sortedStages.map((stage, index) => (
//               <TableRow key={stage._id}>
//                 <TableCell className="w-[40px] min-w-[40px]">{index + 1}</TableCell>
//                 <TableCell className="w-[200px] min-w-[150px] max-w-[250px] whitespace-normal break-words">
//                   {stage.stage.stage_name}
//                 </TableCell>
//                 <TableCell className="w-[250px] min-w-[200px] max-w-[300px] whitespace-normal break-words">
//                   {stage.stage.description || "No description"}
//                 </TableCell>
//                 <TableCell className="w-[100px] min-w-[80px]">
//                   <Badge className={getStatusColor(stage.status)}>
//                     {stage.status}
//                   </Badge>
//                 </TableCell>
//                 <TableCell className="w-[120px] min-w-[100px]">
//                   {formatDisplayDate(stage.start_date)}
//                 </TableCell>
//                 <TableCell className="w-[140px] min-w-[120px]">
//                   {formatDisplayDate(stage.completion_date)}
//                 </TableCell>
//                 {canEdit && (
//                   <TableCell className="w-[80px] min-w-[80px] text-right">
//                     <DropdownMenu>
//                       <DropdownMenuTrigger asChild>
//                         <Button variant="ghost" size="sm">
//                           <MoreHorizontal className="h-4 w-4" />
//                         </Button>
//                       </DropdownMenuTrigger>
//                       <DropdownMenuContent align="end">
//                         <DropdownMenuItem onClick={() => onEdit(stage._id)}>
//                           <Edit className="mr-2 h-4 w-4" />
//                           Edit
//                         </DropdownMenuItem>
//                         <DropdownMenuItem onClick={() => onDelete(stage._id)} className="text-red-500">
//                           <Trash2 className="mr-2 h-4 w-4" />
//                           Delete
//                         </DropdownMenuItem>
//                         {stage.status === 'Ongoing' && (
//                           <DropdownMenuItem onClick={() => onMarkComplete(stage._id)}>
//                             <CheckCircle className="mr-2 h-4 w-4" />
//                             Mark Complete
//                           </DropdownMenuItem>
//                         )}
//                       </DropdownMenuContent>
//                     </DropdownMenu>
//                   </TableCell>
//                 )}
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   );
// };








// // frontend/app/components/projects/ProjectStageTable.tsx
// import React from "react";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Trash2, Edit, CheckCircle, MoreHorizontal } from "lucide-react";
// import { format } from "date-fns";
// import { type ProjectStageEntry } from "@/lib/schema";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// interface ProjectStageTableProps {
//   stages: ProjectStageEntry[];
//   onEdit: (stageId: string) => void;
//   onDelete: (stageId: string) => void;
//   onMarkComplete: (stageId: string) => void;
// }

// export const ProjectStageTable: React.FC<ProjectStageTableProps> = ({
//   stages,
//   onEdit,
//   onDelete,
//   onMarkComplete
// }) => {
//   const formatDisplayDate = (dateString?: string) => {
//     if (!dateString) return "Not set";
//     try {
//       return format(new Date(dateString), "MMM dd, yyyy");
//     } catch (error) {
//       return dateString;
//     }
//   };
  
//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'Ongoing': return 'bg-blue-100 text-blue-800';
//       case 'Completed': return 'bg-green-100 text-green-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };
  
//   // Sort stages by date (oldest first)
// const sortedStages = [...stages].sort((a, b) => {
//   const dateA = a.start_date ? new Date(a.start_date).getTime() : Infinity;
//   const dateB = b.start_date ? new Date(b.start_date).getTime() : Infinity;
//   return dateA - dateB;
// });

  
//   return (
//     <div className="rounded-md border">
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead className="w-[40px]">#</TableHead>
//             <TableHead className="w-[200px]">Stage Name</TableHead>
//             <TableHead className="w-[250px]">Description</TableHead>
//             <TableHead>Status</TableHead>
//             <TableHead>Start Date</TableHead>
//             <TableHead>Completion Date</TableHead>
//             <TableHead className="text-right">Actions</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {sortedStages.map((stage, index) => (
//             <TableRow key={stage._id}>
//               <TableCell>{index + 1}</TableCell>
//               <TableCell className="whitespace-normal break-words">
//                 {stage.stage.stage_name}
//               </TableCell>
//               <TableCell className="whitespace-normal break-words">
//                 {stage.stage.description || "No description"}
//               </TableCell>
//               <TableCell>
//                 <Badge className={getStatusColor(stage.status)}>
//                   {stage.status}
//                 </Badge>
//               </TableCell>
//               <TableCell>{formatDisplayDate(stage.start_date)}</TableCell>
//               <TableCell>{formatDisplayDate(stage.completion_date)}</TableCell>
//               <TableCell className="text-right">
//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <Button variant="ghost" size="sm">
//                       <MoreHorizontal className="h-4 w-4" />
//                     </Button>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent align="end">
//                     <DropdownMenuItem onClick={() => onEdit(stage._id)}>
//                       <Edit className="mr-2 h-4 w-4" />
//                       Edit
//                     </DropdownMenuItem>
//                     <DropdownMenuItem onClick={() => onDelete(stage._id)} className="text-red-500">
//                       <Trash2 className="mr-2 h-4 w-4" />
//                       Delete
//                     </DropdownMenuItem>
//                     {stage.status === 'Ongoing' && (
//                       <DropdownMenuItem onClick={() => onMarkComplete(stage._id)}>
//                         <CheckCircle className="mr-2 h-4 w-4" />
//                         Mark Complete
//                       </DropdownMenuItem>
//                     )}
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </div>
//   );
// };








// // frontend/app/components/projects/ProjectStageTable.tsx
// import React from "react";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Trash2, Edit, CheckCircle, MoreHorizontal, X } from "lucide-react";
// import { format } from "date-fns";
// import { type ProjectStageEntry, type StageConnectionEntry } from "@/lib/schema";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";

// interface ProjectStageTableProps {
//   stages: ProjectStageEntry[];
//   connections: StageConnectionEntry[];
//   onEdit: (stageId: string) => void;
//   onDelete: (stageId: string) => void;
//   onMarkComplete: (stageId: string) => void;
//   onDeleteConnection: (connectionId: string) => void; // Add this prop
// }

// export const ProjectStageTable: React.FC<ProjectStageTableProps> = ({
//   stages,
//   connections,
//   onEdit,
//   onDelete,
//   onMarkComplete,
//   onDeleteConnection
// }) => {
//   const formatDisplayDate = (dateString?: string) => {
//     if (!dateString) return "Not set";
//     try {
//       return format(new Date(dateString), "MMM dd, yyyy");
//     } catch (error) {
//       return dateString;
//     }
//   };
  
//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'Ongoing': return 'bg-blue-100 text-blue-800';
//       case 'Completed': return 'bg-green-100 text-green-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };
  
//    // Sort stages by date (oldest first)
// const sortedStages = [...stages].sort((a, b) => {
//   const dateA = a.start_date ? new Date(a.start_date).getTime() : Infinity;
//   const dateB = b.start_date ? new Date(b.start_date).getTime() : Infinity;
//   return dateA - dateB;
// });
  
//   // Get connections for a stage
//   const getStageConnections = (stageId: string) => {
//     return connections.filter(conn => 
//       conn.from_stage._id === stageId || conn.to_stage._id === stageId
//     );
//   };
  
//   return (
//     <TooltipProvider>
//       <div className="rounded-md border">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead className="w-[50px]">#</TableHead>
//               <TableHead className="w-[200px]">Stage Name</TableHead>
//               <TableHead className="w-[300px]">Description</TableHead>
//               <TableHead>Status</TableHead>
//               <TableHead>Start Date</TableHead>
//               <TableHead>Completion Date</TableHead>
//               <TableHead>Connections</TableHead>
//               <TableHead className="text-right">Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {sortedStages.map((stage, index) => (
//               <TableRow key={stage._id}>
//                 <TableCell>{index + 1}</TableCell>
//                 <TableCell className="whitespace-normal break-words line-clamp-2">
//                   {stage.stage.stage_name}
//                 </TableCell>
//                 <TableCell className="whitespace-normal break-words line-clamp-2">
//                   {stage.stage.description || "No description"}
//                 </TableCell>
//                 <TableCell>
//                   <Badge className={getStatusColor(stage.status)}>
//                     {stage.status}
//                   </Badge>
//                 </TableCell>
//                 <TableCell>{formatDisplayDate(stage.start_date)}</TableCell>
//                 <TableCell>{formatDisplayDate(stage.completion_date)}</TableCell>
//                 <TableCell>
//                   <div className="flex flex-wrap gap-1">
//                     {getStageConnections(stage._id).map(conn => (
//                       <Tooltip key={conn._id}>
//                         <TooltipTrigger asChild>
//                           <Badge variant="outline" className="text-xs">
//                             {conn.from_stage._id === stage._id 
//                               ? `→ ${conn.to_stage.stage.stage_name.substring(0, 10)}...` 
//                               : `← ${conn.from_stage.stage.stage_name.substring(0, 10)}...`}
//                           </Badge>
//                         </TooltipTrigger>
//                         <TooltipContent>
//                           <p>
//                             {conn.from_stage.stage.stage_name} → {conn.to_stage.stage.stage_name}
//                           </p>
//                           <Button 
//                             size="sm" 
//                             variant="ghost" 
//                             className="mt-1 p-0 h-6 w-6"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               onDeleteConnection(conn._id);
//                             }}
//                           >
//                             <X className="h-3 w-3" />
//                           </Button>
//                         </TooltipContent>
//                       </Tooltip>
//                     ))}
//                   </div>
//                 </TableCell>
//                 <TableCell className="text-right">
//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button variant="ghost" size="sm">
//                         <MoreHorizontal className="h-4 w-4" />
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end">
//                       <DropdownMenuItem onClick={() => onEdit(stage._id)}>
//                         <Edit className="mr-2 h-4 w-4" />
//                         Edit
//                       </DropdownMenuItem>
//                       <DropdownMenuItem onClick={() => onDelete(stage._id)} className="text-red-500">
//                         <Trash2 className="mr-2 h-4 w-4" />
//                         Delete
//                       </DropdownMenuItem>
//                       {stage.status === 'Ongoing' && (
//                         <DropdownMenuItem onClick={() => onMarkComplete(stage._id)}>
//                           <CheckCircle className="mr-2 h-4 w-4" />
//                           Mark Complete
//                         </DropdownMenuItem>
//                       )}
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>
//     </TooltipProvider>
//   );
// };








// // frontend/app/components/projects/ProjectStageTable.tsx
// import React from "react";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Trash2, Edit, CheckCircle, MoreHorizontal } from "lucide-react";
// import { format } from "date-fns";
// import { type ProjectStageEntry, type StageConnectionEntry } from "@/lib/schema";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";

// interface ProjectStageTableProps {
//   stages: ProjectStageEntry[];
//   connections: StageConnectionEntry[];
//   onEdit: (stageId: string) => void;
//   onDelete: (stageId: string) => void;
//   onMarkComplete: (stageId: string) => void;
// }

// export const ProjectStageTable: React.FC<ProjectStageTableProps> = ({
//   stages,
//   connections,
//   onEdit,
//   onDelete,
//   onMarkComplete
// }) => {
//   const formatDisplayDate = (dateString?: string) => {
//     if (!dateString) return "Not set";
//     try {
//       return format(new Date(dateString), "MMM dd, yyyy");
//     } catch (error) {
//       return dateString;
//     }
//   };
  
//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'Ongoing': return 'bg-blue-100 text-blue-800';
//       case 'Completed': return 'bg-green-100 text-green-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };
  
//   const getConnectionCount = (stageId: string) => {
//     return connections.filter(conn => 
//       conn.from_stage._id === stageId || conn.to_stage._id === stageId
//     ).length;
//   };
  
//   return (
//     <TooltipProvider>
//       <div className="rounded-md border">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead className="w-[50px]">#</TableHead>
//               <TableHead className="w-[200px]">Stage Name</TableHead>
//               <TableHead>Status</TableHead>
//               <TableHead>Start Date</TableHead>
//               <TableHead>Completion Date</TableHead>
//               <TableHead>Connections</TableHead>
//               <TableHead className="text-right">Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {stages.map((stage, index) => (
//               <TableRow key={stage._id}>
//                 <TableCell>{index + 1}</TableCell>
//                 <TableCell>
//                   <Tooltip>
//                     <TooltipTrigger asChild>
//                       <div className="whitespace-normal break-words max-w-xs cursor-default">
//                         {stage.stage.stage_name}
//                       </div>
//                     </TooltipTrigger>
//                     <TooltipContent side="top" className="max-w-xs">
//                       <div className="space-y-1">
//                         <p className="font-medium">{stage.stage.stage_name}</p>
//                         {stage.stage.description && (
//                           <p className="text-sm">{stage.stage.description}</p>
//                         )}
//                       </div>
//                     </TooltipContent>
//                   </Tooltip>
//                 </TableCell>
//                 <TableCell>
//                   <Badge className={getStatusColor(stage.status)}>
//                     {stage.status}
//                   </Badge>
//                 </TableCell>
//                 <TableCell>{formatDisplayDate(stage.start_date)}</TableCell>
//                 <TableCell>{formatDisplayDate(stage.completion_date)}</TableCell>
//                 <TableCell>{getConnectionCount(stage._id)}</TableCell>
//                 <TableCell className="text-right">
//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button variant="ghost" size="sm">
//                         <MoreHorizontal className="h-4 w-4" />
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end">
//                       <DropdownMenuItem onClick={() => onEdit(stage._id)}>
//                         <Edit className="mr-2 h-4 w-4" />
//                         Edit
//                       </DropdownMenuItem>
//                       <DropdownMenuItem onClick={() => onDelete(stage._id)} className="text-red-500">
//                         <Trash2 className="mr-2 h-4 w-4" />
//                         Delete
//                       </DropdownMenuItem>
//                       {stage.status === 'Ongoing' && (
//                         <DropdownMenuItem onClick={() => onMarkComplete(stage._id)}>
//                           <CheckCircle className="mr-2 h-4 w-4" />
//                           Mark Complete
//                         </DropdownMenuItem>
//                       )}
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>
//     </TooltipProvider>
//   );
// };









// // frontend/app/components/projects/ProjectStageTable.tsx
// import React from "react";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Trash2, Edit, CheckCircle, MoreHorizontal } from "lucide-react";
// import { format } from "date-fns";
// import { type ProjectStageEntry, type StageConnectionEntry } from "@/lib/schema";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// interface ProjectStageTableProps {
//   stages: ProjectStageEntry[];
//   connections: StageConnectionEntry[];
//   onEdit: (stageId: string) => void;
//   onDelete: (stageId: string) => void;
//   onMarkComplete: (stageId: string) => void;
// }

// export const ProjectStageTable: React.FC<ProjectStageTableProps> = ({
//   stages,
//   connections,
//   onEdit,
//   onDelete,
//   onMarkComplete
// }) => {
//   const formatDisplayDate = (dateString?: string) => {
//     if (!dateString) return "Not set";
//     try {
//       return format(new Date(dateString), "MMM dd, yyyy");
//     } catch (error) {
//       return dateString;
//     }
//   };
  
//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'Ongoing': return 'bg-blue-100 text-blue-800';
//       case 'Completed': return 'bg-green-100 text-green-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };
  
//   const getConnectionCount = (stageId: string) => {
//     return connections.filter(conn => 
//       conn.from_stage._id === stageId || conn.to_stage._id === stageId
//     ).length;
//   };
  
//   return (
//     <div className="rounded-md border">
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead className="w-[50px]">#</TableHead>
//             <TableHead className="w-[200px]">Stage Name</TableHead>
//             <TableHead>Status</TableHead>
//             <TableHead>Start Date</TableHead>
//             <TableHead>Completion Date</TableHead>
//             <TableHead>Connections</TableHead>
//             <TableHead className="text-right">Actions</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {stages.map((stage, index) => (
//             <TableRow key={stage._id}>
//               <TableCell>{index + 1}</TableCell>
//               <TableCell 
//                 className="whitespace-normal break-words max-w-xs" 
//                 title={stage.stage.stage_name}
//               >
//                 {stage.stage.stage_name}
//               </TableCell>
//               <TableCell>
//                 <Badge className={getStatusColor(stage.status)}>
//                   {stage.status}
//                 </Badge>
//               </TableCell>
//               <TableCell>{formatDisplayDate(stage.start_date)}</TableCell>
//               <TableCell>{formatDisplayDate(stage.completion_date)}</TableCell>
//               <TableCell>{getConnectionCount(stage._id)}</TableCell>
//               <TableCell className="text-right">
//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <Button variant="ghost" size="sm">
//                       <MoreHorizontal className="h-4 w-4" />
//                     </Button>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent align="end">
//                     <DropdownMenuItem onClick={() => onEdit(stage._id)}>
//                       <Edit className="mr-2 h-4 w-4" />
//                       Edit
//                     </DropdownMenuItem>
//                     <DropdownMenuItem onClick={() => onDelete(stage._id)} className="text-red-500">
//                       <Trash2 className="mr-2 h-4 w-4" />
//                       Delete
//                     </DropdownMenuItem>
//                     {stage.status === 'Ongoing' && (
//                       <DropdownMenuItem onClick={() => onMarkComplete(stage._id)}>
//                         <CheckCircle className="mr-2 h-4 w-4" />
//                         Mark Complete
//                       </DropdownMenuItem>
//                     )}
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </div>
//   );
// };





// // frontend/app/components/projects/ProjectStageTable.tsx
// import React from "react";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Trash2, Edit, CheckCircle } from "lucide-react";
// import { format } from "date-fns";
// import { type ProjectStageEntry, type StageConnectionEntry } from "@/lib/schema";

// interface ProjectStageTableProps {
//   stages: ProjectStageEntry[];
//   connections: StageConnectionEntry[];
//   onEdit: (stageId: string) => void;
//   onDelete: (stageId: string) => void;
//   onMarkComplete: (stageId: string) => void;
// }

// export const ProjectStageTable: React.FC<ProjectStageTableProps> = ({
//   stages,
//   connections,
//   onEdit,
//   onDelete,
//   onMarkComplete
// }) => {
//   const formatDisplayDate = (dateString?: string) => {
//     if (!dateString) return "Not set";
//     try {
//       return format(new Date(dateString), "MMM dd, yyyy");
//     } catch (error) {
//       return dateString;
//     }
//   };
  
//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'Ongoing': return 'bg-blue-100 text-blue-800';
//       case 'Completed': return 'bg-green-100 text-green-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };
  
//   const getConnectionCount = (stageId: string) => {
//     return connections.filter(conn => 
//       conn.from_stage._id === stageId || conn.to_stage._id === stageId
//     ).length;
//   };
  
//   return (
//     <div className="rounded-md border">
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead className="w-[50px]">#</TableHead>
//             <TableHead>Stage Name</TableHead>
//             <TableHead>Status</TableHead>
//             <TableHead>Start Date</TableHead>
//             <TableHead>Completion Date</TableHead>
//             <TableHead>Connections</TableHead>
//             <TableHead className="text-right">Actions</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {stages.map((stage, index) => (
//             <TableRow key={stage._id}>
//               <TableCell>{index + 1}</TableCell>
//               <TableCell>{stage.stage.stage_name}</TableCell>
//               <TableCell>
//                 <Badge className={getStatusColor(stage.status)}>
//                   {stage.status}
//                 </Badge>
//               </TableCell>
//               <TableCell>{formatDisplayDate(stage.start_date)}</TableCell>
//               <TableCell>{formatDisplayDate(stage.completion_date)}</TableCell>
//               <TableCell>{getConnectionCount(stage._id)}</TableCell>
//               <TableCell className="text-right">
//                 <div className="flex justify-end gap-2">
//                   <Button 
//                     variant="ghost" 
//                     size="sm" 
//                     onClick={() => onEdit(stage._id)}
//                   >
//                     <Edit className="h-4 w-4" />
//                   </Button>
//                   <Button 
//                     variant="ghost" 
//                     size="sm" 
//                     onClick={() => onDelete(stage._id)}
//                   >
//                     <Trash2 className="h-4 w-4 text-red-500" />
//                   </Button>
//                   {stage.status === 'Ongoing' && (
//                     <Button 
//                       variant="outline" 
//                       size="sm" 
//                       onClick={() => onMarkComplete(stage._id)}
//                     >
//                       <CheckCircle className="h-4 w-4" />
//                     </Button>
//                   )}
//                 </div>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </div>
//   );
// };