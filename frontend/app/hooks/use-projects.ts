// frontend/app/hooks/use-projects.ts
import { useState, useEffect, useCallback } from "react";
import { type ProjectEntry, projectSchema } from "@/lib/schema";
import { z } from "zod";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api-v1";

export const useProjects = () => {
  const [projects, setProjects] = useState<ProjectEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Memoize fetchProjects to prevent unnecessary re-renders
  const fetchProjects = useCallback(async (filters?: { year?: string; month?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      
      // Only add year filter if it's not "all" and not empty
      if (filters?.year && filters.year !== 'all') {
        queryParams.append('year', filters.year);
      }
      
      if (filters?.month) {
        queryParams.append('month', filters.month);
      }
      
      const queryString = queryParams.toString();
      const url = `${API_BASE_URL}/projects/all-projects${queryString ? `?${queryString}` : ''}`;
      
      console.log("Fetching projects from:", url); // Debug log
      
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch projects.");
      }
      const data = await res.json();
      console.log("Projects data received:", data); // Debug log
      setProjects(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err instanceof Error ? err.message : "Failed to load projects. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // New function to fetch available years
  const fetchProjectYears = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/projects/project-years`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch project years.");
      }
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error fetching project years:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch project years.");
      return [];
    }
  }, []);
  
  const createProject = useCallback(async (newProject: z.infer<typeof projectSchema>) => {
    try {
      const res = await fetch(`${API_BASE_URL}/projects/project`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newProject),
      });
      if (!res.ok) {
        throw new Error("Failed to create project.");
      }
      await fetchProjects();
    } catch (err) {
      console.error("Error creating project:", err);
      setError("Failed to create project. Please try again.");
    }
  }, [fetchProjects]);
  
  // Update to handle partial updates
  const updateProject = useCallback(async (id: string, updatedProject: Partial<z.infer<typeof projectSchema>>) => {
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updatedProject),
      });
      if (!res.ok) {
        throw new Error("Failed to update project.");
      }
      await fetchProjects();
    } catch (err) {
      console.error("Error updating project:", err);
      setError("Failed to update project. Please try again.");
    }
  }, [fetchProjects]);
  
  // Add function to update project status
  const updateProjectStatus = useCallback(async (id: string, status: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        throw new Error("Failed to update project status.");
      }
      await fetchProjects();
      return true;
    } catch (err) {
      console.error("Error updating project status:", err);
      setError("Failed to update project status. Please try again.");
      return false;
    }
  }, [fetchProjects]);
  
  const deleteProject = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/projects/delete-project/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to delete project.");
      }
      await fetchProjects();
    } catch (err) {
      console.error("Error deleting project:", err);
      setError("Failed to delete project. Please try again.");
    }
  }, [fetchProjects]);
  
  // Initial fetch on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
  
  return {
    projects,
    isLoading,
    error,
    createProject,
    updateProject,
    updateProjectStatus,  // Add this to the return object
    deleteProject,
    fetchProjects,
    fetchProjectYears,
    refetch: fetchProjects
  };
};













// // frontend/app/hooks/use-projects.ts
// import { useState, useEffect, useCallback } from "react";
// import { type ProjectEntry, projectSchema } from "@/lib/schema";
// import { z } from "zod";

// const API_BASE_URL = "http://localhost:5000/api-v1";

// export const useProjects = () => {
//   const [projects, setProjects] = useState<ProjectEntry[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
  
//   // Memoize fetchProjects to prevent unnecessary re-renders
//   const fetchProjects = useCallback(async (filters?: { year?: string; month?: string }) => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       // Build query string from filters
//       const queryParams = new URLSearchParams();
      
//       // Only add year filter if it's not "all" and not empty
//       if (filters?.year && filters.year !== 'all') {
//         queryParams.append('year', filters.year);
//       }
      
//       if (filters?.month) {
//         queryParams.append('month', filters.month);
//       }
      
//       const queryString = queryParams.toString();
//       const url = `${API_BASE_URL}/projects/all-projects${queryString ? `?${queryString}` : ''}`;
      
//       console.log("Fetching projects from:", url); // Debug log
      
//       const res = await fetch(url);
//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.message || "Failed to fetch projects.");
//       }
//       const data = await res.json();
//       console.log("Projects data received:", data); // Debug log
//       setProjects(data);
//     } catch (err) {
//       console.error("Error fetching projects:", err);
//       setError(err instanceof Error ? err.message : "Failed to load projects. Please try again later.");
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);
  
//   // New function to fetch available years
//   const fetchProjectYears = useCallback(async () => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/project-years`);
//       if (!res.ok) {
//         throw new Error("Failed to fetch project years.");
//       }
//       const data = await res.json();
//       return data;
//     } catch (err) {
//       console.error("Error fetching project years:", err);
//       setError(err instanceof Error ? err.message : "Failed to fetch project years.");
//       return [];
//     }
//   }, []);
  
//   const createProject = useCallback(async (newProject: z.infer<typeof projectSchema>) => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/project`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(newProject),
//       });
//       if (!res.ok) {
//         throw new Error("Failed to create project.");
//       }
//       await fetchProjects();
//     } catch (err) {
//       console.error("Error creating project:", err);
//       setError("Failed to create project. Please try again.");
//     }
//   }, [fetchProjects]);
  
//   // Update to handle partial updates
//   const updateProject = useCallback(async (id: string, updatedProject: Partial<z.infer<typeof projectSchema>>) => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(updatedProject),
//       });
//       if (!res.ok) {
//         throw new Error("Failed to update project.");
//       }
//       await fetchProjects();
//     } catch (err) {
//       console.error("Error updating project:", err);
//       setError("Failed to update project. Please try again.");
//     }
//   }, [fetchProjects]);
  
//   const deleteProject = useCallback(async (id: string) => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/delete-project/${id}`, {
//         method: "DELETE",
//       });
//       if (!res.ok) {
//         throw new Error("Failed to delete project.");
//       }
//       await fetchProjects();
//     } catch (err) {
//       console.error("Error deleting project:", err);
//       setError("Failed to delete project. Please try again.");
//     }
//   }, [fetchProjects]);
  
//   // Initial fetch on mount
//   useEffect(() => {
//     fetchProjects();
//   }, [fetchProjects]);
  
//   return {
//     projects,
//     isLoading,
//     error,
//     createProject,
//     updateProject,
//     deleteProject,
//     fetchProjects,
//     fetchProjectYears,
//     refetch: fetchProjects
//   };
// };








// // frontend/app/hooks/use-projects.ts
// import { useState, useEffect, useCallback } from "react";
// import { type ProjectEntry, projectSchema } from "@/lib/schema";
// import { z } from "zod";
// const API_BASE_URL = "http://localhost:5000/api-v1";

// export const useProjects = () => {
//   const [projects, setProjects] = useState<ProjectEntry[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // Memoize fetchProjects to prevent unnecessary re-renders
//   const fetchProjects = useCallback(async (filters?: { year?: string; month?: string }) => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       // Build query string from filters
//       const queryParams = new URLSearchParams();
//       if (filters?.year) queryParams.append('year', filters.year);
//       if (filters?.month) queryParams.append('month', filters.month);
      
//       const queryString = queryParams.toString();
//       const url = `${API_BASE_URL}/projects/all-projects${queryString ? `?${queryString}` : ''}`;
      
//       const res = await fetch(url);
//       if (!res.ok) {
//         throw new Error("Failed to fetch projects.");
//       }
//       const data = await res.json();
//       setProjects(data);
//     } catch (err) {
//       console.error("Error fetching projects:", err);
//       setError("Failed to load projects. Please try again later.");
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   const createProject = useCallback(async (newProject: z.infer<typeof projectSchema>) => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/project`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(newProject),
//       });
//       if (!res.ok) {
//         throw new Error("Failed to create project.");
//       }
//       await fetchProjects();
//     } catch (err) {
//       console.error("Error creating project:", err);
//       setError("Failed to create project. Please try again.");
//     }
//   }, [fetchProjects]);

//   // Update to handle partial updates
//   const updateProject = useCallback(async (id: string, updatedProject: Partial<z.infer<typeof projectSchema>>) => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(updatedProject),
//       });
//       if (!res.ok) {
//         throw new Error("Failed to update project.");
//       }
//       await fetchProjects();
//     } catch (err) {
//       console.error("Error updating project:", err);
//       setError("Failed to update project. Please try again.");
//     }
//   }, [fetchProjects]);

//   const deleteProject = useCallback(async (id: string) => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/delete-project/${id}`, {
//         method: "DELETE",
//       });
//       if (!res.ok) {
//         throw new Error("Failed to delete project.");
//       }
//       await fetchProjects();
//     } catch (err) {
//       console.error("Error deleting project:", err);
//       setError("Failed to delete project. Please try again.");
//     }
//   }, [fetchProjects]);

//   // Initial fetch on mount
//   useEffect(() => {
//     fetchProjects();
//   }, [fetchProjects]);

//   return {
//     projects,
//     isLoading,
//     error,
//     createProject,
//     updateProject,
//     deleteProject,
//     fetchProjects,
//     refetch: fetchProjects
//   };
// };




// // frontend/app/hooks/use-projects.ts
// import { useState, useEffect } from "react";
// import { type ProjectEntry, projectSchema } from "@/lib/schema";
// import { z } from "zod";
// const API_BASE_URL = "http://localhost:5000/api-v1";

// export const useProjects = () => {
//   const [projects, setProjects] = useState<ProjectEntry[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const fetchProjects = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/all-projects`);
//       if (!res.ok) {
//         throw new Error("Failed to fetch projects.");
//       }
//       const data = await res.json();
//       setProjects(data);
//     } catch (err) {
//       console.error("Error fetching projects:", err);
//       setError("Failed to load projects. Please try again later.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const createProject = async (newProject: z.infer<typeof projectSchema>) => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/project`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(newProject),
//       });
//       if (!res.ok) {
//         throw new Error("Failed to create project.");
//       }
//       fetchProjects();
//     } catch (err) {
//       console.error("Error creating project:", err);
//       setError("Failed to create project. Please try again.");
//     }
//   };

//   // Update to handle partial updates
//   const updateProject = async (id: string, updatedProject: Partial<z.infer<typeof projectSchema>>) => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(updatedProject),
//       });
//       if (!res.ok) {
//         throw new Error("Failed to update project.");
//       }
//       fetchProjects();
//     } catch (err) {
//       console.error("Error updating project:", err);
//       setError("Failed to update project. Please try again.");
//     }
//   };

//   const deleteProject = async (id: string) => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/delete-project/${id}`, {
//         method: "DELETE",
//       });
//       if (!res.ok) {
//         throw new Error("Failed to delete project.");
//       }
//       fetchProjects();
//     } catch (err) {
//       console.error("Error deleting project:", err);
//       setError("Failed to delete project. Please try again.");
//     }
//   };

//   useEffect(() => {
//     fetchProjects();
//   }, []);

//   return {
//     projects,
//     isLoading,
//     error,
//     createProject,
//     updateProject,
//     deleteProject,
//     refetch: fetchProjects
//   };
// };








// // frontend/app/hooks/use-projects.ts
// import { useState, useEffect } from "react";
// import { type ProjectEntry, projectSchema } from "@/lib/schema";
// import { z } from "zod";

// const API_BASE_URL = "http://localhost:5000/api-v1";

// export const useProjects = () => {
//   const [projects, setProjects] = useState<ProjectEntry[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const fetchProjects = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/all-projects`);
//       if (!res.ok) {
//         throw new Error("Failed to fetch projects.");
//       }
//       const data = await res.json();
//       setProjects(data);
//     } catch (err) {
//       console.error("Error fetching projects:", err);
//       setError("Failed to load projects. Please try again later.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const createProject = async (newProject: z.infer<typeof projectSchema>) => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/project`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(newProject),
//       });
//       if (!res.ok) {
//         throw new Error("Failed to create project.");
//       }
//       fetchProjects();
//     } catch (err) {
//       console.error("Error creating project:", err);
//       setError("Failed to create project. Please try again.");
//     }
//   };

//   // Update to handle partial updates
//   const updateProject = async (id: string, updatedProject: Partial<z.infer<typeof projectSchema>>) => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(updatedProject),
//       });
//       if (!res.ok) {
//         throw new Error("Failed to update project.");
//       }
//       fetchProjects();
//     } catch (err) {
//       console.error("Error updating project:", err);
//       setError("Failed to update project. Please try again.");
//     }
//   };

//   const deleteProject = async (id: string) => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/delete-project/${id}`, {
//         method: "DELETE",
//       });
//       if (!res.ok) {
//         throw new Error("Failed to delete project.");
//       }
//       fetchProjects();
//     } catch (err) {
//       console.error("Error deleting project:", err);
//       setError("Failed to delete project. Please try again.");
//     }
//   };

//   useEffect(() => {
//     fetchProjects();
//   }, []);

//   return {
//     projects,
//     isLoading,
//     error,
//     createProject,
//     updateProject,
//     deleteProject,
//   };
// };

















// // frontend/app/hooks/use-projects.ts
// import { useState, useEffect } from "react";
// import { type ProjectEntry, projectSchema } from "@/lib/schema";
// import { z } from "zod";

// const API_BASE_URL = "http://localhost:5000/api-v1";

// export const useProjects = () => {
//   const [projects, setProjects] = useState<ProjectEntry[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const fetchProjects = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/all-projects`);
//       if (!res.ok) {
//         throw new Error("Failed to fetch projects.");
//       }
//       const data = await res.json();
//       setProjects(data);
//     } catch (err) {
//       console.error("Error fetching projects:", err);
//       setError("Failed to load projects. Please try again later.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const createProject = async (newProject: z.infer<typeof projectSchema>) => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/project`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(newProject),
//       });
//       if (!res.ok) {
//         throw new Error("Failed to create project.");
//       }
//       fetchProjects();
//     } catch (err) {
//       console.error("Error creating project:", err);
//       setError("Failed to create project. Please try again.");
//     }
//   };

//   const updateProject = async (id: string, updatedProject: z.infer<typeof projectSchema>) => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/update-project/${id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(updatedProject),
//       });
//       if (!res.ok) {
//         throw new Error("Failed to update project.");
//       }
//       fetchProjects();
//     } catch (err) {
//       console.error("Error updating project:", err);
//       setError("Failed to update project. Please try again.");
//     }
//   };

//   const deleteProject = async (id: string) => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/projects/delete-project/${id}`, {
//         method: "DELETE",
//       });
//       if (!res.ok) {
//         throw new Error("Failed to delete project.");
//       }
//       fetchProjects();
//     } catch (err) {
//       console.error("Error deleting project:", err);
//       setError("Failed to delete project. Please try again.");
//     }
//   };

//   useEffect(() => {
//     fetchProjects();
//   }, []);

//   return {
//     projects,
//     isLoading,
//     error,
//     createProject,
//     updateProject,
//     deleteProject,
//   };
// };










// import { useState, useEffect } from "react";
// import { type ProjectEntry, projectSchema } from "@/lib/schema";
// import { z } from "zod";

// const API_BASE_URL = "http://localhost:5000/api-v1/projects";

// export const useProjects = () => {
//   const [projects, setProjects] = useState<ProjectEntry[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const fetchProjects = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE_URL}/all-projects`);
//       if (!res.ok) {
//         throw new Error("Failed to fetch projects.");
//       }
//       const data = await res.json();
//       setProjects(data);
//     } catch (err) {
//       console.error("Error fetching projects:", err);
//       setError("Failed to load projects. Please try again later.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const createProject = async (newProject: z.infer<typeof projectSchema>) => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/project`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(newProject),
//       });
//       if (!res.ok) {
//         throw new Error("Failed to create project.");
//       }
//       fetchProjects();
//     } catch (err) {
//       console.error("Error creating project:", err);
//       setError("Failed to create project. Please try again.");
//     }
//   };

//   const updateProject = async (id: string, updatedProject: z.infer<typeof projectSchema>) => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/update-project/${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(updatedProject),
//       });
//       if (!res.ok) {
//         throw new Error("Failed to update project.");
//       }
//       fetchProjects();
//     } catch (err) {
//       console.error("Error updating project:", err);
//       setError("Failed to update project. Please try again.");
//     }
//   };

//   const deleteProject = async (id: string) => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/delete-project/${id}`, {
//         method: "DELETE",
//       });
//       if (!res.ok) {
//         throw new Error("Failed to delete project.");
//       }
//       fetchProjects();
//     } catch (err) {
//       console.error("Error deleting project:", err);
//       setError("Failed to delete project. Please try again.");
//     }
//   };

//   useEffect(() => {
//     fetchProjects();
//   }, []);

//   return {
//     projects,
//     isLoading,
//     error,
//     createProject,
//     updateProject,
//     deleteProject,
//   };
// };