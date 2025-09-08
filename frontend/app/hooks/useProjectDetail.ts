import { useState, useEffect } from "react";
import { type ProjectEntry, type ProjectStageEntry, type StageEntry, type StageConnectionEntry } from "@/lib/schema";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api-v1";

export const useProjectDetail = (projectId: string | null) => {
  const [project, setProject] = useState<ProjectEntry | null>(null);
  const [stages, setStages] = useState<ProjectStageEntry[]>([]);
  const [connections, setConnections] = useState<StageConnectionEntry[]>([]);
  const [availableStages, setAvailableStages] = useState<StageEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchProjectDetail = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch project details
      const projectRes = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (!projectRes.ok) {
        if (projectRes.status === 403) {
          throw new Error("Access denied. You don't have permission to view this project.");
        }
        throw new Error("Failed to fetch project");
      }
      
      const projectData = await projectRes.json();
      setProject(projectData);
      
      // Fetch project stages and sort by date
      if (projectData.stages) {
        // Sort stages by date (oldest first)
        const sortedStages = [...projectData.stages].sort((a, b) => {
          const dateA = a.start_date ? new Date(a.start_date).getTime() : Infinity;
          const dateB = b.start_date ? new Date(b.start_date).getTime() : Infinity;
          return dateA - dateB;
        });
        setStages(sortedStages);
      }
      
      // Fetch stage connections
      const connectionsRes = await fetch(`${API_BASE_URL}/projects/${projectId}/connections`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (connectionsRes.ok) {
        const connectionsData = await connectionsRes.json();
        setConnections(connectionsData);
      }
      
      // Fetch all available stages
      const stagesRes = await fetch(`${API_BASE_URL}/stages/all-stages`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (stagesRes.ok) {
        const allStages = await stagesRes.json();
        
        // Filter out stages already added to the project
        const addedStageIds = projectData.stages?.map((s: ProjectStageEntry) => s.stage._id) || [];
        const filteredStages = allStages.filter((stage: StageEntry) => 
          !addedStageIds.includes(stage._id)
        );
        
        setAvailableStages(filteredStages);
      }
    } catch (err) {
      console.error("Error fetching project detail:", err);
      setError(err instanceof Error ? err.message : "Failed to load project details. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const addStageToProject = async (stageId: string, status: 'Ongoing' | 'Completed', startDate?: string, completionDate?: string) => {
    if (!projectId) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${projectId}/stages`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          stageId,
          status,
          start_date: status === 'Ongoing' ? startDate : undefined,
          completion_date: status === 'Completed' ? completionDate : undefined
        }),
      });
      
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("Access denied. You don't have permission to modify this project.");
        }
        throw new Error("Failed to add stage to project");
      }
      
      // Update project status based on the first stage added
      const stageData = await res.json();
      
      // Refresh project data
      await fetchProjectDetail();
      return true;
    } catch (err) {
      console.error("Error adding stage to project:", err);
      setError(err instanceof Error ? err.message : "Failed to add stage to project. Please try again.");
      return false;
    }
  };
  
  const updateProjectStage = async (stageId: string, status: 'Ongoing' | 'Completed', startDate?: string, completionDate?: string) => {
    if (!projectId) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${projectId}/stages/${stageId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          status,
          start_date: status === 'Ongoing' ? startDate : undefined,
          completion_date: status === 'Completed' ? completionDate : undefined
        }),
      });
      
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("Access denied. You don't have permission to modify this project.");
        }
        throw new Error("Failed to update project stage");
      }
      
      // Refresh project data
      await fetchProjectDetail();
      return true;
    } catch (err) {
      console.error("Error updating project stage:", err);
      setError(err instanceof Error ? err.message : "Failed to update project stage. Please try again.");
      return false;
    }
  };
  
  const deleteProjectStage = async (stageId: string) => {
    if (!projectId) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${projectId}/stages/${stageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("Access denied. You don't have permission to modify this project.");
        }
        throw new Error("Failed to delete project stage");
      }
      
      // Refresh project data
      await fetchProjectDetail();
      return true;
    } catch (err) {
      console.error("Error deleting project stage:", err);
      setError(err instanceof Error ? err.message : "Failed to delete project stage. Please try again.");
      return false;
    }
  };
  
  const createStageConnection = async (fromStageId: string, toStageId: string) => {
    if (!projectId) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${projectId}/connections`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          fromStageId,
          toStageId
        }),
      });
      
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("Access denied. You don't have permission to modify this project.");
        }
        throw new Error("Failed to create stage connection");
      }
      
      // Refresh project data
      await fetchProjectDetail();
      return true;
    } catch (err) {
      console.error("Error creating stage connection:", err);
      setError(err instanceof Error ? err.message : "Failed to create stage connection. Please try again.");
      return false;
    }
  };
  
  useEffect(() => {
    fetchProjectDetail();
  }, [projectId]);
  
  return {
    project,
    stages,
    connections,
    availableStages,
    isLoading,
    error,
    addStageToProject,
    updateProjectStage,
    deleteProjectStage,
    createStageConnection,
    refetch: fetchProjectDetail
  };
};














