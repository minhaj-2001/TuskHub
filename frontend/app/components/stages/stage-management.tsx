// frontend/app/component/stages/stage-management.tsx
"use client";
import React, { useState, useMemo } from "react";
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
import { Textarea } from "@/components/ui/textarea";
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
import { useStages } from "@/hooks/use-stages";
import { useAuth } from "@/provider/auth-context";
import { stageSchema, type StageEntry } from "@/lib/schema";
import { z } from "zod";
import { SearchBar } from "@/components/ui/search-bar";

const StageManagement = () => {
  const { user } = useAuth();
  const { stages, isLoading, error, addStage, updateStage, deleteStage } = useStages();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [stageToDelete, setStageToDelete] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<StageEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Determine if user can edit stages
  const canEditStages = user?.role === "manager";
  
  // Create form instance
  const form = useForm<z.infer<typeof stageSchema>>({
    resolver: zodResolver(stageSchema),
    defaultValues: {
      stage_name: "",
      description: "",
    },
  });
  
  // Filter stages based on search term
  const filteredStages = useMemo(() => {
    if (!searchTerm) return stages;
    
    const term = searchTerm.toLowerCase();
    return stages.filter(stage => 
      stage.stage_name.toLowerCase().includes(term) ||
      (stage.description && stage.description.toLowerCase().includes(term))
    );
  }, [stages, searchTerm]);
  
  const handleAddClick = () => {
    // Only managers can create stages
    if (!canEditStages) {
      alert("Only managers can create stages");
      return;
    }
    
    setCurrentStage(null);
    form.reset({ stage_name: "", description: "" }); // Reset form
    setShowModal(true);
  };
  
  const handleEditClick = (stage: StageEntry) => {
    // Only managers can edit stages
    if (!canEditStages) {
      alert("Only managers can edit stages");
      return;
    }
    
    setCurrentStage(stage);
    form.reset({ 
      stage_name: stage.stage_name, 
      description: stage.description || ""
    }); // Reset form with stage data
    setShowModal(true);
  };
  
  const handleDeleteClick = (_id: string) => {
    // Only managers can delete stages
    if (!canEditStages) {
      alert("Only managers can delete stages");
      return;
    }
    
    setStageToDelete(_id);
    setShowDeleteDialog(true);
  };
  
  const handleConfirmDelete = async () => {
    if (stageToDelete) {
      await deleteStage(stageToDelete);
    }
    setShowDeleteDialog(false);
    setStageToDelete(null);
  };
  
  const handleSubmit = async (values: z.infer<typeof stageSchema>) => {
    if (currentStage) {
      // Editing an existing stage
      await updateStage(currentStage._id, values);
    } else {
      // Adding a new stage
      await addStage(values);
    }
    setShowModal(false);
  };
  
  return (
    <div className="container mx-auto p-4 pt-0">
      {/* Header with no bottom margin */}
      <div className="flex items-center justify-between mb-0">
        <h3 className="text-xl font-bold">
          {canEditStages ? "Stage Management" : "Stages"}
        </h3>
        {canEditStages && (
          <Button onClick={handleAddClick} className="flex items-center gap-1 text-sm py-1 h-8">
            <Plus className="h-3 w-3" /> Add Stage
          </Button>
        )}
      </div>
      
      {/* Search Input using the reusable SearchBar component */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <SearchBar
          placeholder="Search stages by name or description..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-2">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Scrollable table container */}
      <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
        {isLoading ? (
          <Loader />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead className="w-[200px]">Stage Name</TableHead>
                  <TableHead className="w-[300px]">Description</TableHead>
                  {canEditStages && <TableHead className="w-[100px] text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canEditStages ? 4 : 3} className="text-center h-32">
                      {stages.length === 0 ? "No stages found." : "No stages match your search."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStages.map((stage, index) => (
                    <TableRow key={stage._id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="whitespace-normal break-words" title={stage.stage_name}>
                        {stage.stage_name}
                      </TableCell>
                      <TableCell className="whitespace-normal break-words" title={stage.description}>
                        {stage.description}
                      </TableCell>
                      {canEditStages && (
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-yellow-500 hover:text-yellow-700"
                            onClick={() => handleEditClick(stage)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 ml-2"
                            onClick={() => handleDeleteClick(stage._id)}
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
      </div>
      
      {/* Modal for Adding & Editing Stages - Only for Managers */}
      {canEditStages && (
        <>
          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {currentStage ? "Edit Stage" : "Add Stage"}
                </DialogTitle>
                <DialogDescription>
                  {currentStage 
                    ? "Update the stage details below." 
                    : "Fill in the details to create a new stage."
                  }
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                  <FormField
                    control={form.control}
                    name="stage_name"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Stage Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Stage Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter Stage Description" 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter className="mt-4">
                    <Button type="submit">
                      {currentStage ? "Update Stage" : "Add Stage"}
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
                  This action cannot be undone. This will permanently delete the stage.
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

export default StageManagement;



// "use client";
// import React, { useState, useMemo } from "react";
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
// import { Textarea } from "@/components/ui/textarea";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Loader } from "@/components/loader";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { TriangleAlert, Trash2, Pencil, Plus, Search } from "lucide-react";
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
// import { useStages } from "@/hooks/use-stages";
// import { stageSchema, type StageEntry } from "@/lib/schema";
// import { z } from "zod";

// const StageManagement = () => {
//   const { stages, isLoading, error, addStage, updateStage, deleteStage } = useStages();
//   const [showModal, setShowModal] = useState(false);
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
//   const [stageToDelete, setStageToDelete] = useState<string | null>(null);
//   const [currentStage, setCurrentStage] = useState<StageEntry | null>(null);
//   const [searchTerm, setSearchTerm] = useState<string>('');

//   const form = useForm<z.infer<typeof stageSchema>>({
//     resolver: zodResolver(stageSchema),
//     defaultValues: {
//       stage_name: "",
//       description: "",
//     },
//   });

//   // Filter stages based on search term
//   const filteredStages = useMemo(() => {
//     if (!searchTerm) return stages;
    
//     const term = searchTerm.toLowerCase();
//     return stages.filter(stage => 
//       stage.stage_name.toLowerCase().includes(term) ||
//       (stage.description && stage.description.toLowerCase().includes(term))
//     );
//   }, [stages, searchTerm]);

//   const handleAddClick = () => {
//     setCurrentStage(null);
//     form.reset({ stage_name: "", description: "" });
//     setShowModal(true);
//   };

//   const handleEditClick = (stage: StageEntry) => {
//     setCurrentStage(stage);
//     form.reset({ 
//       stage_name: stage.stage_name, 
//       description: stage.description || ""
//     });
//     setShowModal(true);
//   };

//   const handleDeleteClick = (_id: string) => {
//     setStageToDelete(_id);
//     setShowDeleteDialog(true);
//   };

//   const handleConfirmDelete = async () => {
//     if (stageToDelete) {
//       await deleteStage(stageToDelete);
//     }
//     setShowDeleteDialog(false);
//     setStageToDelete(null);
//   };

//   const handleSubmit = async (values: z.infer<typeof stageSchema>) => {
//     if (currentStage) {
//       // Editing an existing stage
//       await updateStage(currentStage._id, values);
//     } else {
//       // Adding a new stage
//       await addStage(values);
//     }
//     setShowModal(false);
//   };

//   return (
//     <div className="container mx-auto p-4 pt-0">
//       {/* Header with no bottom margin */}
//       <div className="flex items-center justify-between mb-0">
//         <h3 className="text-xl font-bold">Stage Management</h3>
//         <Button onClick={handleAddClick} className="flex items-center gap-1 text-sm py-1 h-8">
//           <Plus className="h-3 w-3" /> Add Stage
//         </Button>
//       </div>
      
//       {/* Search Input */}
//       <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//           <Input
//             placeholder="Search stages by name or description..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="pl-10"
//           />
//           {searchTerm && (
//             <button 
//               className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
//               onClick={() => setSearchTerm('')}
//             >
//               ×
//             </button>
//           )}
//         </div>
//       </div>
      
//       {error && (
//         <Alert variant="destructive" className="mb-2">
//           <TriangleAlert className="h-4 w-4" />
//           <AlertTitle>Error</AlertTitle>
//           <AlertDescription>{error}</AlertDescription>
//         </Alert>
//       )}
      
//       {/* Scrollable table container */}
//       <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
//         {isLoading ? (
//           <Loader />
//         ) : (
//           <div className="rounded-md border">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead className="w-[50px]">#</TableHead>
//                   <TableHead className="w-[200px]">Stage Name</TableHead>
//                   <TableHead className="w-[300px]">Description</TableHead>
//                   <TableHead className="w-[100px] text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {filteredStages.length === 0 ? (
//                   <TableRow>
//                     <TableCell colSpan={4} className="text-center h-32">
//                       {stages.length === 0 ? "No stages found." : "No stages match your search."}
//                     </TableCell>
//                   </TableRow>
//                 ) : (
//                   filteredStages.map((stage, index) => (
//                     <TableRow key={stage._id}>
//                       <TableCell>{index + 1}</TableCell>
//                       <TableCell className="whitespace-normal break-words" title={stage.stage_name}>
//                         {stage.stage_name}
//                       </TableCell>
//                       <TableCell className="whitespace-normal break-words" title={stage.description}>
//                         {stage.description}
//                       </TableCell>
//                       <TableCell className="text-right">
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           className="text-yellow-500 hover:text-yellow-700"
//                           onClick={() => handleEditClick(stage)}
//                         >
//                           <Pencil className="h-4 w-4" />
//                         </Button>
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           className="text-red-500 hover:text-red-700 ml-2"
//                           onClick={() => handleDeleteClick(stage._id)}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//         )}
//       </div>
      
//       {/* Modal for Adding & Editing Stages */}
//       <Dialog open={showModal} onOpenChange={setShowModal}>
//         <DialogContent className="sm:max-w-[425px]">
//           <DialogHeader>
//             <DialogTitle>
//               {currentStage ? "Edit Stage" : "Add Stage"}
//             </DialogTitle>
//             <DialogDescription>
//               {currentStage 
//                 ? "Update the stage details below." 
//                 : "Fill in the details to create a new stage."
//               }
//             </DialogDescription>
//           </DialogHeader>
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(handleSubmit)}>
//               <FormField
//                 control={form.control}
//                 name="stage_name"
//                 render={({ field }) => (
//                   <FormItem className="mb-4">
//                     <FormLabel>Stage Name</FormLabel>
//                     <FormControl>
//                       <Input placeholder="Enter Stage Name" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="description"
//                 render={({ field }) => (
//                   <FormItem className="mb-4">
//                     <FormLabel>Description</FormLabel>
//                     <FormControl>
//                       <Textarea 
//                         placeholder="Enter Stage Description" 
//                         className="min-h-[100px]"
//                         {...field} 
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <DialogFooter className="mt-4">
//                 <Button type="submit">
//                   {currentStage ? "Update Stage" : "Add Stage"}
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
//               This action cannot be undone. This will permanently delete the stage.
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

// export default StageManagement;