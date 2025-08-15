"use client";
import React, { useState } from "react";
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
import { TriangleAlert, Trash2, Pencil, Plus } from "lucide-react";
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
import { useEmails } from "@/hooks/use-emails";
import { useAuth } from "@/provider/auth-context";
import { emailSchema, type EmailEntry } from "@/lib/schema";
import { z } from "zod";
import { SearchBar } from "@/components/ui/search-bar";

const EmailManagement = () => {
  const { user } = useAuth();
  const { emails, isLoading, error, addEmail, updateEmail, deleteEmail } = useEmails();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [emailToDelete, setEmailToDelete] = useState<string | null>(null);
  const [currentEmail, setCurrentEmail] = useState<EmailEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Determine if user can edit emails
  const canEditEmails = user?.role === "manager";
  
  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      name: "",
      email: "",
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
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold">
          {canEditEmails ? "Email Management" : "Emails"}
        </h3>
        {canEditEmails && (
          <Button onClick={handleAddClick} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Email
          </Button>
        )}
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
