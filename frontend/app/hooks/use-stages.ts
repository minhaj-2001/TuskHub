import { useState, useEffect } from "react";
import { type StageEntry, stageSchema } from "@/lib/schema";
import { z } from "zod";

const API_BASE_URL = "http://localhost:5000/api-v1";

export const useStages = () => {
  const [stages, setStages] = useState<StageEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchStages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/stages/all-stages`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch stages.");
      }
      const data = await res.json();
      setStages(data);
    } catch (err) {
      console.error("Error fetching stages:", err);
      setError("Failed to load stages. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const addStage = async (newStage: z.infer<typeof stageSchema>) => {
    try {
      const res = await fetch(`${API_BASE_URL}/stages/add-stage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newStage),
      });
      if (!res.ok) {
        throw new Error("Failed to create stage.");
      }
      fetchStages();
      return true;
    } catch (err) {
      console.error("Error creating stage:", err);
      setError("Failed to create stage. Please try again.");
      return false;
    }
  };
  
  const updateStage = async (id: string, updatedStage: z.infer<typeof stageSchema>) => {
    try {
      const res = await fetch(`${API_BASE_URL}/stages/update-stage/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updatedStage),
      });
      if (!res.ok) {
        throw new Error("Failed to update stage.");
      }
      fetchStages();
      return true;
    } catch (err) {
      console.error("Error updating stage:", err);
      setError("Failed to update stage. Please try again.");
      return false;
    }
  };
  
  const deleteStage = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/stages/delete-stage/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to delete stage.");
      }
      fetchStages();
      return true;
    } catch (err) {
      console.error("Error deleting stage:", err);
      setError("Failed to delete stage. Please try again.");
      return false;
    }
  };
  
  useEffect(() => {
    fetchStages();
  }, []);
  
  return {
    stages,
    isLoading,
    error,
    addStage,
    updateStage,
    deleteStage,
    refetch: fetchStages
  };
};









// // frontend/app/hooks/useStages.ts
// import { useState, useEffect } from "react";
// import { type StageEntry, stageSchema } from "@/lib/schema";
// import { z } from "zod";

// const API_BASE_URL = "http://localhost:5000/api-v1";

// export const useStages = () => {
//   const [stages, setStages] = useState<StageEntry[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const fetchStages = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE_URL}/stages/all-stages`);
//       if (!res.ok) {
//         throw new Error("Failed to fetch stages.");
//       }
//       const data = await res.json();
//       setStages(data);
//     } catch (err) {
//       console.error("Error fetching stages:", err);
//       setError("Failed to load stages. Please try again later.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const addStage = async (newStage: z.infer<typeof stageSchema>) => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/stages/add-stage`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(newStage),
//       });
//       if (!res.ok) {
//         throw new Error("Failed to create stage.");
//       }
//       fetchStages();
//       return true;
//     } catch (err) {
//       console.error("Error creating stage:", err);
//       setError("Failed to create stage. Please try again.");
//       return false;
//     }
//   };

//   const updateStage = async (id: string, updatedStage: z.infer<typeof stageSchema>) => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/stages/update-stage/${id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(updatedStage),
//       });
//       if (!res.ok) {
//         throw new Error("Failed to update stage.");
//       }
//       fetchStages();
//       return true;
//     } catch (err) {
//       console.error("Error updating stage:", err);
//       setError("Failed to update stage. Please try again.");
//       return false;
//     }
//   };

//   const deleteStage = async (id: string) => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/stages/delete-stage/${id}`, {
//         method: "DELETE",
//       });
//       if (!res.ok) {
//         throw new Error("Failed to delete stage.");
//       }
//       fetchStages();
//       return true;
//     } catch (err) {
//       console.error("Error deleting stage:", err);
//       setError("Failed to delete stage. Please try again.");
//       return false;
//     }
//   };

//   useEffect(() => {
//     fetchStages();
//   }, []);

//   return {
//     stages,
//     isLoading,
//     error,
//     addStage,
//     updateStage,
//     deleteStage,
//     refetch: fetchStages
//   };
// };