// frontend/app/hooks/useCustomProjectStages.ts
import { useState, useEffect } from "react";
import { type ProjectStageEntry } from "@/lib/schema";

const API_BASE_URL = "http://localhost:5000/api-v1";

export const useCustomProjectStages = (projectId: string | null) => {
  const [customStages, setCustomStages] = useState<ProjectStageEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomStages = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/custom-project-stages/project/${projectId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch custom stages.");
      }
      const data = await res.json();
      setCustomStages(data.customStages || []);
    } catch (err) {
      console.error("Error fetching custom stages:", err);
      setError("Failed to load custom stages. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const createCustomStage = async (customStageData: {
    stage_name: string;
    description?: string;
    project: string;
  }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/custom-project-stages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(customStageData),
      });
      if (!res.ok) {
        throw new Error("Failed to create custom stage.");
      }
      await fetchCustomStages();
      return true;
    } catch (err) {
      console.error("Error creating custom stage:", err);
      setError("Failed to create custom stage. Please try again.");
      return false;
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchCustomStages();
    }
  }, [projectId]);

  return {
    customStages,
    isLoading,
    error,
    createCustomStage,
    refetch: fetchCustomStages
  };
};