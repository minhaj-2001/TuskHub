import { useState, useEffect } from "react";
import { type EmailEntry, emailSchema } from "@/lib/schema"; // Import schema and type
import { z } from "zod";

const API_BASE_URL = "http://localhost:5000/api-v1/emails";

// A custom hook to manage all email-related data and logic
export const useEmails = () => {
  const [emails, setEmails] = useState<EmailEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Function to fetch all emails from the backend
  const fetchEmails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/all-emails`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch emails.");
      }
      const data = await res.json();
      setEmails(data);
    } catch (err) {
      console.error("Error fetching emails:", err);
      setError("Failed to load emails. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to add a new email
  const addEmail = async (newEmail: z.infer<typeof emailSchema>) => {
    try {
      const res = await fetch(`${API_BASE_URL}/add-email`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newEmail),
      });
      if (!res.ok) {
        throw new Error("Failed to add email.");
      }
      // Re-fetch the email list to update the UI
      fetchEmails();
    } catch (err) {
      console.error("Error adding email:", err);
      setError("Failed to add email. Please try again.");
    }
  };
  
  // Function to update an existing email
  const updateEmail = async (id: string, updatedEmail: z.infer<typeof emailSchema>) => {
    try {
      const res = await fetch(`${API_BASE_URL}/update-email/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updatedEmail),
      });
      if (!res.ok) {
        throw new Error("Failed to update email.");
      }
      fetchEmails();
    } catch (err) {
      console.error("Error updating email:", err);
      setError("Failed to update email. Please try again.");
    }
  };
  
  // Function to delete an email
  const deleteEmail = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/delete-email/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to delete email.");
      }
      fetchEmails();
    } catch (err) {
      console.error("Error deleting email:", err);
      setError("Failed to delete email. Please try again.");
    }
  };
  
  // Fetch emails on initial render
  useEffect(() => {
    fetchEmails();
  }, []);
  
  return {
    emails,
    isLoading,
    error,
    fetchEmails,
    addEmail,
    updateEmail,
    deleteEmail,
  };
};















// import { useState, useEffect } from "react";
// import { type EmailEntry, emailSchema } from "@/lib/schema"; // Import schema and type
// import { z } from "zod";

// const API_BASE_URL = "http://localhost:5000/api-v1/emails";

// // A custom hook to manage all email-related data and logic
// export const useEmails = () => {
//   const [emails, setEmails] = useState<EmailEntry[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // Function to fetch all emails from the backend
//   const fetchEmails = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE_URL}/all-emails`);
//       if (!res.ok) {
//         throw new Error("Failed to fetch emails.");
//       }
//       const data = await res.json();
//       setEmails(data);
//     } catch (err) {
//       console.error("Error fetching emails:", err);
//       setError("Failed to load emails. Please try again later.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Function to add a new email
//   const addEmail = async (newEmail: z.infer<typeof emailSchema>) => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/add-email`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(newEmail),
//       });
//       if (!res.ok) {
//         throw new Error("Failed to add email.");
//       }
//       // Re-fetch the email list to update the UI
//       fetchEmails();
//     } catch (err) {
//       console.error("Error adding email:", err);
//       setError("Failed to add email. Please try again.");
//     }
//   };

//   // Function to update an existing email
//   const updateEmail = async (id: string, updatedEmail: z.infer<typeof emailSchema>) => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/update-email/${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(updatedEmail),
//       });
//       if (!res.ok) {
//         throw new Error("Failed to update email.");
//       }
//       fetchEmails();
//     } catch (err) {
//       console.error("Error updating email:", err);
//       setError("Failed to update email. Please try again.");
//     }
//   };

//   // Function to delete an email
//   const deleteEmail = async (id: string) => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/delete-email/${id}`, {
//         method: "DELETE",
//       });
//       if (!res.ok) {
//         throw new Error("Failed to delete email.");
//       }
//       fetchEmails();
//     } catch (err) {
//       console.error("Error deleting email:", err);
//       setError("Failed to delete email. Please try again.");
//     }
//   };

//   // Fetch emails on initial render
//   useEffect(() => {
//     fetchEmails();
//   }, []);

//   return {
//     emails,
//     isLoading,
//     error,
//     fetchEmails,
//     addEmail,
//     updateEmail,
//     deleteEmail,
//   };
// };