// // frontend/app/hooks/useProjectDetail.ts
// import { useState, useEffect } from "react";
// import { type ProjectEntry, type ProjectStageEntry, type StageEntry, type StageConnectionEntry } from "@/lib/schema";

// const API_BASE_URL = "http://localhost:5000/api-v1";

// export const useProjectDetail = (projectId: string | null) => {
//   const [project, setProject] = useState<ProjectEntry | null>(null);
//   const [stages, setStages] = useState<ProjectStageEntry[]>([]);
//   const [connections, setConnections] = useState<StageConnectionEntry[]>([]);
//   const [availableStages, setAvailableStages] = useState<StageEntry[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const fetchProjectDetail = async () => {
//     if (!projectId) return;
    
//     setIsLoading(true);
//     setError(null);
    
//     try {
//       // Fetch project details
//       const projectRes = await fetch(`${API_BASE_URL}/projects/${projectId}`);
//       if (!projectRes.ok) throw new Error("Failed to fetch project");
//       const projectData = await projectRes.json();
//       setProject(projectData);
      
//       // Fetch project stages and sort by date
//       if (projectData.stages) {
//           // // Sort stages by date (oldest first)
//         // const sortedStages = [...projectData.stages].sort((a, b) => {
//         //   const dateA = new Date(a.start_date || a.created_at);
//         //   const dateB = new Date(b.start_date || b.created_at);
//         //   return dateA.getTime() - dateB.getTime();
//         // });
//         // setStages(sortedStages);

//          // Sort stages by date (oldest first)
//         const sortedStages = [...projectData.stages].sort((a, b) => {
//           const dateA = a.start_date ? new Date(a.start_date).getTime() : Infinity;
//           const dateB = b.start_date ? new Date(b.start_date).getTime() : Infinity;
//           return dateA - dateB;
//         });
//         setStages(sortedStages);
//       }
      
//       // Fetch stage connections
//       const connectionsRes = await fetch(`${API_BASE_URL}/projects/${projectId}/connections`);
//       if (connectionsRes.ok) {
//         const connectionsData = await connectionsRes.json();
//         setConnections(connectionsData);
//       }
      
//       // Fetch all available stages
//       const stagesRes = await fetch(`${API_BASE_URL}/stages/all-stages`);
//       if (stagesRes.ok) {
//         const allStages = await stagesRes.json();
        
//         // Filter out stages already added to the project
//         const addedStageIds = projectData.stages?.map((s: ProjectStageEntry) => s.stage._id) || [];
//         const filteredStages = allStages.filter((stage: StageEntry) => 
//           !addedStageIds.includes(stage._id)
//         );
        
//         setAvailableStages(filteredStages);
//       }
//     } catch (err) {
//       console.error("Error fetching project detail:", err);
//       setError("Failed to load project details. Please try again later.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const updateProjectStatus = async (projectId: string, status: 'Pending' | 'Ongoing' | 'Completed' | 'Archived') => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({ status }),
//       });
      
//       if (!res.ok) throw new Error("Failed to update project status");
      
//       // Update the local project state
//       if (project) {
//         setProject({
//           ...project,
//           status
//         });
//       }
      
//       return true;
//     } catch (err) {
//       console.error("Error updating project status:", err);
//       setError("Failed to update project status. Please try again.");
//       return false;
//     }
//   };

