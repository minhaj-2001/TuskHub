import { useState, useEffect } from "react";
import { type ProjectStageEntry } from "@/lib/schema";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api-v1";

export const useProjectStages = () => {
  const [projectStages, setProjectStages] = useState<ProjectStageEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectStages = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First, fetch all projects
      const projectsRes = await fetch(`${API_BASE_URL}/projects/all-projects`);
      if (!projectsRes.ok) throw new Error("Failed to fetch projects");
      const projects = await projectsRes.json();
      
      // Then, for each project, fetch its stages
      const allProjectStages: ProjectStageEntry[] = [];
      
      for (const project of projects) {
        try {
          const projectRes = await fetch(`${API_BASE_URL}/projects/${project._id}`);
          if (projectRes.ok) {
            const projectData = await projectRes.json();
            if (projectData.stages && Array.isArray(projectData.stages)) {
              allProjectStages.push(...projectData.stages);
            }
          }
        } catch (err) {
          console.error(`Error fetching stages for project ${project._id}:`, err);
          // Continue with other projects even if one fails
        }
      }
      
      setProjectStages(allProjectStages);
    } catch (err) {
      console.error("Error fetching project stages:", err);
      setError("Failed to load project stages. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectStages();
  }, []);

  return {
    projectStages,
    isLoading,
    error,
    refetch: fetchProjectStages
  };
};