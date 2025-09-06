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
  projectStatus?: string; // Add this prop
}

export const ProjectStageCard: React.FC<ProjectStageCardProps> = ({ 
  stage, 
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

  const canEditStage = canEdit && projectStatus !== 'Completed';
  
  return (
    <Card 
      id={`stage-card-${stage._id}`}
      className="h-full flex flex-col"
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-2 flex items-center gap-2">
            {stage.stage.stage_name}
            {stage.stage.isCustom && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Custom
              </Badge>
            )}
          </CardTitle>
          {canEditStage && (
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
    Remove from Project
  </DropdownMenuItem>
  {stage.status === 'Ongoing' && (
    <DropdownMenuItem onClick={onMarkComplete}>
      <CheckCircle className="mr-2 h-4 w-4" />
      Mark Stage Complete
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