//   const addStageToProject = async (stageId: string, status: 'Ongoing' | 'Completed', startDate?: string, completionDate?: string) => {
//     if (!projectId) return;
    
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/${projectId}/stages`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           stageId,
//           status,
//           start_date: status === 'Ongoing' ? startDate : undefined,
//           completion_date: status === 'Completed' ? completionDate : undefined
//         }),
//       });
      
//       if (!res.ok) throw new Error("Failed to add stage to project");
      
//       // Update project status based on the first stage added
//       const stageData = await res.json();
      
//       // If this is the first stage being added, update project status to 'Ongoing'
//       if (stages.length === 0) {
//         await updateProjectStatus(projectId, 'Ongoing');
//       }
      
//       // Refresh project data
//       await fetchProjectDetail();
//       return true;
//     } catch (err) {
//       console.error("Error adding stage to project:", err);
//       setError("Failed to add stage to project. Please try again.");
//       return false;
//     }
//   };

//   const updateProjectStage = async (stageId: string, status: 'Ongoing' | 'Completed', startDate?: string, completionDate?: string) => {
//     if (!projectId) return;
    
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/${projectId}/stages/${stageId}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           status,
//           start_date: status === 'Ongoing' ? startDate : undefined,
//           completion_date: status === 'Completed' ? completionDate : undefined
//         }),
//       });
      
//       if (!res.ok) throw new Error("Failed to update project stage");
      
//       // Refresh project data
//       await fetchProjectDetail();
//       return true;
//     } catch (err) {
//       console.error("Error updating project stage:", err);
//       setError("Failed to update project stage. Please try again.");
//       return false;
//     }
//   };

//   const deleteProjectStage = async (stageId: string) => {
//     if (!projectId) return;
    
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/${projectId}/stages/${stageId}`, {
//         method: "DELETE",
//       });
      
//       if (!res.ok) throw new Error("Failed to delete project stage");
      
//       // If this was the last stage being removed, update project status to 'Pending'
//       if (stages.length === 1) {
//         await updateProjectStatus(projectId, 'Pending');
//       }
      
//       // Refresh project data
//       await fetchProjectDetail();
//       return true;
//     } catch (err) {
//       console.error("Error deleting project stage:", err);
//       setError("Failed to delete project stage. Please try again.");
//       return false;
//     }
//   };

//   const createStageConnection = async (fromStageId: string, toStageId: string) => {
//     if (!projectId) return;
    
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/${projectId}/connections`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           fromStageId,
//           toStageId
//         }),
//       });
      
//       if (!res.ok) throw new Error("Failed to create stage connection");
      
//       // Refresh project data
//       await fetchProjectDetail();
//       return true;
//     } catch (err) {
//       console.error("Error creating stage connection:", err);
//       setError("Failed to create stage connection. Please try again.");
//       return false;
//     }
//   };

//   useEffect(() => {
//     fetchProjectDetail();
//   }, [projectId]);

//   return {
//     project,
//     stages,
//     connections,
//     availableStages,
//     isLoading,
//     error,
//     addStageToProject,
//     updateProjectStage,
//     deleteProjectStage,
//     createStageConnection,
//     refetch: fetchProjectDetail
//   };
// };
















// // frontend/app/hooks/useProjectDetail.ts
// import { useState, useEffect } from "react";
// import { type ProjectEntry, type ProjectStageEntry, type StageEntry, type StageConnectionEntry } from "@/lib/schema";

// const API_BASE_URL = "http://localhost:5000/api-v1";

// export const useProjectDetail = (projectId: string | null) => {
//   const [project, setProject] = useState<ProjectEntry | null>(null);
//   const [stages, setStages] = useState<ProjectStageEntry[]>([]);
//   const [connections, setConnections] = useState<StageConnectionEntry[]>([]);
//   const [availableStages, setAvailableStages] = useState<StageEntry[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const fetchProjectDetail = async () => {
//     if (!projectId) return;
    
//     setIsLoading(true);
//     setError(null);
    
//     try {
//       // Fetch project details
//       const projectRes = await fetch(`${API_BASE_URL}/projects/project/${projectId}`);
//       if (!projectRes.ok) throw new Error("Failed to fetch project");
//       const projectData = await projectRes.json();
//       setProject(projectData);
      
//        // Fetch project stages and sort by date
//       if (projectData.stages) {
//         // // Sort stages by date (oldest first)
//         // const sortedStages = [...projectData.stages].sort((a, b) => {
//         //   const dateA = new Date(a.start_date || a.created_at);
//         //   const dateB = new Date(b.start_date || b.created_at);
//         //   return dateA.getTime() - dateB.getTime();
//         // });
//         // setStages(sortedStages);

//          // Sort stages by date (oldest first)
//         const sortedStages = [...projectData.stages].sort((a, b) => {
//           const dateA = a.start_date ? new Date(a.start_date).getTime() : Infinity;
//           const dateB = b.start_date ? new Date(b.start_date).getTime() : Infinity;
//           return dateA - dateB;
//         });
//         setStages(sortedStages);
//       }
      
//       // Fetch stage connections
//       const connectionsRes = await fetch(`${API_BASE_URL}/projects/project/${projectId}/connections`);
//       if (connectionsRes.ok) {
//         const connectionsData = await connectionsRes.json();
//         setConnections(connectionsData);
//       }
      
//       // Fetch all available stages
//       const stagesRes = await fetch(`${API_BASE_URL}/stages/all-stages`);
//       if (stagesRes.ok) {
//         const allStages = await stagesRes.json();
        
//         // Filter out stages already added to the project
//         const addedStageIds = projectData.stages?.map((s: ProjectStageEntry) => s.stage._id) || [];
//         const filteredStages = allStages.filter((stage: StageEntry) => 
//           !addedStageIds.includes(stage._id)
//         );
        
//         setAvailableStages(filteredStages);
//       }
//     } catch (err) {
//       console.error("Error fetching project detail:", err);
//       setError("Failed to load project details. Please try again later.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const addStageToProject = async (stageId: string, status: 'Ongoing' | 'Completed', startDate?: string, completionDate?: string) => {
//     if (!projectId) return;
    
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/project/${projectId}/stages`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           stageId,
//           status,
//           start_date: status === 'Ongoing' ? startDate : undefined,
//           completion_date: status === 'Completed' ? completionDate : undefined
//         }),
//       });
      
//       if (!res.ok) throw new Error("Failed to add stage to project");
      
//       // Refresh project data
//       await fetchProjectDetail();
//       return true;
//     } catch (err) {
//       console.error("Error adding stage to project:", err);
//       setError("Failed to add stage to project. Please try again.");
//       return false;
//     }
//   };

//   const updateProjectStage = async (stageId: string, status: 'Ongoing' | 'Completed', startDate?: string, completionDate?: string) => {
//     if (!projectId) return;
    
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/project/${projectId}/stages/${stageId}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           status,
//           start_date: status === 'Ongoing' ? startDate : undefined,
//           completion_date: status === 'Completed' ? completionDate : undefined
//         }),
//       });
      
//       if (!res.ok) throw new Error("Failed to update project stage");
      
//       // Refresh project data
//       await fetchProjectDetail();
//       return true;
//     } catch (err) {
//       console.error("Error updating project stage:", err);
//       setError("Failed to update project stage. Please try again.");
//       return false;
//     }
//   };

//   const deleteProjectStage = async (stageId: string) => {
//     if (!projectId) return;
    
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/project/${projectId}/stages/${stageId}`, {
//         method: "DELETE",
//       });
      
//       if (!res.ok) throw new Error("Failed to delete project stage");
      
//       // Refresh project data
//       await fetchProjectDetail();
//       return true;
//     } catch (err) {
//       console.error("Error deleting project stage:", err);
//       setError("Failed to delete project stage. Please try again.");
//       return false;
//     }
//   };

//   const createStageConnection = async (fromStageId: string, toStageId: string) => {
//     if (!projectId) return;
    
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/project/${projectId}/connections`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           fromStageId,
//           toStageId
//         }),
//       });
      
//       if (!res.ok) throw new Error("Failed to create stage connection");
      
//       // Refresh project data
//       await fetchProjectDetail();
//       return true;
//     } catch (err) {
//       console.error("Error creating stage connection:", err);
//       setError("Failed to create stage connection. Please try again.");
//       return false;
//     }
//   };

//   useEffect(() => {
//     fetchProjectDetail();
//   }, [projectId]);

//   return {
//     project,
//     stages,
//     connections,
//     availableStages,
//     isLoading,
//     error,
//     addStageToProject,
//     updateProjectStage,
//     deleteProjectStage,
//     createStageConnection,
//     refetch: fetchProjectDetail
//   };
// };