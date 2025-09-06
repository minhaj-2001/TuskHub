import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle, ListTodo } from "lucide-react";
import { ProjectSearchDropdown } from "./ProjectSearchDropdown";
import { useStages } from "@/hooks/use-stages";
import { type ProjectEntry } from "@/lib/schema";

interface ProjectStageInfoProps {
  project: ProjectEntry | null;
  onProjectSelect: (project: any) => void;
}

export const ProjectStageInfo: React.FC<ProjectStageInfoProps> = ({ 
  project, 
  onProjectSelect 
}) => {
  // Use the useStages hook with projectId to get both global and custom stages
  const { stages: allStages } = useStages(project?._id);
  
  // Calculate project progress based on all stages in the system
  const calculateProjectProgress = () => {
    if (!project || !project.stages || project.stages.length === 0) {
      return 0;
    }
    
    // Total stages in the system (both global and custom for this project)
    const totalStagesInSystem = allStages.length;
    
    // Stages added to this project
    const stagesInProject = project.stages.length;
    
    // Calculate progress as percentage of total stages in system
    return Math.round((stagesInProject / totalStagesInSystem) * 100);
  };
  
  const progressPercentage = calculateProjectProgress();
  
  if (!project) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            Project Stage Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Project Search Dropdown */}
            <div>
              <h3 className="text-sm font-medium mb-2">Select a Project</h3>
              <ProjectSearchDropdown 
                onProjectSelect={onProjectSelect} 
                selectedProject={null} 
              />
            </div>
            
            {/* All Stages Summary */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ListTodo className="h-5 w-5 text-blue-600" />
                <span className="font-medium">All Stages in System</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">{allStages.length}</div>
              <div className="text-sm text-gray-600 mt-1">
                Total stages available across all projects
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
              <AlertCircle className="h-12 w-12 mb-4 text-gray-400" />
              <p className="mb-2">No project selected</p>
              <p className="text-sm">Select a project from the dropdown to view stage information</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate stage statistics
  const totalStages = project.stages?.length || 0;
  const completedStages = project.stages?.filter(stage => stage.status === 'Completed').length || 0;
  const remainingStages = totalStages - completedStages;
  const completionPercentage = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;
  
  // Count custom stages
  const customStagesCount = project.stages?.filter(stage => stage.stage.isCustom).length || 0;
  
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Ongoing': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-green-600" />
          Project Stage Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Project Search Dropdown */}
          <div>
            <h3 className="text-sm font-medium mb-2">Select a Project</h3>
            <ProjectSearchDropdown 
              onProjectSelect={onProjectSelect} 
              selectedProject={project} 
            />
          </div>
          
          {/* All Stages Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <ListTodo className="h-5 w-5 text-blue-600" />
              <span className="font-medium">All Stages in System</span>
            </div>
            <div className="text-3xl font-bold text-blue-600">{allStages.length}</div>
            <div className="text-sm text-gray-600 mt-1">
              Total stages available across all projects
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold truncate">{project.project_name}</h3>
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Total Stages</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">{totalStages}</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Completed Stages</span>
              </div>
              <div className="text-3xl font-bold text-green-600">{completedStages}</div>
              <div className="text-sm text-gray-600 mt-1">
                {completionPercentage}% of project stages
              </div>
            </div>
          </div>
          
          {/* Custom Stages Indicator */}
          {customStagesCount > 0 && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ListTodo className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Custom Stages</span>
              </div>
              <div className="text-3xl font-bold text-purple-600">{customStagesCount}</div>
              <div className="text-sm text-gray-600 mt-1">
                Custom stages created for this project
              </div>
            </div>
          )}
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Project Progress (vs All Stages)</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-green-600 h-2.5 rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {totalStages} of {allStages.length} total stages added to this project
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Stage Completion Progress</span>
              <span>{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>Remaining Stages: {remainingStages}</p>
            <p>Created: {new Date(project.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};