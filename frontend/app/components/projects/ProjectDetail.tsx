import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Calendar, CheckCircle, Circle, Trash2, Edit, Grid, List } from "lucide-react";
import { format } from "date-fns";
import { useProjectDetail } from "@/hooks/useProjectDetail";
import { useAuth } from "@/provider/auth-context";
import { ProjectStageForm } from "./ProjectStageForm";
import { ConnectionForm } from "./ConnectionForm";
import { ProjectStageCard } from "./ProjectStageCard";
import { ProjectStageTable } from "./ProjectStageTable";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [showStageForm, setShowStageForm] = useState(false);
  const [showConnectionForm, setShowConnectionForm] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [preSelectedStageId, setPreSelectedStageId] = useState<string | null>(null);
  
  const {
    project,
    stages,
    connections,
    availableStages,
    isLoading,
    error,
    addStageToProject,
    updateProjectStage,
    deleteProjectStage,
    createStageConnection
  } = useProjectDetail(projectId || null);
  
  // Determine if user can edit this project
  const canEditProject = user?.role === "manager" && project?.owner._id === user._id;
  
  const handleAddStage = (stageId: string, status: 'Ongoing' | 'Completed', startDate?: string, completionDate?: string) => {
    addStageToProject(stageId, status, startDate, completionDate);
    setShowStageForm(false);
    setPreSelectedStageId(null);
  };
  
  const handleStageClick = (stageId: string) => {
    if (!canEditProject) return;
    setPreSelectedStageId(stageId);
    setShowStageForm(true);
  };
  
  const handleUpdateStage = (stageId: string, status: 'Ongoing' | 'Completed', startDate?: string, completionDate?: string) => {
    updateProjectStage(stageId, status, startDate, completionDate);
    setEditingStage(null);
  };
  
  const handleCreateConnection = (fromStageId: string, toStageId: string) => {
    createStageConnection(fromStageId, toStageId);
    setShowConnectionForm(false);
  };
  
  const handleMarkComplete = (stageId: string) => {
    if (!canEditProject) return;
    const stage = stages.find(s => s._id === stageId);
    if (stage) {
      // Show completion date picker
      setEditingStage(stageId);
    }
  };
  
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
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error || !project) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Project not found"}
          </AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => navigate("/projects")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate("/projects")} className="mr-4">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{project.project_name}</h1>
            <div className="flex items-center mt-1">
              <Badge className={getStatusColor(project.status || '')}>
                {project.status}
              </Badge>
              <span className="text-sm text-muted-foreground ml-2">
                Created: {formatDisplayDate(project.created_at)}
              </span>
              {project.owner && (
                <span className="text-sm text-muted-foreground ml-2">
                  Owner: {project.owner.name}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {canEditProject && (
            <>
              <Button 
            variant="outline" 
            onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
            className="flex items-center gap-1"
          >
            {viewMode === 'cards' ? (
              <>
                <List className="h-4 w-4" />
                Table
              </>
            ) : (
              <>
                <Grid className="h-4 w-4" />
                Card 
              </>
            )}
          </Button>
              <Button onClick={() => {
                setShowStageForm(true);
                setPreSelectedStageId(null);
              }}>
                <Plus className="mr-2 h-4 w-4" /> Add Stage
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowConnectionForm(true)}
                disabled={stages.length < 2}
              >
                Connect Stages
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Available Stages */}
      {canEditProject && availableStages.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Available Stages</CardTitle>
            <p className="text-sm text-muted-foreground">Click on a stage to add it to the project</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {availableStages.map(stage => (
                <div 
                  key={stage._id}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors hover:shadow-sm"
                  onClick={() => handleStageClick(stage._id)}
                >
                  <div className="font-medium line-clamp-2">{stage.stage_name}</div>
                  {stage.description && (
                    <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {stage.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Project Stages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            Project Stages
            <Badge variant="secondary" className="ml-2">
              {stages.length} {stages.length === 1 ? 'Stage' : 'Stages'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No stages added to this project yet.
              {canEditProject && " Click on available stages above to add them."}
            </div>
          ) : viewMode === 'cards' ? (
            <div className="relative">
              {/* Connection lines for card view */}
              <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                {connections.map((conn, index) => {
                  const fromElement = document.getElementById(`stage-card-${conn.from_stage._id}`);
                  const toElement = document.getElementById(`stage-card-${conn.to_stage._id}`);
                  
                  if (!fromElement || !toElement) return null;
                  
                  const fromRect = fromElement.getBoundingClientRect();
                  const toRect = toElement.getBoundingClientRect();
                  
                  const containerRect = fromElement.parentElement?.getBoundingClientRect();
                  if (!containerRect) return null;
                  
                  const x1 = fromRect.left + fromRect.width / 2 - containerRect.left;
                  const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;
                  const x2 = toRect.left + toRect.width / 2 - containerRect.left;
                  const y2 = toRect.top + toRect.height / 2 - containerRect.top;
                  
                  return (
                    <line 
                      key={index}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#94a3b8"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
                  );
                })}
                <defs>
                  <marker 
                    id="arrowhead" 
                    markerWidth="10" 
                    markerHeight="7" 
                    refX="9" 
                    refY="3.5" 
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                  </marker>
                </defs>
              </svg>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative" style={{ zIndex: 1 }}>
                {stages.map(stage => (
                  <ProjectStageCard 
                    key={stage._id}
                    stage={stage}
                    onEdit={() => canEditProject && setEditingStage(stage._id)}
                    onDelete={() => canEditProject && deleteProjectStage(stage._id)}
                    onMarkComplete={() => canEditProject && handleMarkComplete(stage._id)}
                    canEdit={canEditProject}
                  />
                ))}
              </div>
            </div>
          ) : (
            <ProjectStageTable 
              stages={stages}
              onEdit={(stageId) => canEditProject && setEditingStage(stageId)}
              onDelete={(stageId) => canEditProject && deleteProjectStage(stageId)}
              onMarkComplete={(stageId) => canEditProject && handleMarkComplete(stageId)}
              canEdit={canEditProject}
            />
          )}
        </CardContent>
      </Card>
      
      {/* Add Stage Form - Only for Managers */}
      {canEditProject && showStageForm && (
        <ProjectStageForm
          availableStages={availableStages}
          onSubmit={handleAddStage}
          onCancel={() => {
            setShowStageForm(false);
            setPreSelectedStageId(null);
          }}
          preSelectedStageId={preSelectedStageId || undefined}
        />
      )}
      
      {/* Edit Stage Form - Only for Managers */}
      {canEditProject && editingStage && (
        <ProjectStageForm
          stage={stages.find(s => s._id === editingStage)}
          isEditing={true}
          onSubmit={(stageId, status, startDate, completionDate) => 
            handleUpdateStage(editingStage, status, startDate, completionDate)
          }
          onCancel={() => setEditingStage(null)}
        />
      )}
      
      {/* Connection Form - Only for Managers */}
      {canEditProject && showConnectionForm && (
        <ConnectionForm
          stages={stages}
          connections={connections}
          onSubmit={handleCreateConnection}
          onCancel={() => setShowConnectionForm(false)}
        />
      )}
    </div>
  );
};












// // frontend/app/components/projects/ProjectDetail.tsx
// import React, { useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { ArrowLeft, Plus, Calendar, CheckCircle, Circle, Trash2, Edit } from "lucide-react";
// import { format } from "date-fns";
// import { useProjectDetail } from "@/hooks/useProjectDetail";
// import { ProjectStageForm } from "./ProjectStageForm";
// import { ConnectionForm } from "./ConnectionForm";
// import { ProjectStageCard } from "./ProjectStageCard";
// import { ProjectStageTable } from "./ProjectStageTable";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { AlertCircle } from "lucide-react";

// export const ProjectDetail: React.FC = () => {
//   const { projectId } = useParams<{ projectId: string }>();
//   const navigate = useNavigate();
  
//   const [showStageForm, setShowStageForm] = useState(false);
//   const [showConnectionForm, setShowConnectionForm] = useState(false);
//   const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
//   const [editingStage, setEditingStage] = useState<string | null>(null);
//   const [preSelectedStageId, setPreSelectedStageId] = useState<string | null>(null);
  
//   const {
//     project,
//     stages,
//     connections,
//     availableStages,
//     isLoading,
//     error,
//     addStageToProject,
//     updateProjectStage,
//     deleteProjectStage,
//     createStageConnection
//   } = useProjectDetail(projectId || null);
  
//   const handleAddStage = (stageId: string, status: 'Ongoing' | 'Completed', startDate?: string, completionDate?: string) => {
//     addStageToProject(stageId, status, startDate, completionDate);
//     setShowStageForm(false);
//     setPreSelectedStageId(null);
//   };
  
//   const handleStageClick = (stageId: string) => {
//     setPreSelectedStageId(stageId);
//     setShowStageForm(true);
//   };
  
//   const handleUpdateStage = (stageId: string, status: 'Ongoing' | 'Completed', startDate?: string, completionDate?: string) => {
//     updateProjectStage(stageId, status, startDate, completionDate);
//     setEditingStage(null);
//   };
  
//   const handleCreateConnection = (fromStageId: string, toStageId: string) => {
//     createStageConnection(fromStageId, toStageId);
//     setShowConnectionForm(false);
//   };
  
//   const handleMarkComplete = (stageId: string) => {
//     const stage = stages.find(s => s._id === stageId);
//     if (stage) {
//       // Show completion date picker
//       setEditingStage(stageId);
//     }
//   };
  
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
  
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//       </div>
//     );
//   }
  
//   if (error || !project) {
//     return (
//       <div className="container mx-auto p-4">
//         <Alert variant="destructive">
//           <AlertCircle className="h-4 w-4" />
//           <AlertDescription>
//             {error || "Project not found"}
//           </AlertDescription>
//         </Alert>
//         <Button className="mt-4" onClick={() => navigate("/projects")}>
//           <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
//         </Button>
//       </div>
//     );
//   }
  
//   return (
//     <div className="container mx-auto p-4">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center">
//           <Button variant="ghost" onClick={() => navigate("/projects")} className="mr-4">
//             <ArrowLeft className="h-4 w-4" />
//           </Button>
//           <div>
//             <h1 className="text-2xl font-bold">{project.project_name}</h1>
//             <div className="flex items-center mt-1">
//               <Badge className={getStatusColor(project.status || '')}>
//                 {project.status}
//               </Badge>
//               <span className="text-sm text-muted-foreground ml-2">
//                 Created: {formatDisplayDate(project.created_at)}
//               </span>
//             </div>
//           </div>
//         </div>
        
//         <div className="flex gap-2">
//           <Button 
//             variant="outline" 
//             onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
//           >
//             {viewMode === 'cards' ? 'Table View' : 'Card View'}
//           </Button>
//           <Button onClick={() => {
//             setShowStageForm(true);
//             setPreSelectedStageId(null);
//           }}>
//             <Plus className="mr-2 h-4 w-4" /> Add Stage
//           </Button>
//           <Button 
//             variant="outline" 
//             onClick={() => setShowConnectionForm(true)}
//             disabled={stages.length < 2}
//           >
//             Connect Stages
//           </Button>
//         </div>
//       </div>
      
//       {/* Available Stages */}
//       {availableStages.length > 0 && (
//         <Card className="mb-6">
//           <CardHeader>
//             <CardTitle className="text-lg">Available Stages</CardTitle>
//             <p className="text-sm text-muted-foreground">Click on a stage to add it to the project</p>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
//               {availableStages.map(stage => (
//                 <div 
//                   key={stage._id}
//                   className="p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors hover:shadow-sm"
//                   onClick={() => handleStageClick(stage._id)}
//                 >
//                   <div className="font-medium line-clamp-2">{stage.stage_name}</div>
//                   {stage.description && (
//                     <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
//                       {stage.description}
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}
      
//       {/* Project Stages */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-lg flex items-center">
//             Project Stages
//             <Badge variant="secondary" className="ml-2">
//               {stages.length} {stages.length === 1 ? 'Stage' : 'Stages'}
//             </Badge>
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           {stages.length === 0 ? (
//             <div className="text-center py-8 text-muted-foreground">
//               No stages added to this project yet.
//             </div>
//           ) : viewMode === 'cards' ? (
//             <div className="relative">
//               {/* Connection lines for card view */}
//               <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
//                 {connections.map((conn, index) => {
//                   const fromElement = document.getElementById(`stage-card-${conn.from_stage._id}`);
//                   const toElement = document.getElementById(`stage-card-${conn.to_stage._id}`);
                  
//                   if (!fromElement || !toElement) return null;
                  
//                   const fromRect = fromElement.getBoundingClientRect();
//                   const toRect = toElement.getBoundingClientRect();
                  
//                   const containerRect = fromElement.parentElement?.getBoundingClientRect();
//                   if (!containerRect) return null;
                  
//                   const x1 = fromRect.left + fromRect.width / 2 - containerRect.left;
//                   const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;
//                   const x2 = toRect.left + toRect.width / 2 - containerRect.left;
//                   const y2 = toRect.top + toRect.height / 2 - containerRect.top;
                  
//                   return (
//                     <line 
//                       key={index}
//                       x1={x1}
//                       y1={y1}
//                       x2={x2}
//                       y2={y2}
//                       stroke="#94a3b8"
//                       strokeWidth="2"
//                       markerEnd="url(#arrowhead)"
//                     />
//                   );
//                 })}
//                 <defs>
//                   <marker 
//                     id="arrowhead" 
//                     markerWidth="10" 
//                     markerHeight="7" 
//                     refX="9" 
//                     refY="3.5" 
//                     orient="auto"
//                   >
//                     <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
//                   </marker>
//                 </defs>
//               </svg>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative" style={{ zIndex: 1 }}>
//                 {stages.map(stage => (
//                   <ProjectStageCard 
//                     key={stage._id}
//                     stage={stage}
//                     onEdit={() => setEditingStage(stage._id)}
//                     onDelete={() => deleteProjectStage(stage._id)}
//                     onMarkComplete={handleMarkComplete}
//                   />
//                 ))}
//               </div>
//             </div>
//           ) : (
//             <ProjectStageTable 
//               stages={stages}
//               onEdit={(stageId) => setEditingStage(stageId)}
//               onDelete={deleteProjectStage}
//               onMarkComplete={handleMarkComplete}
//             />
//           )}
//         </CardContent>
//       </Card>
      
//       {/* Add Stage Form */}
//       {showStageForm && (
//         <ProjectStageForm
//           availableStages={availableStages}
//           onSubmit={handleAddStage}
//           onCancel={() => {
//             setShowStageForm(false);
//             setPreSelectedStageId(null);
//           }}
//           preSelectedStageId={preSelectedStageId || undefined}
//         />
//       )}
      
//       {/* Edit Stage Form */}
//       {editingStage && (
//         <ProjectStageForm
//           stage={stages.find(s => s._id === editingStage)}
//           isEditing={true}
//           onSubmit={(stageId, status, startDate, completionDate) => 
//             handleUpdateStage(editingStage, status, startDate, completionDate)
//           }
//           onCancel={() => setEditingStage(null)}
//         />
//       )}
      
//       {/* Connection Form */}
//       {showConnectionForm && (
//         <ConnectionForm
//           stages={stages}
//           connections={connections}
//           onSubmit={handleCreateConnection}
//           onCancel={() => setShowConnectionForm(false)}
//         />
//       )}
//     </div>
//   );
// };









// // frontend/app/components/projects/ProjectDetail.tsx
// import React, { useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { ArrowLeft, Plus, Calendar, CheckCircle, Circle, Trash2, Edit } from "lucide-react";
// import { format } from "date-fns";
// import { useProjectDetail } from "@/hooks/useProjectDetail";
// import { ProjectStageForm } from "./ProjectStageForm";
// import { ConnectionForm } from "./ConnectionForm";
// import { ProjectStageCard } from "./ProjectStageCard";
// import { ProjectStageTable } from "./ProjectStageTable";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { AlertCircle } from "lucide-react";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";

// export const ProjectDetail: React.FC = () => {
//   const { projectId } = useParams<{ projectId: string }>();
//   const navigate = useNavigate();
  
//   const [showStageForm, setShowStageForm] = useState(false);
//   const [showConnectionForm, setShowConnectionForm] = useState(false);
//   const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
//   const [editingStage, setEditingStage] = useState<string | null>(null);
//   const [preSelectedStageId, setPreSelectedStageId] = useState<string | null>(null);
  
//   const {
//     project,
//     stages,
//     connections,
//     availableStages,
//     isLoading,
//     error,
//     addStageToProject,
//     updateProjectStage,
//     deleteProjectStage,
//     createStageConnection
//   } = useProjectDetail(projectId || null);
  
//   const handleAddStage = (stageId: string, status: 'Ongoing' | 'Completed', startDate?: string, completionDate?: string) => {
//     addStageToProject(stageId, status, startDate, completionDate);
//     setShowStageForm(false);
//     setPreSelectedStageId(null);
//   };
  
//   const handleStageClick = (stageId: string) => {
//     setPreSelectedStageId(stageId);
//     setShowStageForm(true);
//   };
  
//   const handleUpdateStage = (stageId: string, status: 'Ongoing' | 'Completed', startDate?: string, completionDate?: string) => {
//     updateProjectStage(stageId, status, startDate, completionDate);
//     setEditingStage(null);
//   };
  
//   const handleCreateConnection = (fromStageId: string, toStageId: string) => {
//     createStageConnection(fromStageId, toStageId);
//     setShowConnectionForm(false);
//   };
  
//   const handleMarkComplete = (stageId: string) => {
//     const stage = stages.find(s => s._id === stageId);
//     if (stage) {
//       // Show completion date picker
//       setEditingStage(stageId);
//     }
//   };
  
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
  
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//       </div>
//     );
//   }
  
//   if (error || !project) {
//     return (
//       <div className="container mx-auto p-4">
//         <Alert variant="destructive">
//           <AlertCircle className="h-4 w-4" />
//           <AlertDescription>
//             {error || "Project not found"}
//           </AlertDescription>
//         </Alert>
//         <Button className="mt-4" onClick={() => navigate("/projects")}>
//           <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
//         </Button>
//       </div>
//     );
//   }
  
//   return (
//     <div className="container mx-auto p-4">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center">
//           <Button variant="ghost" onClick={() => navigate("/projects")} className="mr-4">
//             <ArrowLeft className="h-4 w-4" />
//           </Button>
//           <div>
//             <h1 className="text-2xl font-bold">{project.project_name}</h1>
//             <div className="flex items-center mt-1">
//               <Badge className={getStatusColor(project.status || '')}>
//                 {project.status}
//               </Badge>
//               <span className="text-sm text-muted-foreground ml-2">
//                 Created: {formatDisplayDate(project.created_at)}
//               </span>
//             </div>
//           </div>
//         </div>
        
//         <div className="flex gap-2">
//           <Button 
//             variant="outline" 
//             onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
//           >
//             {viewMode === 'cards' ? 'Table View' : 'Card View'}
//           </Button>
//           <Button onClick={() => {
//             setShowStageForm(true);
//             setPreSelectedStageId(null);
//           }}>
//             <Plus className="mr-2 h-4 w-4" /> Add Stage
//           </Button>
//           <Button 
//             variant="outline" 
//             onClick={() => setShowConnectionForm(true)}
//             disabled={stages.length < 2}
//           >
//             Connect Stages
//           </Button>
//         </div>
//       </div>
      
//       {/* Project Description */}
//       {project.description && (
//         <Card className="mb-6">
//           <CardHeader>
//             <CardTitle className="text-lg">Project Description</CardTitle>
//           </CardHeader>
//           <CardContent className="pt-0">
//             <p className="whitespace-pre-wrap">{project.description}</p>
//           </CardContent>
//         </Card>
//       )}
      
//       {/* Available Stages */}
//       {availableStages.length > 0 && (
//         <Card className="mb-6">
//           <CardHeader>
//             <CardTitle className="text-lg">Available Stages</CardTitle>
//             <p className="text-sm text-muted-foreground">Click on a stage to add it to the project</p>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
//               {availableStages.map(stage => (
//                 <div 
//                   key={stage._id}
//                   className="p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors hover:shadow-sm"
//                   onClick={() => handleStageClick(stage._id)}
//                 >
//                   <div className="font-medium">{stage.stage_name}</div>
//                   {stage.description && (
//                     <div className="text-sm text-muted-foreground mt-1 line-clamp-3">
//                       {stage.description}
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}
      
//       {/* Project Stages */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-lg flex items-center">
//             Project Stages
//             <Badge variant="secondary" className="ml-2">
//               {stages.length} {stages.length === 1 ? 'Stage' : 'Stages'}
//             </Badge>
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           {stages.length === 0 ? (
//             <div className="text-center py-8 text-muted-foreground">
//               No stages added to this project yet.
//             </div>
//           ) : viewMode === 'cards' ? (
//             <div className="relative">
//               {/* Connection lines for card view */}
//               <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
//                 {connections.map((conn, index) => {
//                   const fromElement = document.getElementById(`stage-card-${conn.from_stage._id}`);
//                   const toElement = document.getElementById(`stage-card-${conn.to_stage._id}`);
                  
//                   if (!fromElement || !toElement) return null;
                  
//                   const fromRect = fromElement.getBoundingClientRect();
//                   const toRect = toElement.getBoundingClientRect();
                  
//                   const containerRect = fromElement.parentElement?.getBoundingClientRect();
//                   if (!containerRect) return null;
                  
//                   const x1 = fromRect.left + fromRect.width / 2 - containerRect.left;
//                   const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;
//                   const x2 = toRect.left + toRect.width / 2 - containerRect.left;
//                   const y2 = toRect.top + toRect.height / 2 - containerRect.top;
                  
//                   return (
//                     <line 
//                       key={index}
//                       x1={x1}
//                       y1={y1}
//                       x2={x2}
//                       y2={y2}
//                       stroke="#94a3b8"
//                       strokeWidth="2"
//                       markerEnd="url(#arrowhead)"
//                     />
//                   );
//                 })}
//                 <defs>
//                   <marker 
//                     id="arrowhead" 
//                     markerWidth="10" 
//                     markerHeight="7" 
//                     refX="9" 
//                     refY="3.5" 
//                     orient="auto"
//                   >
//                     <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
//                   </marker>
//                 </defs>
//               </svg>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative" style={{ zIndex: 1 }}>
//                 {stages.map(stage => (
//                   <ProjectStageCard 
//                     key={stage._id}
//                     stage={stage}
//                     onEdit={() => setEditingStage(stage._id)}
//                     onDelete={() => deleteProjectStage(stage._id)}
//                     onMarkComplete={handleMarkComplete}
//                   />
//                 ))}
//               </div>
//             </div>
//           ) : (
//             <ProjectStageTable 
//               stages={stages}
//             //   connections={connections}
//               onEdit={(stageId) => setEditingStage(stageId)}
//               onDelete={deleteProjectStage}
//               onMarkComplete={handleMarkComplete}
//             />
//           )}
//         </CardContent>
//       </Card>
      
//       {/* Add Stage Form */}
//       {showStageForm && (
//         <ProjectStageForm
//           availableStages={availableStages}
//           onSubmit={handleAddStage}
//           onCancel={() => {
//             setShowStageForm(false);
//             setPreSelectedStageId(null);
//           }}
//           preSelectedStageId={preSelectedStageId || undefined}
//         />
//       )}
      
//       {/* Edit Stage Form */}
//       {editingStage && (
//         <ProjectStageForm
//           stage={stages.find(s => s._id === editingStage)}
//           isEditing={true}
//           onSubmit={(stageId, status, startDate, completionDate) => 
//             handleUpdateStage(editingStage, status, startDate, completionDate)
//           }
//           onCancel={() => setEditingStage(null)}
//         />
//       )}
      
//       {/* Connection Form */}
//       {showConnectionForm && (
//         <ConnectionForm
//           stages={stages}
//           connections={connections}
//           onSubmit={handleCreateConnection}
//           onCancel={() => setShowConnectionForm(false)}
//         />
//       )}
//     </div>
//   );
// };





// // frontend/app/components/projects/ProjectDetail.tsx
// import React, { useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { ArrowLeft, Plus, Calendar, CheckCircle, Circle, Trash2, Edit } from "lucide-react";
// import { format } from "date-fns";
// import { useProjectDetail } from "@/hooks/useProjectDetail";
// import { ProjectStageForm } from "./ProjectStageForm";
// import { ConnectionForm } from "./ConnectionForm";
// import { ProjectStageCard } from "./ProjectStageCard";
// import { ProjectStageTable } from "./ProjectStageTable";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { AlertCircle } from "lucide-react";

// export const ProjectDetail: React.FC = () => {
//   const { projectId } = useParams<{ projectId: string }>();
//   const navigate = useNavigate();
  
//   const [showStageForm, setShowStageForm] = useState(false);
//   const [showConnectionForm, setShowConnectionForm] = useState(false);
//   const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
//   const [editingStage, setEditingStage] = useState<string | null>(null);
  
//   const {
//     project,
//     stages,
//     connections,
//     availableStages,
//     isLoading,
//     error,
//     addStageToProject,
//     updateProjectStage,
//     deleteProjectStage,
//     createStageConnection
//   } = useProjectDetail(projectId || null);
  
//   const handleAddStage = (stageId: string, status: 'Ongoing' | 'Completed', startDate?: string, completionDate?: string) => {
//     addStageToProject(stageId, status, startDate, completionDate);
//     setShowStageForm(false);
//   };
  
//   const handleUpdateStage = (stageId: string, status: 'Ongoing' | 'Completed', startDate?: string, completionDate?: string) => {
//     updateProjectStage(stageId, status, startDate, completionDate);
//     setEditingStage(null);
//   };
  
//   const handleCreateConnection = (fromStageId: string, toStageId: string) => {
//     createStageConnection(fromStageId, toStageId);
//     setShowConnectionForm(false);
//   };
  
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
  
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//       </div>
//     );
//   }
  
//   if (error || !project) {
//     return (
//       <div className="container mx-auto p-4">
//         <Alert variant="destructive">
//           <AlertCircle className="h-4 w-4" />
//           <AlertDescription>
//             {error || "Project not found"}
//           </AlertDescription>
//         </Alert>
//         <Button className="mt-4" onClick={() => navigate("/projects")}>
//           <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
//         </Button>
//       </div>
//     );
//   }
  
//   return (
//     <div className="container mx-auto p-4">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center">
//           <Button variant="ghost" onClick={() => navigate("/projects")} className="mr-4">
//             <ArrowLeft className="h-4 w-4" />
//           </Button>
//           <div>
//             <h1 className="text-2xl font-bold">{project.project_name}</h1>
//             <div className="flex items-center mt-1">
//               <Badge className={getStatusColor(project.status || '')}>
//                 {project.status}
//               </Badge>
//               <span className="text-sm text-muted-foreground ml-2">
//                 Created: {formatDisplayDate(project.created_at)}
//               </span>
//             </div>
//           </div>
//         </div>
        
//         <div className="flex gap-2">
//           <Button 
//             variant="outline" 
//             onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
//           >
//             {viewMode === 'cards' ? 'Table View' : 'Card View'}
//           </Button>
//           <Button onClick={() => setShowStageForm(true)}>
//             <Plus className="mr-2 h-4 w-4" /> Add Stage
//           </Button>
//           <Button 
//             variant="outline" 
//             onClick={() => setShowConnectionForm(true)}
//             disabled={stages.length < 2}
//           >
//             Connect Stages
//           </Button>
//         </div>
//       </div>
      
//       {project.description && (
//         <Card className="mb-6">
//           <CardContent className="pt-6">
//             <p>{project.description}</p>
//           </CardContent>
//         </Card>
//       )}
      
//       {/* Available Stages */}
//       {availableStages.length > 0 && (
//         <Card className="mb-6">
//           <CardHeader>
//             <CardTitle className="text-lg">Available Stages</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="flex flex-wrap gap-2">
//               {availableStages.map(stage => (
//                 <Badge key={stage._id} variant="outline" className="px-3 py-1">
//                   {stage.stage_name}
//                 </Badge>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}
      
//       {/* Project Stages */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-lg flex items-center">
//             Project Stages
//             <Badge variant="secondary" className="ml-2">
//               {stages.length} {stages.length === 1 ? 'Stage' : 'Stages'}
//             </Badge>
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           {stages.length === 0 ? (
//             <div className="text-center py-8 text-muted-foreground">
//               No stages added to this project yet.
//             </div>
//           ) : viewMode === 'cards' ? (
//             <div className="relative">
//               {/* Connection lines for card view */}
//               <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
//                 {connections.map((conn, index) => {
//                   const fromElement = document.getElementById(`stage-card-${conn.from_stage._id}`);
//                   const toElement = document.getElementById(`stage-card-${conn.to_stage._id}`);
                  
//                   if (!fromElement || !toElement) return null;
                  
//                   const fromRect = fromElement.getBoundingClientRect();
//                   const toRect = toElement.getBoundingClientRect();
                  
//                   const containerRect = fromElement.parentElement?.getBoundingClientRect();
//                   if (!containerRect) return null;
                  
//                   const x1 = fromRect.left + fromRect.width / 2 - containerRect.left;
//                   const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;
//                   const x2 = toRect.left + toRect.width / 2 - containerRect.left;
//                   const y2 = toRect.top + toRect.height / 2 - containerRect.top;
                  
//                   return (
//                     <line 
//                       key={index}
//                       x1={x1}
//                       y1={y1}
//                       x2={x2}
//                       y2={y2}
//                       stroke="#94a3b8"
//                       strokeWidth="2"
//                       markerEnd="url(#arrowhead)"
//                     />
//                   );
//                 })}
//                 <defs>
//                   <marker 
//                     id="arrowhead" 
//                     markerWidth="10" 
//                     markerHeight="7" 
//                     refX="9" 
//                     refY="3.5" 
//                     orient="auto"
//                   >
//                     <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
//                   </marker>
//                 </defs>
//               </svg>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative" style={{ zIndex: 1 }}>
//                 {stages.map(stage => (
//                   <ProjectStageCard 
//                     key={stage._id}
//                     stage={stage}
//                     onEdit={() => setEditingStage(stage._id)}
//                     onDelete={() => deleteProjectStage(stage._id)}
//                     onMarkComplete={(stageId) => {
//                       const stage = stages.find(s => s._id === stageId);
//                       if (stage) {
//                         updateProjectStage(stageId, 'Completed', stage.start_date, new Date().toISOString().split('T')[0]);
//                       }
//                     }}
//                   />
//                 ))}
//               </div>
//             </div>
//           ) : (
//             <ProjectStageTable 
//               stages={stages}
//               connections={connections}
//               onEdit={(stageId) => setEditingStage(stageId)}
//               onDelete={deleteProjectStage}
//               onMarkComplete={(stageId) => {
//                 const stage = stages.find(s => s._id === stageId);
//                 if (stage) {
//                   updateProjectStage(stageId, 'Completed', stage.start_date, new Date().toISOString().split('T')[0]);
//                 }
//               }}
//             />
//           )}
//         </CardContent>
//       </Card>
      
//       {/* Add Stage Form */}
//       {showStageForm && (
//         <ProjectStageForm
//           availableStages={availableStages}
//           onSubmit={handleAddStage}
//           onCancel={() => setShowStageForm(false)}
//         />
//       )}
      
//       {/* Edit Stage Form */}
//       {editingStage && (
//         <ProjectStageForm
//           stage={stages.find(s => s._id === editingStage)}
//           isEditing={true}
//           onSubmit={(stageId, status, startDate, completionDate) => 
//             handleUpdateStage(editingStage, status, startDate, completionDate)
//           }
//           onCancel={() => setEditingStage(null)}
//         />
//       )}
      
//       {/* Connection Form */}
//       {showConnectionForm && (
//         <ConnectionForm
//           stages={stages}
//           connections={connections}
//           onSubmit={handleCreateConnection}
//           onCancel={() => setShowConnectionForm(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default ProjectDetail; // Use default export instead of named export