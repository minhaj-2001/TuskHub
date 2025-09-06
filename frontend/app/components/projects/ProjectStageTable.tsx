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