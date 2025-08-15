import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface ProjectStageCardProps {
  stage: ProjectStageEntry;
  onEdit: () => void;
  onDelete: () => void;
  onMarkComplete: () => void;
  canEdit: boolean;
}

export const ProjectStageCard: React.FC<ProjectStageCardProps> = ({ 
  stage, 
  onEdit, 
  onDelete,
  onMarkComplete,
  canEdit
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

  return (
    <Card 
      id={`stage-card-${stage._id}`}
      className="h-full flex flex-col"
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-2">
            {stage.stage.stage_name}
          </CardTitle>
          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-red-500">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
                {stage.status === 'Ongoing' && (
                  <DropdownMenuItem onClick={onMarkComplete}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark Complete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary" className={getStatusColor(stage.status)}>
            {stage.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {stage.stage.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {stage.stage.description}
          </p>
        )}
        
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">Start Date: </span>
            <span>{formatDisplayDate(stage.start_date)}</span>
          </div>
          
          {stage.status === 'Completed' && (
            <div className="text-sm">
              <span className="font-medium">Completion Date: </span>
              <span>{formatDisplayDate(stage.completion_date)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
















// // frontend/app/components/projects/ProjectStageCard.tsx
// import React from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Trash2, Edit, CheckCircle, Calendar } from "lucide-react";
// import { format } from "date-fns";
// import { type ProjectStageEntry } from "@/lib/schema";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";

// interface ProjectStageCardProps {
//   stage: ProjectStageEntry;
//   onEdit: () => void;
//   onDelete: () => void;
//   onMarkComplete: (stageId: string) => void;
// }

// export const ProjectStageCard: React.FC<ProjectStageCardProps> = ({
//   stage,
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
  
//   return (
//     <TooltipProvider>
//       <Card 
//         id={`stage-card-${stage._id}`}
//         className="h-full flex flex-col relative transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
//       >
//         <CardHeader className="pb-3">
//           <div className="flex justify-between items-start">
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <CardTitle className="text-lg font-semibold cursor-default line-clamp-3 leading-tight">
//                   {stage.stage.stage_name}
//                 </CardTitle>
//               </TooltipTrigger>
//               <TooltipContent side="top" className="max-w-xs">
//                 <div className="space-y-1">
//                   <p className="font-medium">{stage.stage.stage_name}</p>
//                   {stage.stage.description && (
//                     <p className="text-sm">{stage.stage.description}</p>
//                   )}
//                 </div>
//               </TooltipContent>
//             </Tooltip>
//             <Badge className={getStatusColor(stage.status)}>
//               {stage.status}
//             </Badge>
//           </div>
//         </CardHeader>
        
//         <CardContent className="flex-grow">
//           <div className="space-y-2">
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <div className="flex items-center text-sm cursor-default">
//                   <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
//                   <span className="text-muted-foreground">Start:</span>
//                   <span className="ml-1 truncate">{formatDisplayDate(stage.start_date)}</span>
//                 </div>
//               </TooltipTrigger>
//               <TooltipContent>
//                 <p>Start Date: {formatDisplayDate(stage.start_date)}</p>
//               </TooltipContent>
//             </Tooltip>
            
//             {stage.status === 'Completed' && (
//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <div className="flex items-center text-sm cursor-default">
//                     <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
//                     <span className="text-muted-foreground">Completed:</span>
//                     <span className="ml-1 truncate">{formatDisplayDate(stage.completion_date)}</span>
//                   </div>
//                 </TooltipTrigger>
//                 <TooltipContent>
//                   <p>Completion Date: {formatDisplayDate(stage.completion_date)}</p>
//                 </TooltipContent>
//               </Tooltip>
//             )}
//           </div>
//         </CardContent>
        
//         <div className="p-4 pt-0 flex justify-between">
//           <div className="flex gap-2">
//             <Button variant="ghost" size="sm" onClick={onEdit}>
//               <Edit className="h-4 w-4" />
//             </Button>
//             <Button variant="ghost" size="sm" onClick={onDelete}>
//               <Trash2 className="h-4 w-4 text-red-500" />
//             </Button>
//           </div>
          
//           {stage.status === 'Ongoing' && (
//             <Button 
//               variant="outline" 
//               size="sm" 
//               onClick={() => onMarkComplete(stage._id)}
//             >
//               <CheckCircle className="mr-1 h-4 w-4" />
//               Mark Complete
//             </Button>
//           )}
//         </div>
//       </Card>
//     </TooltipProvider>
//   );
// };









// // frontend/app/components/projects/ProjectStageCard.tsx
// import React, { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Trash2, Edit, CheckCircle, Calendar } from "lucide-react";
// import { format } from "date-fns";
// import { type ProjectStageEntry } from "@/lib/schema";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";

// interface ProjectStageCardProps {
//   stage: ProjectStageEntry;
//   onEdit: () => void;
//   onDelete: () => void;
//   onMarkComplete: (stageId: string) => void;
// }

// export const ProjectStageCard: React.FC<ProjectStageCardProps> = ({
//   stage,
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
  
//   return (
//     <TooltipProvider>
//       <Card 
//         id={`stage-card-${stage._id}`}
//         className="h-full flex flex-col relative transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
//       >
//         <CardHeader className="pb-3">
//           <div className="flex justify-between items-start">
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <CardTitle className="text-lg font-semibold cursor-default truncate">
//                   {stage.stage.stage_name}
//                 </CardTitle>
//               </TooltipTrigger>
//               <TooltipContent side="top" className="max-w-xs">
//                 <div className="space-y-1">
//                   <p className="font-medium">{stage.stage.stage_name}</p>
//                   {stage.stage.description && (
//                     <p className="text-sm">{stage.stage.description}</p>
//                   )}
//                 </div>
//               </TooltipContent>
//             </Tooltip>
//             <Badge className={getStatusColor(stage.status)}>
//               {stage.status}
//             </Badge>
//           </div>
//         </CardHeader>
        
//         <CardContent className="flex-grow">
//           <div className="space-y-2">
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <div className="flex items-center text-sm cursor-default">
//                   <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
//                   <span className="text-muted-foreground">Start:</span>
//                   <span className="ml-1 truncate">{formatDisplayDate(stage.start_date)}</span>
//                 </div>
//               </TooltipTrigger>
//               <TooltipContent>
//                 <p>Start Date: {formatDisplayDate(stage.start_date)}</p>
//               </TooltipContent>
//             </Tooltip>
            
//             {stage.status === 'Completed' && (
//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <div className="flex items-center text-sm cursor-default">
//                     <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
//                     <span className="text-muted-foreground">Completed:</span>
//                     <span className="ml-1 truncate">{formatDisplayDate(stage.completion_date)}</span>
//                   </div>
//                 </TooltipTrigger>
//                 <TooltipContent>
//                   <p>Completion Date: {formatDisplayDate(stage.completion_date)}</p>
//                 </TooltipContent>
//               </Tooltip>
//             )}
//           </div>
//         </CardContent>
        
//         <div className="p-4 pt-0 flex justify-between">
//           <div className="flex gap-2">
//             <Button variant="ghost" size="sm" onClick={onEdit}>
//               <Edit className="h-4 w-4" />
//             </Button>
//             <Button variant="ghost" size="sm" onClick={onDelete}>
//               <Trash2 className="h-4 w-4 text-red-500" />
//             </Button>
//           </div>
          
//           {stage.status === 'Ongoing' && (
//             <Button 
//               variant="outline" 
//               size="sm" 
//               onClick={() => onMarkComplete(stage._id)}
//             >
//               <CheckCircle className="mr-1 h-4 w-4" />
//               Mark Complete
//             </Button>
//           )}
//         </div>
//       </Card>
//     </TooltipProvider>
//   );
// };








// // frontend/app/components/projects/ProjectStageCard.tsx
// import React, { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Trash2, Edit, CheckCircle, Calendar, MoreHorizontal } from "lucide-react";
// import { format } from "date-fns";
// import { type ProjectStageEntry } from "@/lib/schema";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// interface ProjectStageCardProps {
//   stage: ProjectStageEntry;
//   onEdit: () => void;
//   onDelete: () => void;
//   onMarkComplete: (stageId: string) => void;
// }

// export const ProjectStageCard: React.FC<ProjectStageCardProps> = ({
//   stage,
//   onEdit,
//   onDelete,
//   onMarkComplete
// }) => {
//   const [isExpanded, setIsExpanded] = useState(false);
  
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
  
//   const stageName = stage.stage.stage_name;
//   const shouldTruncate = stageName.length > 30;
//   const displayName = shouldTruncate && !isExpanded 
//     ? `${stageName.substring(0, 30)}...` 
//     : stageName;
  
//   return (
//     <Card 
//       id={`stage-card-${stage._id}`}
//       className="h-full flex flex-col relative transition-all duration-200 hover:shadow-md"
//     >
//       <CardHeader className="pb-3">
//         <div className="flex justify-between items-start">
//           <CardTitle 
//             className="text-lg font-semibold cursor-pointer"
//             onClick={() => shouldTruncate && setIsExpanded(!isExpanded)}
//             title={shouldTruncate ? "Click to expand/collapse" : ""}
//           >
//             {displayName}
//           </CardTitle>
//           <div className="flex gap-1">
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" size="sm">
//                   <MoreHorizontal className="h-4 w-4" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end">
//                 <DropdownMenuItem onClick={onEdit}>
//                   <Edit className="mr-2 h-4 w-4" />
//                   Edit
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={onDelete} className="text-red-500">
//                   <Trash2 className="mr-2 h-4 w-4" />
//                   Delete
//                 </DropdownMenuItem>
//                 {stage.status === 'Ongoing' && (
//                   <DropdownMenuItem onClick={() => onMarkComplete(stage._id)}>
//                     <CheckCircle className="mr-2 h-4 w-4" />
//                     Mark Complete
//                   </DropdownMenuItem>
//                 )}
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         </div>
//         <Badge className={getStatusColor(stage.status)}>
//           {stage.status}
//         </Badge>
//       </CardHeader>
      
//       <CardContent className="flex-grow">
//         {stage.stage.description && (
//           <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
//             {stage.stage.description}
//           </p>
//         )}
        
//         <div className="space-y-2">
//           <div className="flex items-center text-sm">
//             <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
//             <span className="text-muted-foreground">Start:</span>
//             <span className="ml-1">{formatDisplayDate(stage.start_date)}</span>
//           </div>
          
//           {stage.status === 'Completed' && (
//             <div className="flex items-center text-sm">
//               <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
//               <span className="text-muted-foreground">Completed:</span>
//               <span className="ml-1">{formatDisplayDate(stage.completion_date)}</span>
//             </div>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// };










// // frontend/app/components/projects/ProjectStageCard.tsx
// import React from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Trash2, Edit, CheckCircle, Calendar } from "lucide-react";
// import { format } from "date-fns";
// import { type ProjectStageEntry } from "@/lib/schema";

// interface ProjectStageCardProps {
//   stage: ProjectStageEntry;
//   onEdit: () => void;
//   onDelete: () => void;
//   onMarkComplete: (stageId: string) => void;
// }

// export const ProjectStageCard: React.FC<ProjectStageCardProps> = ({
//   stage,
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
  
//   return (
//     <Card 
//       id={`stage-card-${stage._id}`}
//       className="h-full flex flex-col relative"
//     >
//       <CardHeader className="pb-3">
//         <div className="flex justify-between items-start">
//           <CardTitle className="text-lg font-semibold">
//             {stage.stage.stage_name}
//           </CardTitle>
//           <Badge className={getStatusColor(stage.status)}>
//             {stage.status}
//           </Badge>
//         </div>
//       </CardHeader>
      
//       <CardContent className="flex-grow">
//         {stage.stage.description && (
//           <p className="text-sm text-muted-foreground mb-4">
//             {stage.stage.description}
//           </p>
//         )}
        
//         <div className="space-y-2">
//           <div className="flex items-center text-sm">
//             <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
//             <span className="text-muted-foreground">Start:</span>
//             <span className="ml-1">{formatDisplayDate(stage.start_date)}</span>
//           </div>
          
//           {stage.status === 'Completed' && (
//             <div className="flex items-center text-sm">
//               <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
//               <span className="text-muted-foreground">Completed:</span>
//               <span className="ml-1">{formatDisplayDate(stage.completion_date)}</span>
//             </div>
//           )}
//         </div>
//       </CardContent>
      
//       <div className="p-4 pt-0 flex justify-between">
//         <div className="flex gap-2">
//           <Button variant="ghost" size="sm" onClick={onEdit}>
//             <Edit className="h-4 w-4" />
//           </Button>
//           <Button variant="ghost" size="sm" onClick={onDelete}>
//             <Trash2 className="h-4 w-4 text-red-500" />
//           </Button>
//         </div>
        
//         {stage.status === 'Ongoing' && (
//           <Button 
//             variant="outline" 
//             size="sm" 
//             onClick={() => onMarkComplete(stage._id)}
//           >
//             <CheckCircle className="mr-1 h-4 w-4" />
//             Mark Complete
//           </Button>
//         )}
//       </div>
//     </Card>
//   );
// };