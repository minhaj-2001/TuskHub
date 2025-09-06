// frontend/app/component/email-management.tsx
"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "@/components/loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert, Trash2, Pencil, Plus, Share } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useEmails } from "@/hooks/use-emails";
import { useAuth } from "@/provider/auth-context";
import { emailSchema, type EmailEntry } from "@/lib/schema";
import { z } from "zod";
import { SearchBar } from "@/components/ui/search-bar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postData, fetchData } from "@/lib/fetch-util";
import { toast } from "sonner";
import type { ProjectEntry } from "@/lib/schema";

const EmailManagement = () => {
  const { user } = useAuth();
  const { emails, isLoading, error, addEmail, updateEmail, deleteEmail } = useEmails();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [emailToDelete, setEmailToDelete] = useState<string | null>(null);
  const [currentEmail, setCurrentEmail] = useState<EmailEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [projects, setProjects] = useState<ProjectEntry[]>([]);
  const [projectsLoading, setProjectsLoading] = useState<boolean>(false);
  
  const queryClient = useQueryClient();
  
  // Determine if user can edit emails
  const canEditEmails = user?.role === "manager";
  
  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });
  
  // Mutation for sharing project details
// In the shareProjectMutation in the EmailManagement component

const shareProjectMutation = useMutation({
  mutationFn: (data: { projectId: string; emailIds: string[] }) => 
    postData('/emails/share-project', data),
  onSuccess: () => {
    toast.success("Project details shared successfully");
    setShowShareDialog(false);
    setSelectedEmails([]);
    setSelectedProjectId('');
  },
  onError: (error: any) => {
    console.error("Share project error:", error);
    const errorMessage = error.response?.data?.message || error.message || "Failed to share project details";
    toast.error(errorMessage);
  },
});
  
  // Filter emails based on search term
  const filteredEmails = React.useMemo(() => {
    if (!searchTerm) return emails;
    
    const term = searchTerm.toLowerCase();
    return emails.filter(email => 
      email.name.toLowerCase().includes(term) ||
      email.email.toLowerCase().includes(term)
    );
  }, [emails, searchTerm]);
  
  // Fetch projects for sharing dialog
  const fetchProjects = async () => {
    if (!canEditEmails) return;
    
    setProjectsLoading(true);
    try {
      const projectsData = await fetchData<ProjectEntry[]>('/projects/all-projects');
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error("Failed to fetch projects");
    } finally {
      setProjectsLoading(false);
    }
  };
  
  // Load projects when the share dialog is opened
  React.useEffect(() => {
    if (showShareDialog && canEditEmails) {
      fetchProjects();
    }
  }, [showShareDialog, canEditEmails]);
  
  const handleAddClick = () => {
    // Only managers can add emails
    if (!canEditEmails) {
      alert("Only managers can add emails");
      return;
    }
    
    setCurrentEmail(null);
    form.reset({ name: "", email: "" });
    setShowModal(true);
  };
  
  const handleEditClick = (email: EmailEntry) => {
    // Only managers can edit emails
    if (!canEditEmails) {
      alert("Only managers can edit emails");
      return;
    }
    
    setCurrentEmail(email);
    form.reset({ name: email.name, email: email.email });
    setShowModal(true);
  };
  
  const handleDeleteClick = (_id: string) => {
    // Only managers can delete emails
    if (!canEditEmails) {
      alert("Only managers can delete emails");
      return;
    }
    
    setEmailToDelete(_id);
    setShowDeleteDialog(true);
  };
  
  const handleConfirmDelete = async () => {
    if (emailToDelete) {
      await deleteEmail(emailToDelete);
    }
    setShowDeleteDialog(false);
    setEmailToDelete(null);
  };
  
  const handleSubmit = async (values: z.infer<typeof emailSchema>) => {
    if (currentEmail) {
      // Editing an existing email
      await updateEmail(currentEmail._id, values);
    } else {
      // Adding a new email
      // Check for duplicate emails on the frontend
      const isDuplicate = emails.some(entry => entry.email === values.email);
      if (isDuplicate) {
        // Use setError to display the error message on the email field
        form.setError("email", {
          type: "manual",
          message: "This email is already added.",
        });
        return; // Stop the function here
      }
      await addEmail(values);
    }
    setShowModal(false);
  };
  
  const handleShareClick = () => {
    if (!canEditEmails) {
      alert("Only managers can share project details");
      return;
    }
    
    if (emails.length === 0) {
      alert("Please add email addresses first");
      return;
    }
    
    setShowShareDialog(true);
  };
  
  const handleEmailSelection = (emailId: string, checked: boolean) => {
    if (checked) {
      setSelectedEmails([...selectedEmails, emailId]);
    } else {
      setSelectedEmails(selectedEmails.filter(id => id !== emailId));
    }
  };
  
  const handleSelectAllEmails = (checked: boolean) => {
    if (checked) {
      setSelectedEmails(emails.map(email => email._id));
    } else {
      setSelectedEmails([]);
    }
  };
  
  const handleShareProject = () => {
    if (!selectedProjectId) {
      alert("Please select a project");
      return;
    }
    
    if (selectedEmails.length === 0) {
      alert("Please select at least one email address");
      return;
    }
    
    shareProjectMutation.mutate({
      projectId: selectedProjectId,
      emailIds: selectedEmails
    });
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold">
          {canEditEmails ? "Email Management" : "Emails"}
        </h3>
        <div className="flex gap-2">
          {canEditEmails && (
            <>
              <Button onClick={handleShareClick} className="flex items-center gap-2">
                <Share className="h-4 w-4" />
                Share Project
              </Button>
              <Button onClick={handleAddClick} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Email
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Search Input using the reusable SearchBar component */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <SearchBar 
          placeholder="Search emails..." 
          value={searchTerm} 
          onChange={setSearchTerm} 
        />
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {isLoading ? (
        <Loader />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                {canEditEmails && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmails.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canEditEmails ? 4 : 3} className="text-center">
                    No emails found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmails.map((entry, index) => (
                  <TableRow key={entry._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{entry.name}</TableCell>
                    <TableCell>{entry.email}</TableCell>
                    {canEditEmails && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-yellow-500 hover:text-yellow-700"
                          onClick={() => handleEditClick(entry)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 ml-2"
                          onClick={() => handleDeleteClick(entry._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Modal for Adding & Editing Emails - Only for Managers */}
      {canEditEmails && (
        <>
          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {currentEmail ? "Edit Email" : "Add Email"}
                </DialogTitle>
                <DialogDescription>
                  {currentEmail 
                    ? "Update the email details below."
                    : "Fill in the details to add a new email."
                  }
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter Email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter className="mt-4">
                    <Button type="submit">
                      {currentEmail ? "Update Email" : "Add Email"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          {/* Custom Confirmation Dialog for Deleting */}
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the email entry.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmDelete}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          {/* Share Project Dialog */}
          <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Share Project Details</DialogTitle>
                <DialogDescription>
                  Select a project and email addresses to share the project details as a PDF attachment.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Select Project</label>
                  {projectsLoading ? (
                    <div className="flex items-center justify-center h-10 mt-1">
                      <Loader className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    <select 
                      className="w-full mt-1 p-2 border rounded-md"
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                    >
                      <option value="">Select a project</option>
                      {projects.map(project => (
                        <option key={project._id} value={project._id}>
                          {project.project_name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      id="selectAll"
                      checked={selectedEmails.length === emails.length && emails.length > 0}
                      onCheckedChange={handleSelectAllEmails}
                    />
                    <label htmlFor="selectAll" className="text-sm font-medium">
                      Select All Emails
                    </label>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                    {emails.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        No email addresses available
                      </div>
                    ) : (
                      emails.map(email => (
                        <div key={email._id} className="flex items-center space-x-2 py-1">
                          <Checkbox
                            id={`email-${email._id}`}
                            checked={selectedEmails.includes(email._id)}
                            onCheckedChange={(checked) => handleEmailSelection(email._id, checked as boolean)}
                          />
                          <label htmlFor={`email-${email._id}`} className="text-sm">
                            {email.name} ({email.email})
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                {selectedEmails.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedEmails.map(emailId => {
                      const email = emails.find(e => e._id === emailId);
                      return (
                        <Badge key={emailId} variant="secondary" className="text-xs">
                          {email?.name}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleShareProject}
                  disabled={shareProjectMutation.isPending || !selectedProjectId || selectedEmails.length === 0}
                >
                  {shareProjectMutation.isPending ? "Sharing..." : "Share Project"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default EmailManagement;










// "use client";
// import React, { useState } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Loader } from "@/components/loader";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { TriangleAlert, Trash2, Pencil, Plus } from "lucide-react";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { useEmails } from "@/hooks/use-emails";
// import { useAuth } from "@/provider/auth-context";
// import { emailSchema, type EmailEntry } from "@/lib/schema";
// import { z } from "zod";
// import { SearchBar } from "@/components/ui/search-bar";

// const EmailManagement = () => {
//   const { user } = useAuth();
//   const { emails, isLoading, error, addEmail, updateEmail, deleteEmail } = useEmails();
//   const [showModal, setShowModal] = useState(false);
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
//   const [emailToDelete, setEmailToDelete] = useState<string | null>(null);
//   const [currentEmail, setCurrentEmail] = useState<EmailEntry | null>(null);
//   const [searchTerm, setSearchTerm] = useState<string>('');
  
//   // Determine if user can edit emails
//   const canEditEmails = user?.role === "manager";
  
//   const form = useForm<z.infer<typeof emailSchema>>({
//     resolver: zodResolver(emailSchema),
//     defaultValues: {
//       name: "",
//       email: "",
//     },
//   });
  
//   // Filter emails based on search term
//   const filteredEmails = React.useMemo(() => {
//     if (!searchTerm) return emails;
    
//     const term = searchTerm.toLowerCase();
//     return emails.filter(email => 
//       email.name.toLowerCase().includes(term) ||
//       email.email.toLowerCase().includes(term)
//     );
//   }, [emails, searchTerm]);
  
//   const handleAddClick = () => {
//     // Only managers can add emails
//     if (!canEditEmails) {
//       alert("Only managers can add emails");
//       return;
//     }
    
//     setCurrentEmail(null);
//     form.reset({ name: "", email: "" });
//     setShowModal(true);
//   };
  
//   const handleEditClick = (email: EmailEntry) => {
//     // Only managers can edit emails
//     if (!canEditEmails) {
//       alert("Only managers can edit emails");
//       return;
//     }
    
//     setCurrentEmail(email);
//     form.reset({ name: email.name, email: email.email });
//     setShowModal(true);
//   };
  
//   const handleDeleteClick = (_id: string) => {
//     // Only managers can delete emails
//     if (!canEditEmails) {
//       alert("Only managers can delete emails");
//       return;
//     }
    
//     setEmailToDelete(_id);
//     setShowDeleteDialog(true);
//   };
  
//   const handleConfirmDelete = async () => {
//     if (emailToDelete) {
//       await deleteEmail(emailToDelete);
//     }
//     setShowDeleteDialog(false);
//     setEmailToDelete(null);
//   };
  
//   const handleSubmit = async (values: z.infer<typeof emailSchema>) => {
//     if (currentEmail) {
//       // Editing an existing email
//       await updateEmail(currentEmail._id, values);
//     } else {
//       // Adding a new email
//       // Check for duplicate emails on the frontend
//       const isDuplicate = emails.some(entry => entry.email === values.email);
//       if (isDuplicate) {
//         // Use setError to display the error message on the email field
//         form.setError("email", {
//           type: "manual",
//           message: "This email is already added.",
//         });
//         return; // Stop the function here
//       }
//       await addEmail(values);
//     }
//     setShowModal(false);
//   };
  
//   return (
//     <div className="container mx-auto p-4">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-2xl font-bold">
//           {canEditEmails ? "Email Management" : "Emails"}
//         </h3>
//         {canEditEmails && (
//           <Button onClick={handleAddClick} className="flex items-center gap-2">
//             <Plus className="h-4 w-4" /> Add Email
//           </Button>
//         )}
//       </div>
      
//       {/* Search Input using the reusable SearchBar component */}
//       <div className="mb-4 p-3 bg-gray-50 rounded-lg">
//         <SearchBar 
//           placeholder="Search emails..." 
//           value={searchTerm} 
//           onChange={setSearchTerm} 
//         />
//       </div>
      
//       {error && (
//         <Alert variant="destructive" className="mb-4">
//           <TriangleAlert className="h-4 w-4" />
//           <AlertTitle>Error</AlertTitle>
//           <AlertDescription>{error}</AlertDescription>
//         </Alert>
//       )}
      
//       {isLoading ? (
//         <Loader />
//       ) : (
//         <div className="rounded-md border">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="w-[50px]">#</TableHead>
//                 <TableHead>Name</TableHead>
//                 <TableHead>Email</TableHead>
//                 {canEditEmails && <TableHead className="text-right">Actions</TableHead>}
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filteredEmails.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={canEditEmails ? 4 : 3} className="text-center">
//                     No emails found.
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 filteredEmails.map((entry, index) => (
//                   <TableRow key={entry._id}>
//                     <TableCell>{index + 1}</TableCell>
//                     <TableCell>{entry.name}</TableCell>
//                     <TableCell>{entry.email}</TableCell>
//                     {canEditEmails && (
//                       <TableCell className="text-right">
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           className="text-yellow-500 hover:text-yellow-700"
//                           onClick={() => handleEditClick(entry)}
//                         >
//                           <Pencil className="h-4 w-4" />
//                         </Button>
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           className="text-red-500 hover:text-red-700 ml-2"
//                           onClick={() => handleDeleteClick(entry._id)}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </TableCell>
//                     )}
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       )}
      
//       {/* Modal for Adding & Editing Emails - Only for Managers */}
//       {canEditEmails && (
//         <>
//           <Dialog open={showModal} onOpenChange={setShowModal}>
//             <DialogContent className="sm:max-w-[425px]">
//               <DialogHeader>
//                 <DialogTitle>
//                   {currentEmail ? "Edit Email" : "Add Email"}
//                 </DialogTitle>
//                 <DialogDescription>
//                   {currentEmail 
//                     ? "Update the email details below."
//                     : "Fill in the details to add a new email."
//                   }
//                 </DialogDescription>
//               </DialogHeader>
//               <Form {...form}>
//                 <form onSubmit={form.handleSubmit(handleSubmit)}>
//                   <FormField
//                     control={form.control}
//                     name="name"
//                     render={({ field }) => (
//                       <FormItem className="mb-4">
//                         <FormLabel>Name</FormLabel>
//                         <FormControl>
//                           <Input placeholder="Enter Name" {...field} />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="email"
//                     render={({ field }) => (
//                       <FormItem className="mb-4">
//                         <FormLabel>Email</FormLabel>
//                         <FormControl>
//                           <Input type="email" placeholder="Enter Email" {...field} />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <DialogFooter className="mt-4">
//                     <Button type="submit">
//                       {currentEmail ? "Update Email" : "Add Email"}
//                     </Button>
//                   </DialogFooter>
//                 </form>
//               </Form>
//             </DialogContent>
//           </Dialog>
          
//           {/* Custom Confirmation Dialog for Deleting */}
//           <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
//             <AlertDialogContent>
//               <AlertDialogHeader>
//                 <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//                 <AlertDialogDescription>
//                   This action cannot be undone. This will permanently delete the email entry.
//                 </AlertDialogDescription>
//               </AlertDialogHeader>
//               <AlertDialogFooter>
//                 <AlertDialogCancel>Cancel</AlertDialogCancel>
//                 <AlertDialogAction onClick={handleConfirmDelete}>Continue</AlertDialogAction>
//               </AlertDialogFooter>
//             </AlertDialogContent>
//           </AlertDialog>
//         </>
//       )}
//     </div>
//   );
// };
// export default EmailManagement;










// "use client";

// import React, { useState } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Loader } from "@/components/loader";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { TriangleAlert, Trash2, Pencil, Plus } from "lucide-react";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// // Update the import path to the correct location of use-emails.ts
// import { useEmails } from "@/hooks/use-emails";
// import { emailSchema, type EmailEntry } from "@/lib/schema";
// import { z } from "zod";

// const EmailManagement = () => {
//   const { emails, isLoading, error, addEmail, updateEmail, deleteEmail } = useEmails();

//   const [showModal, setShowModal] = useState(false);
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
//   const [emailToDelete, setEmailToDelete] = useState<string | null>(null);
//   const [currentEmail, setCurrentEmail] = useState<EmailEntry | null>(null);

//   const form = useForm<z.infer<typeof emailSchema>>({
//     resolver: zodResolver(emailSchema),
//     defaultValues: {
//       name: "",
//       email: "",
//     },
//   });

//   const handleAddClick = () => {
//     setCurrentEmail(null);
//     form.reset({ name: "", email: "" });
//     setShowModal(true);
//   };

//   const handleEditClick = (email: EmailEntry) => {
//     setCurrentEmail(email);
//     form.reset({ name: email.name, email: email.email });
//     setShowModal(true);
//   };

//   const handleDeleteClick = (_id: string) => {
//     setEmailToDelete(_id);
//     setShowDeleteDialog(true);
//   };

//   const handleConfirmDelete = async () => {
//     if (emailToDelete) {
//       await deleteEmail(emailToDelete);
//     }
//     setShowDeleteDialog(false);
//     setEmailToDelete(null);
//   };

//   const handleSubmit = async (values: z.infer<typeof emailSchema>) => {
//     if (currentEmail) {
//       // Editing an existing email
//       await updateEmail(currentEmail._id, values);
//     } else {
//       // Adding a new email
//       // Check for duplicate emails on the frontend
//       const isDuplicate = emails.some(entry => entry.email === values.email);

//       if (isDuplicate) {
//         // Use setError to display the error message on the email field
//         form.setError("email", {
//           type: "manual",
//           message: "This email is already added.",
//         });
//         return; // Stop the function here
//       }

//       await addEmail(values);
//     }
//     setShowModal(false);
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-2xl font-bold">Email Management</h3>
//         <Button onClick={handleAddClick} className="flex items-center gap-2">
//           <Plus className="h-4 w-4" /> Add Email
//         </Button>
//       </div>

//       {error && (
//         <Alert variant="destructive" className="mb-4">
//           <TriangleAlert className="h-4 w-4" />
//           <AlertTitle>Error</AlertTitle>
//           <AlertDescription>{error}</AlertDescription>
//         </Alert>
//       )}

//       {isLoading ? (
//         <Loader />
//       ) : (
//         <div className="rounded-md border">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="w-[50px]">#</TableHead>
//                 <TableHead>Name</TableHead>
//                 <TableHead>Email</TableHead>
//                 <TableHead className="text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {emails.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={4} className="text-center">
//                     No emails found.
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 emails.map((entry, index) => (
//                   <TableRow key={entry._id}>
//                     <TableCell>{index + 1}</TableCell>
//                     <TableCell>{entry.name}</TableCell>
//                     <TableCell>{entry.email}</TableCell>
//                     <TableCell className="text-right">
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         className="text-yellow-500 hover:text-yellow-700"
//                         onClick={() => handleEditClick(entry)}
//                       >
//                         <Pencil className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         className="text-red-500 hover:text-red-700 ml-2"
//                         onClick={() => handleDeleteClick(entry._id)}
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       )}

//       {/* Modal for Adding & Editing Emails */}
//       <Dialog open={showModal} onOpenChange={setShowModal}>
//         <DialogContent className="sm:max-w-[425px]">
//           <DialogHeader>
//             <DialogTitle>
//               {currentEmail ? "Edit Email" : "Add Email"}
//             </DialogTitle>
//           </DialogHeader>
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(handleSubmit)}>
//               <FormField
//                 control={form.control}
//                 name="name"
//                 render={({ field }) => (
//                   <FormItem className="mb-4">
//                     <FormLabel>Name</FormLabel>
//                     <FormControl>
//                       <Input placeholder="Enter Name" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="email"
//                 render={({ field }) => (
//                   <FormItem className="mb-4">
//                     <FormLabel>Email</FormLabel>
//                     <FormControl>
//                       <Input type="email" placeholder="Enter Email" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <DialogFooter className="mt-4">
//                 <Button type="submit">
//                   {currentEmail ? "Update Email" : "Add Email"}
//                 </Button>
//               </DialogFooter>
//             </form>
//           </Form>
//         </DialogContent>
//       </Dialog>
      
//       {/* Custom Confirmation Dialog for Deleting */}
//       <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This action cannot be undone. This will permanently delete the email entry.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={handleConfirmDelete}>Continue</AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// };

// export default EmailManagement;
