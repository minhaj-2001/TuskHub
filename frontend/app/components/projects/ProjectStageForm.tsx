import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type StageEntry, type ProjectStageEntry } from "@/lib/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const stageFormSchema = z.object({
  stageId: z.string().min(1, { message: "Stage is required" }),
  status: z.enum(['Ongoing', 'Completed']),
  startDate: z.string().optional(),
  completionDate: z.string().optional(),
});

type StageFormValues = z.infer<typeof stageFormSchema>;

interface ProjectStageFormProps {
  availableStages?: StageEntry[];
  stage?: ProjectStageEntry;
  isEditing?: boolean;
  projectId?: string;
  onSubmit: (stageId: string, status: 'Ongoing' | 'Completed', startDate?: string, completionDate?: string) => void;
  onCancel: () => void;
  preSelectedStageId?: string;
}

export const ProjectStageForm: React.FC<ProjectStageFormProps> = ({
  availableStages = [],
  stage,
  isEditing = false,
  projectId,
  onSubmit,
  onCancel,
  preSelectedStageId
}) => {
  const [status, setStatus] = useState<'Ongoing' | 'Completed'>(stage?.status || 'Ongoing');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  
  const form = useForm<StageFormValues>({
    resolver: zodResolver(stageFormSchema),
    defaultValues: {
      stageId: preSelectedStageId || stage?.stage._id || '',
      status: stage?.status || 'Ongoing',
      startDate: stage?.start_date ? format(new Date(stage.start_date), 'yyyy-MM-dd') : '',
      completionDate: stage?.completion_date ? format(new Date(stage.completion_date), 'yyyy-MM-dd') : '',
    },
  });

  const watchedStatus = form.watch('status');
  
  useEffect(() => {
    if (watchedStatus) {
      setStatus(watchedStatus as 'Ongoing' | 'Completed');
    }
  }, [watchedStatus]);

  useEffect(() => {
    if (status === 'Ongoing') {
      form.setValue('completionDate', '');
    }
  }, [status, form]);

  const handleSubmit = (values: StageFormValues) => {
    if (values.status === 'Completed') {
      if (!values.startDate || !values.completionDate) {
        setAlertMessage("Both start date and completion date are required for Completed status");
        setShowAlert(true);
        return;
      }
    }
    
    if (values.status === 'Ongoing' && !values.startDate) {
      setAlertMessage("Start date is required for Ongoing status");
      setShowAlert(true);
      return;
    }
    
    setShowAlert(false);
    onSubmit(
      values.stageId,
      values.status,
      values.startDate,
      values.completionDate
    );
  };

  // Find the selected stage for display
  const selectedStage = availableStages.find(s => s._id === form.getValues('stageId')) || stage?.stage;

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Project Stage' : 'Add Stage to Project'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the stage details below."
              : "Select an existing stage to add to the project."
            }
          </DialogDescription>
        </DialogHeader>
        
        {showAlert && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{alertMessage}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Show selected stage info when editing */}
            {isEditing && selectedStage && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{selectedStage.stage_name}</h4>
                    {/* {selectedStage.description && (
                      <p className="text-sm text-gray-600 mt-1">{selectedStage.description}</p>
                    )} */}
                  </div>
                  {selectedStage.isCustom && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      Custom
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Only show stage selection when not editing */}
            {!isEditing && (
              <FormField
                control={form.control}
                name="stageId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Stage</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-auto py-2">
                          <SelectValue placeholder="Select a stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableStages.map(stage => (
                          <SelectItem key={`stage-${stage._id}`} value={stage._id} className="whitespace-normal">
                            <div className="max-w-xs">
                              <div className="whitespace-normal break-words">
                                {stage.stage_name}
                                {stage.isCustom && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                                    Custom
                                  </span>
                                )}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={(value) => {
                    field.onChange(value);
                    setStatus(value as 'Ongoing' | 'Completed');
                    if (value === 'Ongoing') {
                      form.setValue('completionDate', '');
                    }
                  }} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Ongoing">Ongoing</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    Start Date 
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(format(date, 'yyyy-MM-dd'));
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {status === 'Completed' && (
              <FormField
                control={form.control}
                name="completionDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>
                      Completion Date <span className="text-red-500">*</span>
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(format(date, 'yyyy-MM-dd'));
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Update Stage' : 'Add Stage'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};















// import React, { useState, useEffect } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { CalendarIcon } from "lucide-react";
// import { format } from "date-fns";
// import { cn } from "@/lib/utils";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { type StageEntry, type ProjectStageEntry } from "@/lib/schema";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { AlertCircle } from "lucide-react";

// const stageFormSchema = z.object({
//   stageId: z.string().min(1, { message: "Stage is required" }),
//   status: z.enum(['Ongoing', 'Completed']),
//   startDate: z.string().optional(),
//   completionDate: z.string().optional(),
// });

// type StageFormValues = z.infer<typeof stageFormSchema>;

// interface ProjectStageFormProps {
//   availableStages?: StageEntry[];
//   stage?: ProjectStageEntry;
//   isEditing?: boolean;
//   projectId?: string;
//   onSubmit: (stageId: string, status: 'Ongoing' | 'Completed', startDate?: string, completionDate?: string) => void;
//   onCancel: () => void;
//   preSelectedStageId?: string;
// }

// export const ProjectStageForm: React.FC<ProjectStageFormProps> = ({
//   availableStages = [],
//   stage,
//   isEditing = false,
//   projectId,
//   onSubmit,
//   onCancel,
//   preSelectedStageId
// }) => {
//   const [status, setStatus] = useState<'Ongoing' | 'Completed'>(stage?.status || 'Ongoing');
//   const [showAlert, setShowAlert] = useState(false);
//   const [alertMessage, setAlertMessage] = useState("");
  
//   const form = useForm<StageFormValues>({
//     resolver: zodResolver(stageFormSchema),
//     defaultValues: {
//       stageId: preSelectedStageId || stage?.stage._id || '',
//       status: stage?.status || 'Ongoing',
//       startDate: stage?.start_date ? format(new Date(stage.start_date), 'yyyy-MM-dd') : '',
//       completionDate: stage?.completion_date ? format(new Date(stage.completion_date), 'yyyy-MM-dd') : '',
//     },
//   });

//   const watchedStatus = form.watch('status');
  
//   useEffect(() => {
//     if (watchedStatus) {
//       setStatus(watchedStatus as 'Ongoing' | 'Completed');
//     }
//   }, [watchedStatus]);

//   useEffect(() => {
//     if (status === 'Ongoing') {
//       form.setValue('completionDate', '');
//     }
//   }, [status, form]);

//   const handleSubmit = (values: StageFormValues) => {
//     if (values.status === 'Completed') {
//       if (!values.startDate || !values.completionDate) {
//         setAlertMessage("Both start date and completion date are required for Completed status");
//         setShowAlert(true);
//         return;
//       }
//     }
    
//     if (values.status === 'Ongoing' && !values.startDate) {
//       setAlertMessage("Start date is required for Ongoing status");
//       setShowAlert(true);
//       return;
//     }
    
//     setShowAlert(false);
//     onSubmit(
//       values.stageId,
//       values.status,
//       values.startDate,
//       values.completionDate
//     );
//   };

//   return (
//     <Dialog open={true} onOpenChange={onCancel}>
//       <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>
//             {isEditing ? 'Edit Project Stage' : 'Add Stage to Project'}
//           </DialogTitle>
//           <DialogDescription>
//             {isEditing
//               ? "Update the stage details below."
//               : "Select an existing stage to add to the project."
//             }
//           </DialogDescription>
//         </DialogHeader>
        
//         {showAlert && (
//           <Alert variant="destructive">
//             <AlertCircle className="h-4 w-4" />
//             <AlertDescription>{alertMessage}</AlertDescription>
//           </Alert>
//         )}
        
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
//             <FormField
//               control={form.control}
//               name="stageId"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Select Stage</FormLabel>
//                   <Select onValueChange={field.onChange} value={field.value}>
//                     <FormControl>
//                       <SelectTrigger className="h-auto py-2">
//                         <SelectValue placeholder="Select a stage" />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       {availableStages.map(stage => (
//                         <SelectItem key={`stage-${stage._id}`} value={stage._id} className="whitespace-normal">
//                           <div className="max-w-xs">
//                             <div className="whitespace-normal break-words">
//                               {stage.stage_name}
//                               {stage.isCustom && (
//                                 <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
//                                   Custom
//                                 </span>
//                               )}
//                             </div>
//                           </div>
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
            
//             <FormField
//               control={form.control}
//               name="status"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Status</FormLabel>
//                   <Select onValueChange={(value) => {
//                     field.onChange(value);
//                     setStatus(value as 'Ongoing' | 'Completed');
//                     if (value === 'Ongoing') {
//                       form.setValue('completionDate', '');
//                     }
//                   }} value={field.value}>
//                     <FormControl>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select status" />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       <SelectItem value="Ongoing">Ongoing</SelectItem>
//                       <SelectItem value="Completed">Completed</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
            
//             <FormField
//               control={form.control}
//               name="startDate"
//               render={({ field }) => (
//                 <FormItem className="flex flex-col">
//                   <FormLabel>
//                     Start Date 
//                     <span className="text-red-500">*</span>
//                   </FormLabel>
//                   <Popover>
//                     <PopoverTrigger asChild>
//                       <FormControl>
//                         <Button
//                           variant={"outline"}
//                           className={cn(
//                             "w-full pl-3 text-left font-normal",
//                             !field.value && "text-muted-foreground"
//                           )}
//                         >
//                           {field.value ? (
//                             format(new Date(field.value), "PPP")
//                           ) : (
//                             <span>Pick a date</span>
//                           )}
//                           <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                         </Button>
//                       </FormControl>
//                     </PopoverTrigger>
//                     <PopoverContent className="w-auto p-0" align="start">
//                       <Calendar
//                         mode="single"
//                         selected={field.value ? new Date(field.value) : undefined}
//                         onSelect={(date) => {
//                           if (date) {
//                             field.onChange(format(date, 'yyyy-MM-dd'));
//                           }
//                         }}
//                         initialFocus
//                       />
//                     </PopoverContent>
//                   </Popover>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
            
//             {status === 'Completed' && (
//               <FormField
//                 control={form.control}
//                 name="completionDate"
//                 render={({ field }) => (
//                   <FormItem className="flex flex-col">
//                     <FormLabel>
//                       Completion Date <span className="text-red-500">*</span>
//                     </FormLabel>
//                     <Popover>
//                       <PopoverTrigger asChild>
//                         <FormControl>
//                           <Button
//                             variant={"outline"}
//                             className={cn(
//                               "w-full pl-3 text-left font-normal",
//                               !field.value && "text-muted-foreground"
//                             )}
//                           >
//                             {field.value ? (
//                               format(new Date(field.value), "PPP")
//                             ) : (
//                               <span>Pick a date</span>
//                             )}
//                             <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                           </Button>
//                         </FormControl>
//                       </PopoverTrigger>
//                       <PopoverContent className="w-auto p-0" align="start">
//                         <Calendar
//                           mode="single"
//                           selected={field.value ? new Date(field.value) : undefined}
//                           onSelect={(date) => {
//                             if (date) {
//                               field.onChange(format(date, 'yyyy-MM-dd'));
//                             }
//                           }}
//                           initialFocus
//                         />
//                       </PopoverContent>
//                     </Popover>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             )}
            
//             <DialogFooter className="mt-4">
//               <Button type="button" variant="outline" onClick={onCancel}>
//                 Cancel
//               </Button>
//               <Button type="submit">
//                 {isEditing ? 'Update Stage' : 'Add Stage'}
//               </Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// };












// import React, { useState, useEffect } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Calendar } from "@/components/ui/calendar";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Button } from "@/components/ui/button";
// import { CalendarIcon } from "lucide-react";
// import { format } from "date-fns";
// import { cn } from "@/lib/utils";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { type StageEntry, type ProjectStageEntry } from "@/lib/schema";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { AlertCircle } from "lucide-react";

// const stageFormSchema = z.object({
//   stageId: z.string().min(1, { message: "Stage is required" }),
//   status: z.enum(['Ongoing', 'Completed']),
//   startDate: z.string().optional(),
//   completionDate: z.string().optional(),
// }).refine(data => {
//   // If status is Completed, both startDate and completionDate are required
//   if (data.status === 'Completed') {
//     return data.startDate && data.completionDate;
//   }
//   // If status is Ongoing, startDate is required
//   if (data.status === 'Ongoing') {
//     return !!data.startDate;
//   }
//   return true;
// }, {
//   message: "Date requirements not met for the selected status",
// });

// type StageFormValues = z.infer<typeof stageFormSchema>;

// interface ProjectStageFormProps {
//   availableStages?: StageEntry[];
//   stage?: ProjectStageEntry;
//   isEditing?: boolean;
//   onSubmit: (stageId: string, status: 'Ongoing' | 'Completed', startDate?: string, completionDate?: string) => void;
//   onCancel: () => void;
//   preSelectedStageId?: string;
// }

// export const ProjectStageForm: React.FC<ProjectStageFormProps> = ({
//   availableStages = [],
//   stage,
//   isEditing = false,
//   onSubmit,
//   onCancel,
//   preSelectedStageId
// }) => {
//   const [status, setStatus] = useState<'Ongoing' | 'Completed'>(stage?.status || 'Ongoing');
//   const [showAlert, setShowAlert] = useState(false);
//   const [alertMessage, setAlertMessage] = useState("");
  
//   const form = useForm<StageFormValues>({
//     resolver: zodResolver(stageFormSchema),
//     defaultValues: {
//       stageId: preSelectedStageId || stage?.stage._id || '',
//       status: stage?.status || 'Ongoing',
//       startDate: stage?.start_date ? format(new Date(stage.start_date), 'yyyy-MM-dd') : '',
//       completionDate: stage?.completion_date ? format(new Date(stage.completion_date), 'yyyy-MM-dd') : '',
//     },
//   });
  
//   const watchedStatus = form.watch('status');
  
//   useEffect(() => {
//     if (watchedStatus) {
//       setStatus(watchedStatus as 'Ongoing' | 'Completed');
//     }
//   }, [watchedStatus]);
  
//   // Update form when status changes
//   useEffect(() => {
//     if (status === 'Ongoing') {
//       // Clear completion date when switching to ongoing
//       form.setValue('completionDate', '');
//     }
//   }, [status, form]);
  
//   const handleSubmit = (values: StageFormValues) => {
//     // Validate based on status
//     if (values.status === 'Completed') {
//       if (!values.startDate || !values.completionDate) {
//         setAlertMessage("Both start date and completion date are required for Completed status");
//         setShowAlert(true);
//         return;
//       }
//     }
    
//     if (values.status === 'Ongoing' && !values.startDate) {
//       setAlertMessage("Start date is required for Ongoing status");
//       setShowAlert(true);
//       return;
//     }
    
//     setShowAlert(false);
    
//     onSubmit(
//       values.stageId,
//       values.status,
//       values.startDate,
//       values.completionDate
//     );
//   };
  
//   return (
//     <Dialog open={true} onOpenChange={onCancel}>
//       <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>
//             {isEditing ? 'Edit Project Stage' : 'Add Stage to Project'}
//           </DialogTitle>
//           <DialogDescription>
//             {isEditing
//               ? "Update the stage details below."
//               : "Fill in the details to create a new stage."
//             }
//           </DialogDescription>
//         </DialogHeader>
        
//         {showAlert && (
//           <Alert variant="destructive">
//             <AlertCircle className="h-4 w-4" />
//             <AlertDescription>{alertMessage}</AlertDescription>
//           </Alert>
//         )}
        
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
//             {!isEditing && (
//               <FormField
//                 control={form.control}
//                 name="stageId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Stage</FormLabel>
//                     <Select onValueChange={field.onChange} defaultValue={field.value}>
//                       <FormControl>
//                         <SelectTrigger className="h-auto py-2">
//                           <SelectValue placeholder="Select a stage" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         {availableStages.map(stage => (
//                           <SelectItem key={stage._id} value={stage._id} className="whitespace-normal">
//                             <div className="max-w-xs">
//                               <div className="whitespace-normal break-words">
//                                 {stage.stage_name}
//                               </div>
//                             </div>
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             )}
            
//             <FormField
//               control={form.control}
//               name="status"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Status</FormLabel>
//                   <Select onValueChange={(value) => {
//                     field.onChange(value);
//                     setStatus(value as 'Ongoing' | 'Completed');
//                     // Clear completion date when switching to ongoing
//                     if (value === 'Ongoing') {
//                       form.setValue('completionDate', '');
//                     }
//                   }} defaultValue={field.value}>
//                     <FormControl>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select status" />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       <SelectItem value="Ongoing">Ongoing</SelectItem>
//                       <SelectItem value="Completed">Completed</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
            
//             <FormField
//               control={form.control}
//               name="startDate"
//               render={({ field }) => (
//                 <FormItem className="flex flex-col">
//                   <FormLabel>
//                     Start Date 
//                     <span className="text-red-500">*</span>
//                   </FormLabel>
//                   <Popover>
//                     <PopoverTrigger asChild>
//                       <FormControl>
//                         <Button
//                           variant={"outline"}
//                           className={cn(
//                             "w-full pl-3 text-left font-normal",
//                             !field.value && "text-muted-foreground"
//                           )}
//                         >
//                           {field.value ? (
//                             format(new Date(field.value), "PPP")
//                           ) : (
//                             <span>Pick a date</span>
//                           )}
//                           <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                         </Button>
//                       </FormControl>
//                     </PopoverTrigger>
//                     <PopoverContent className="w-auto p-0" align="start">
//                       <Calendar
//                         mode="single"
//                         selected={field.value ? new Date(field.value) : undefined}
//                         onSelect={(date) => {
//                           if (date) {
//                             field.onChange(format(date, 'yyyy-MM-dd'));
//                           }
//                         }}
//                         initialFocus
//                       />
//                     </PopoverContent>
//                   </Popover>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
            
//             {status === 'Completed' && (
//               <FormField
//                 control={form.control}
//                 name="completionDate"
//                 render={({ field }) => (
//                   <FormItem className="flex flex-col">
//                     <FormLabel>
//                       Completion Date <span className="text-red-500">*</span>
//                     </FormLabel>
//                     <Popover>
//                       <PopoverTrigger asChild>
//                         <FormControl>
//                           <Button
//                             variant={"outline"}
//                             className={cn(
//                               "w-full pl-3 text-left font-normal",
//                               !field.value && "text-muted-foreground"
//                             )}
//                           >
//                             {field.value ? (
//                               format(new Date(field.value), "PPP")
//                             ) : (
//                               <span>Pick a date</span>
//                             )}
//                             <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                           </Button>
//                         </FormControl>
//                       </PopoverTrigger>
//                       <PopoverContent className="w-auto p-0" align="start">
//                         <Calendar
//                           mode="single"
//                           selected={field.value ? new Date(field.value) : undefined}
//                           onSelect={(date) => {
//                             if (date) {
//                               field.onChange(format(date, 'yyyy-MM-dd'));
//                             }
//                           }}
//                           initialFocus
//                         />
//                       </PopoverContent>
//                     </Popover>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             )}
            
//             <DialogFooter className="mt-4">
//               <Button type="button" variant="outline" onClick={onCancel}>
//                 Cancel
//               </Button>
//               <Button type="submit">
//                 {isEditing ? 'Update Stage' : 'Add Stage'}
//               </Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// };




// // frontend/app/components/projects/ProjectStageForm.tsx
// import React, { useState, useEffect } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Calendar } from "@/components/ui/calendar";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Button } from "@/components/ui/button";
// import { CalendarIcon } from "lucide-react";
// import { format } from "date-fns";
// import { cn } from "@/lib/utils";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { type StageEntry, type ProjectStageEntry } from "@/lib/schema";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { AlertCircle } from "lucide-react";

// // This is the new custom component for wrapping text
// const SelectValueWrapper = ({ children }: { children: React.ReactNode }) => {
//   return <span className="block whitespace-normal break-words py-1">{children}</span>;
// };

// const stageFormSchema = z.object({
//   stageId: z.string().min(1, { message: "Stage is required" }),
//   status: z.enum(['Ongoing', 'Completed']),
//   startDate: z.string().optional(),
//   completionDate: z.string().optional(),
// });

// type StageFormValues = z.infer<typeof stageFormSchema>;

// interface ProjectStageFormProps {
//   availableStages?: StageEntry[];
//   stage?: ProjectStageEntry;
//   isEditing?: boolean;
//   onSubmit: (stageId: string, status: 'Ongoing' | 'Completed', startDate?: string, completionDate?: string) => void;
//   onCancel: () => void;
//   preSelectedStageId?: string;
// }

// export const ProjectStageForm: React.FC<ProjectStageFormProps> = ({
//   availableStages = [],
//   stage,
//   isEditing = false,
//   onSubmit,
//   onCancel,
//   preSelectedStageId
// }) => {
//   const [status, setStatus] = useState<'Ongoing' | 'Completed'>(stage?.status || 'Ongoing');
//   const [showAlert, setShowAlert] = useState(false);
//   const [alertMessage, setAlertMessage] = useState("");

//   const form = useForm<StageFormValues>({
//     resolver: zodResolver(stageFormSchema),
//     defaultValues: {
//       stageId: preSelectedStageId || stage?.stage._id || '',
//       status: stage?.status || 'Ongoing',
//       startDate: stage?.start_date ? format(new Date(stage.start_date), 'yyyy-MM-dd') : '',
//       completionDate: stage?.completion_date ? format(new Date(stage.completion_date), 'yyyy-MM-dd') : '',
//     },
//   });

//   const watchedStatus = form.watch('status');
//   const watchedStartDate = form.watch('startDate');
//   const watchedCompletionDate = form.watch('completionDate');

//   useEffect(() => {
//     if (watchedStatus) {
//       setStatus(watchedStatus as 'Ongoing' | 'Completed');
//     }
//   }, [watchedStatus]);

//   const validateForm = () => {
//     if (status === 'Ongoing' && !watchedStartDate) {
//       setAlertMessage("Start date is required for Ongoing status");
//       setShowAlert(true);
//       return false;
//     }
    
//     if (status === 'Completed' && (!watchedStartDate || !watchedCompletionDate)) {
//       setAlertMessage("Both start date and completion date are required for Completed status");
//       setShowAlert(true);
//       return false;
//     }
    
//     setShowAlert(false);
//     return true;
//   };

//   const handleSubmit = (values: StageFormValues) => {
//     if (!validateForm()) {
//       return;
//     }
    
//     onSubmit(
//       values.stageId,
//       values.status,
//       values.startDate,
//       values.completionDate
//     );
//   };

//   return (
//     <Dialog open={true} onOpenChange={onCancel}>
//       <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>
//             {isEditing ? 'Edit Project Stage' : 'Add Stage to Project'}
//           </DialogTitle>
//           <DialogDescription>
//             {isEditing
//               ? "Update the stage details below."
//               : "Fill in the details to create a new stage."
//             }
//           </DialogDescription>
//         </DialogHeader>
        
//         {showAlert && (
//           <Alert variant="destructive">
//             <AlertCircle className="h-4 w-4" />
//             <AlertDescription>{alertMessage}</AlertDescription>
//           </Alert>
//         )}
        
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
//             {!isEditing && (
//               <FormField
//                 control={form.control}
//                 name="stageId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Stage</FormLabel>
//                     <Select onValueChange={field.onChange} defaultValue={field.value}>
//                       <FormControl>
//                         <SelectTrigger className="h-auto py-2">
//                           <SelectValue asChild>
//                             <SelectValueWrapper>
//                               {field.value
//                                 ? availableStages.find(s => s._id === field.value)?.stage_name
//                                 : "Select a stage"
//                               }
//                             </SelectValueWrapper>
//                           </SelectValue>
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         {availableStages.map(stage => (
//                           <SelectItem key={stage._id} value={stage._id} className="whitespace-normal">
//                             <div className="max-w-xs">
//                               <div className="whitespace-normal break-words">
//                                 {stage.stage_name}
//                               </div>
//                             </div>
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             )}
            
//             <FormField
//               control={form.control}
//               name="status"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Status</FormLabel>
//                   <Select onValueChange={(value) => {
//                     field.onChange(value);
//                     setStatus(value as 'Ongoing' | 'Completed');
//                   }} defaultValue={field.value}>
//                     <FormControl>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select status" />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       <SelectItem value="Ongoing">Ongoing</SelectItem>
//                       <SelectItem value="Completed">Completed</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
            
//             <FormField
//               control={form.control}
//               name="startDate"
//               render={({ field }) => (
//                 <FormItem className="flex flex-col">
//                   <FormLabel>Start Date {status === 'Ongoing' && <span className="text-red-500">*</span>}</FormLabel>
//                   <Popover>
//                     <PopoverTrigger asChild>
//                       <FormControl>
//                         <Button
//                           variant={"outline"}
//                           className={cn(
//                             "w-full pl-3 text-left font-normal",
//                             !field.value && "text-muted-foreground"
//                           )}
//                         >
//                           {field.value ? (
//                             format(new Date(field.value), "PPP")
//                           ) : (
//                             <span>Pick a date</span>
//                           )}
//                           <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                         </Button>
//                       </FormControl>
//                     </PopoverTrigger>
//                     <PopoverContent className="w-auto p-0" align="start">
//                       <Calendar
//                         mode="single"
//                         selected={field.value ? new Date(field.value) : undefined}
//                         onSelect={(date) => {
//                           if (date) {
//                             field.onChange(format(date, 'yyyy-MM-dd'));
//                           }
//                         }}
//                         disabled={(date) =>
//                           date > new Date() || date < new Date("1900-01-01")
//                         }
//                         initialFocus
//                       />
//                     </PopoverContent>
//                   </Popover>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
            
//             {status === 'Completed' && (
//               <FormField
//                 control={form.control}
//                 name="completionDate"
//                 render={({ field }) => (
//                   <FormItem className="flex flex-col">
//                     <FormLabel>Completion Date <span className="text-red-500">*</span></FormLabel>
//                     <Popover>
//                       <PopoverTrigger asChild>
//                         <FormControl>
//                           <Button
//                             variant={"outline"}
//                             className={cn(
//                               "w-full pl-3 text-left font-normal",
//                               !field.value && "text-muted-foreground"
//                             )}
//                           >
//                             {field.value ? (
//                               format(new Date(field.value), "PPP")
//                             ) : (
//                               <span>Pick a date</span>
//                             )}
//                             <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                           </Button>
//                         </FormControl>
//                       </PopoverTrigger>
//                       <PopoverContent className="w-auto p-0" align="start">
//                         <Calendar
//                           mode="single"
//                           selected={field.value ? new Date(field.value) : undefined}
//                           onSelect={(date) => {
//                             if (date) {
//                               field.onChange(format(date, 'yyyy-MM-dd'));
//                             }
//                           }}
//                           disabled={(date) =>
//                             date > new Date() || date < new Date("1900-01-01")
//                           }
//                           initialFocus
//                         />
//                       </PopoverContent>
//                     </Popover>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             )}
            
//             <DialogFooter className="mt-4">
//               <Button type="button" variant="outline" onClick={onCancel}>
//                 Cancel
//               </Button>
//               <Button type="submit">
//                 {isEditing ? 'Update Stage' : 'Add Stage'}
//               </Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// };











// // frontend/app/components/projects/ProjectStageForm.tsx
// import React, { useState, useEffect } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Calendar } from "@/components/ui/calendar";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Button } from "@/components/ui/button";
// import { CalendarIcon } from "lucide-react";
// import { format } from "date-fns";
// import { cn } from "@/lib/utils";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { type StageEntry, type ProjectStageEntry } from "@/lib/schema";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { AlertCircle } from "lucide-react";

// const stageFormSchema = z.object({
//   stageId: z.string().min(1, { message: "Stage is required" }),
//   status: z.enum(['Ongoing', 'Completed']),
//   startDate: z.string().optional(),
//   completionDate: z.string().optional(),
// }).refine(data => {
//   if (data.status === 'Ongoing') {
//     return data.startDate !== undefined;
//   }
//   if (data.status === 'Completed') {
//     return data.startDate !== undefined && data.completionDate !== undefined;
//   }
//   return true;
// }, {
//   message: "Required date fields must be filled",
//   path: ["startDate"],
// });

// type StageFormValues = z.infer<typeof stageFormSchema>;

// interface ProjectStageFormProps {
//   availableStages?: StageEntry[];
//   stage?: ProjectStageEntry;
//   isEditing?: boolean;
//   onSubmit: (stageId: string, status: 'Ongoing' | 'Completed', startDate?: string, completionDate?: string) => void;
//   onCancel: () => void;
//   preSelectedStageId?: string;
// }

// export const ProjectStageForm: React.FC<ProjectStageFormProps> = ({
//   availableStages = [],
//   stage,
//   isEditing = false,
//   onSubmit,
//   onCancel,
//   preSelectedStageId
// }) => {
//   const [status, setStatus] = useState<'Ongoing' | 'Completed'>(stage?.status || 'Ongoing');
//   const [showAlert, setShowAlert] = useState(false);
//   const [alertMessage, setAlertMessage] = useState("");
  
//   const form = useForm<StageFormValues>({
//     resolver: zodResolver(stageFormSchema),
//     defaultValues: {
//       stageId: preSelectedStageId || stage?.stage._id || '',
//       status: stage?.status || 'Ongoing',
//       startDate: stage?.start_date ? format(new Date(stage.start_date), 'yyyy-MM-dd') : '',
//       completionDate: stage?.completion_date ? format(new Date(stage.completion_date), 'yyyy-MM-dd') : '',
//     },
//   });
  
//   const watchedStatus = form.watch('status');
//   const watchedStartDate = form.watch('startDate');
//   const watchedCompletionDate = form.watch('completionDate');
  
//   useEffect(() => {
//     if (watchedStatus) {
//       setStatus(watchedStatus as 'Ongoing' | 'Completed');
//     }
//   }, [watchedStatus]);
  
//   const validateForm = () => {
//     if (status === 'Ongoing' && !watchedStartDate) {
//       setAlertMessage("Start date is required for Ongoing status");
//       setShowAlert(true);
//       return false;
//     }
    
//     if (status === 'Completed' && (!watchedStartDate || !watchedCompletionDate)) {
//       setAlertMessage("Both start date and completion date are required for Completed status");
//       setShowAlert(true);
//       return false;
//     }
    
//     setShowAlert(false);
//     return true;
//   };
  
//   const handleSubmit = (values: StageFormValues) => {
//     if (!validateForm()) {
//       return;
//     }
    
//     onSubmit(
//       values.stageId,
//       values.status,
//       values.startDate,
//       values.completionDate
//     );
//   };
  
//   return (
//     <Dialog open={true} onOpenChange={onCancel}>
//       <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>
//             {isEditing ? 'Edit Project Stage' : 'Add Stage to Project'}
//           </DialogTitle>
//           <DialogDescription>
//             {isEditing 
//               ? "Update the stage details below." 
//               : "Fill in the details to create a new stage."
//             }
//           </DialogDescription>
//         </DialogHeader>
        
//         {showAlert && (
//           <Alert variant="destructive">
//             <AlertCircle className="h-4 w-4" />
//             <AlertDescription>{alertMessage}</AlertDescription>
//           </Alert>
//         )}
        
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
//             {!isEditing && (
//               <FormField
//                 control={form.control}
//                 name="stageId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Stage</FormLabel>
//                     <Select onValueChange={field.onChange} defaultValue={field.value}>
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select a stage" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         {availableStages.map(stage => (
//                           <SelectItem key={stage._id} value={stage._id}>
//                             <div className="flex flex-col">
//                               <span>{stage.stage_name}</span>
//                               {stage.description && (
//                                 <span className="text-xs text-muted-foreground mt-1">
//                                   {stage.description}
//                                 </span>
//                               )}
//                             </div>
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             )}
            
//             <FormField
//               control={form.control}
//               name="status"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Status</FormLabel>
//                   <Select onValueChange={(value) => {
//                     field.onChange(value);
//                     setStatus(value as 'Ongoing' | 'Completed');
//                   }} defaultValue={field.value}>
//                     <FormControl>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select status" />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       <SelectItem value="Ongoing">Ongoing</SelectItem>
//                       <SelectItem value="Completed">Completed</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
            
//             <FormField
//               control={form.control}
//               name="startDate"
//               render={({ field }) => (
//                 <FormItem className="flex flex-col">
//                   <FormLabel>Start Date {status === 'Ongoing' && <span className="text-red-500">*</span>}</FormLabel>
//                   <Popover>
//                     <PopoverTrigger asChild>
//                       <FormControl>
//                         <Button
//                           variant={"outline"}
//                           className={cn(
//                             "w-full pl-3 text-left font-normal",
//                             !field.value && "text-muted-foreground"
//                           )}
//                         >
//                           {field.value ? (
//                             format(new Date(field.value), "PPP")
//                           ) : (
//                             <span>Pick a date</span>
//                           )}
//                           <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                         </Button>
//                       </FormControl>
//                     </PopoverTrigger>
//                     <PopoverContent className="w-auto p-0" align="start">
//                       <Calendar
//                         mode="single"
//                         selected={field.value ? new Date(field.value) : undefined}
//                         onSelect={(date) => {
//                           if (date) {
//                             field.onChange(format(date, 'yyyy-MM-dd'));
//                           }
//                         }}
//                         // Allow future dates
//                         initialFocus
//                       />
//                     </PopoverContent>
//                   </Popover>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
            
//             {status === 'Completed' && (
//               <FormField
//                 control={form.control}
//                 name="completionDate"
//                 render={({ field }) => (
//                   <FormItem className="flex flex-col">
//                     <FormLabel>Completion Date <span className="text-red-500">*</span></FormLabel>
//                     <Popover>
//                       <PopoverTrigger asChild>
//                         <FormControl>
//                           <Button
//                             variant={"outline"}
//                             className={cn(
//                               "w-full pl-3 text-left font-normal",
//                               !field.value && "text-muted-foreground"
//                             )}
//                           >
//                             {field.value ? (
//                               format(new Date(field.value), "PPP")
//                             ) : (
//                               <span>Pick a date</span>
//                             )}
//                             <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                           </Button>
//                         </FormControl>
//                       </PopoverTrigger>
//                       <PopoverContent className="w-auto p-0" align="start">
//                         <Calendar
//                           mode="single"
//                           selected={field.value ? new Date(field.value) : undefined}
//                           onSelect={(date) => {
//                             if (date) {
//                               field.onChange(format(date, 'yyyy-MM-dd'));
//                             }
//                           }}
//                           // Allow future dates
//                           initialFocus
//                         />
//                       </PopoverContent>
//                     </Popover>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             )}
            
//             <DialogFooter className="mt-4">
//               <Button type="button" variant="outline" onClick={onCancel}>
//                 Cancel
//               </Button>
//               <Button type="submit">
//                 {isEditing ? 'Update Stage' : 'Add Stage'}
//               </Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// };




// // frontend/app/components/projects/ProjectStageForm.tsx
// import React, { useState, useEffect } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Calendar } from "@/components/ui/calendar";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Button } from "@/components/ui/button";
// import { CalendarIcon } from "lucide-react";
// import { format } from "date-fns";
// import { cn } from "@/lib/utils";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { type StageEntry, type ProjectStageEntry } from "@/lib/schema";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { AlertCircle } from "lucide-react";

// const stageFormSchema = z.object({
//   stageId: z.string().min(1, { message: "Stage is required" }),
//   status: z.enum(['Ongoing', 'Completed']),
//   startDate: z.string().optional(),
//   completionDate: z.string().optional(),
// });

// type StageFormValues = z.infer<typeof stageFormSchema>;

// interface ProjectStageFormProps {
//   availableStages?: StageEntry[];
//   stage?: ProjectStageEntry;
//   isEditing?: boolean;
//   onSubmit: (stageId: string, status: 'Ongoing' | 'Completed', startDate?: string, completionDate?: string) => void;
//   onCancel: () => void;
//   preSelectedStageId?: string;
// }

// export const ProjectStageForm: React.FC<ProjectStageFormProps> = ({
//   availableStages = [],
//   stage,
//   isEditing = false,
//   onSubmit,
//   onCancel,
//   preSelectedStageId
// }) => {
//   const [status, setStatus] = useState<'Ongoing' | 'Completed'>(stage?.status || 'Ongoing');
//   const [showAlert, setShowAlert] = useState(false);
//   const [alertMessage, setAlertMessage] = useState("");
  
//   const form = useForm<StageFormValues>({
//     resolver: zodResolver(stageFormSchema),
//     defaultValues: {
//       stageId: preSelectedStageId || stage?.stage._id || '',
//       status: stage?.status || 'Ongoing',
//       startDate: stage?.start_date ? format(new Date(stage.start_date), 'yyyy-MM-dd') : '',
//       completionDate: stage?.completion_date ? format(new Date(stage.completion_date), 'yyyy-MM-dd') : '',
//     },
//   });
  
//   const watchedStatus = form.watch('status');
//   const watchedStartDate = form.watch('startDate');
//   const watchedCompletionDate = form.watch('completionDate');
  
//   useEffect(() => {
//     if (watchedStatus) {
//       setStatus(watchedStatus as 'Ongoing' | 'Completed');
//     }
//   }, [watchedStatus]);
  
//   const validateForm = () => {
//     if (status === 'Ongoing' && !watchedStartDate) {
//       setAlertMessage("Start date is required for Ongoing status");
//       setShowAlert(true);
//       return false;
//     }
    
//     if (status === 'Completed' && (!watchedStartDate || !watchedCompletionDate)) {
//       setAlertMessage("Both start date and completion date are required for Completed status");
//       setShowAlert(true);
//       return false;
//     }
    
//     setShowAlert(false);
//     return true;
//   };
  
//   const handleSubmit = (values: StageFormValues) => {
//     if (!validateForm()) {
//       return;
//     }
    
//     onSubmit(
//       values.stageId,
//       values.status,
//       values.startDate,
//       values.completionDate
//     );
//   };
  
//   return (
//     <Dialog open={true} onOpenChange={onCancel}>
//       <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>
//             {isEditing ? 'Edit Project Stage' : 'Add Stage to Project'}
//           </DialogTitle>
//           <DialogDescription>
//             {isEditing 
//               ? "Update the stage details below." 
//               : "Fill in the details to create a new stage."
//             }
//           </DialogDescription>
//         </DialogHeader>
        
//         {showAlert && (
//           <Alert variant="destructive">
//             <AlertCircle className="h-4 w-4" />
//             <AlertDescription>{alertMessage}</AlertDescription>
//           </Alert>
//         )}
        
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
//             {!isEditing && (
//               <FormField
//                 control={form.control}
//                 name="stageId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Stage</FormLabel>
//                     <Select onValueChange={field.onChange} defaultValue={field.value}>
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select a stage" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         {availableStages.map(stage => (
//                           <SelectItem key={stage._id} value={stage._id}>
//                             <div className="max-w-xs">
//                               <div className="whitespace-normal break-words">
//                                 {stage.stage_name}
//                               </div>
//                             </div>
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             )}
            
//             <FormField
//               control={form.control}
//               name="status"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Status</FormLabel>
//                   <Select onValueChange={(value) => {
//                     field.onChange(value);
//                     setStatus(value as 'Ongoing' | 'Completed');
//                   }} defaultValue={field.value}>
//                     <FormControl>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select status" />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       <SelectItem value="Ongoing">Ongoing</SelectItem>
//                       <SelectItem value="Completed">Completed</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
            
//             <FormField
//               control={form.control}
//               name="startDate"
//               render={({ field }) => (
//                 <FormItem className="flex flex-col">
//                   <FormLabel>Start Date {status === 'Ongoing' && <span className="text-red-500">*</span>}</FormLabel>
//                   <Popover>
//                     <PopoverTrigger asChild>
//                       <FormControl>
//                         <Button
//                           variant={"outline"}
//                           className={cn(
//                             "w-full pl-3 text-left font-normal",
//                             !field.value && "text-muted-foreground"
//                           )}
//                         >
//                           {field.value ? (
//                             format(new Date(field.value), "PPP")
//                           ) : (
//                             <span>Pick a date</span>
//                           )}
//                           <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                         </Button>
//                       </FormControl>
//                     </PopoverTrigger>
//                     <PopoverContent className="w-auto p-0" align="start">
//                       <Calendar
//                         mode="single"
//                         selected={field.value ? new Date(field.value) : undefined}
//                         onSelect={(date) => {
//                           if (date) {
//                             field.onChange(format(date, 'yyyy-MM-dd'));
//                           }
//                         }}
//                         disabled={(date) =>
//                           date > new Date() || date < new Date("1900-01-01")
//                         }
//                         initialFocus
//                       />
//                     </PopoverContent>
//                   </Popover>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
            
//             {status === 'Completed' && (
//               <FormField
//                 control={form.control}
//                 name="completionDate"
//                 render={({ field }) => (
//                   <FormItem className="flex flex-col">
//                     <FormLabel>Completion Date <span className="text-red-500">*</span></FormLabel>
//                     <Popover>
//                       <PopoverTrigger asChild>
//                         <FormControl>
//                           <Button
//                             variant={"outline"}
//                             className={cn(
//                               "w-full pl-3 text-left font-normal",
//                               !field.value && "text-muted-foreground"
//                             )}
//                           >
//                             {field.value ? (
//                               format(new Date(field.value), "PPP")
//                             ) : (
//                               <span>Pick a date</span>
//                             )}
//                             <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                           </Button>
//                         </FormControl>
//                       </PopoverTrigger>
//                       <PopoverContent className="w-auto p-0" align="start">
//                         <Calendar
//                           mode="single"
//                           selected={field.value ? new Date(field.value) : undefined}
//                           onSelect={(date) => {
//                             if (date) {
//                               field.onChange(format(date, 'yyyy-MM-dd'));
//                             }
//                           }}
//                           disabled={(date) =>
//                             date > new Date() || date < new Date("1900-01-01")
//                           }
//                           initialFocus
//                         />
//                       </PopoverContent>
//                     </Popover>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             )}
            
//             <DialogFooter className="mt-4">
//               <Button type="button" variant="outline" onClick={onCancel}>
//                 Cancel
//               </Button>
//               <Button type="submit">
//                 {isEditing ? 'Update Stage' : 'Add Stage'}
//               </Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// };











// // frontend/app/components/projects/ProjectStageForm.tsx
// import React, { useState, useEffect } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Calendar } from "@/components/ui/calendar";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Button } from "@/components/ui/button";
// import { CalendarIcon } from "lucide-react";
// import { format } from "date-fns";
// import { cn } from "@/lib/utils";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { type StageEntry, type ProjectStageEntry } from "@/lib/schema";

// const stageFormSchema = z.object({
//   stageId: z.string().min(1, { message: "Stage is required" }),
//   status: z.enum(['Ongoing', 'Completed']),
//   startDate: z.string().optional(),
//   completionDate: z.string().optional(),
// }).refine(data => {
//   if (data.status === 'Ongoing') {
//     return data.startDate !== undefined;
//   }
//   if (data.status === 'Completed') {
//     return data.startDate !== undefined && data.completionDate !== undefined;
//   }
//   return true;
// }, {
//   message: "Required date fields must be filled",
//   path: ["startDate"],
// });

// type StageFormValues = z.infer<typeof stageFormSchema>;

// interface ProjectStageFormProps {
//   availableStages?: StageEntry[];
//   stage?: ProjectStageEntry;
//   isEditing?: boolean;
//   onSubmit: (stageId: string, status: 'Ongoing' | 'Completed', startDate?: string, completionDate?: string) => void;
//   onCancel: () => void;
//   preSelectedStageId?: string; // Add this for pre-selecting a stage
// }

// export const ProjectStageForm: React.FC<ProjectStageFormProps> = ({
//   availableStages = [],
//   stage,
//   isEditing = false,
//   onSubmit,
//   onCancel,
//   preSelectedStageId
// }) => {
//   const [status, setStatus] = useState<'Ongoing' | 'Completed'>(stage?.status || 'Ongoing');
//   const [showCompletionDatePicker, setShowCompletionDatePicker] = useState(false);
  
//   const form = useForm<StageFormValues>({
//     resolver: zodResolver(stageFormSchema),
//     defaultValues: {
//       stageId: preSelectedStageId || stage?.stage._id || '',
//       status: stage?.status || 'Ongoing',
//       startDate: stage?.start_date ? format(new Date(stage.start_date), 'yyyy-MM-dd') : '',
//       completionDate: stage?.completion_date ? format(new Date(stage.completion_date), 'yyyy-MM-dd') : '',
//     },
//   });
  
//   const watchedStatus = form.watch('status');
  
//   useEffect(() => {
//     if (watchedStatus) {
//       setStatus(watchedStatus as 'Ongoing' | 'Completed');
//     }
//   }, [watchedStatus]);
  
//   const handleSubmit = (values: StageFormValues) => {
//     onSubmit(
//       values.stageId,
//       values.status,
//       values.startDate,
//       values.completionDate
//     );
//   };
  
//   return (
//     <Dialog open={true} onOpenChange={onCancel}>
//       <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>
//             {isEditing ? 'Edit Project Stage' : 'Add Stage to Project'}
//           </DialogTitle>
//           <DialogDescription>
//             {isEditing 
//               ? "Update the stage details below." 
//               : "Fill in the details to create a new stage."
//             }
//           </DialogDescription>
//         </DialogHeader>
        
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
//             {!isEditing && (
//               <FormField
//                 control={form.control}
//                 name="stageId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Stage</FormLabel>
//                     <Select onValueChange={field.onChange} defaultValue={field.value}>
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select a stage" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         {availableStages.map(stage => (
//                           <SelectItem key={stage._id} value={stage._id}>
//                             <div className="flex flex-col">
//                               <span>{stage.stage_name}</span>
//                               {stage.description && (
//                                 <span className="text-xs text-muted-foreground mt-1">
//                                   {stage.description}
//                                 </span>
//                               )}
//                             </div>
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             )}
            
//             <FormField
//               control={form.control}
//               name="status"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Status</FormLabel>
//                   <Select onValueChange={(value) => {
//                     field.onChange(value);
//                     setStatus(value as 'Ongoing' | 'Completed');
//                   }} defaultValue={field.value}>
//                     <FormControl>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select status" />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       <SelectItem value="Ongoing">Ongoing</SelectItem>
//                       <SelectItem value="Completed">Completed</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
            
//             <FormField
//               control={form.control}
//               name="startDate"
//               render={({ field }) => (
//                 <FormItem className="flex flex-col">
//                   <FormLabel>Start Date {status === 'Ongoing' && <span className="text-red-500">*</span>}</FormLabel>
//                   <Popover>
//                     <PopoverTrigger asChild>
//                       <FormControl>
//                         <Button
//                           variant={"outline"}
//                           className={cn(
//                             "w-full pl-3 text-left font-normal",
//                             !field.value && "text-muted-foreground"
//                           )}
//                         >
//                           {field.value ? (
//                             format(new Date(field.value), "PPP")
//                           ) : (
//                             <span>Pick a date</span>
//                           )}
//                           <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                         </Button>
//                       </FormControl>
//                     </PopoverTrigger>
//                     <PopoverContent className="w-auto p-0" align="start">
//                       <Calendar
//                         mode="single"
//                         selected={field.value ? new Date(field.value) : undefined}
//                         onSelect={(date) => {
//                           if (date) {
//                             field.onChange(format(date, 'yyyy-MM-dd'));
//                           }
//                         }}
//                         disabled={(date) =>
//                           date > new Date() || date < new Date("1900-01-01")
//                         }
//                         initialFocus
//                       />
//                     </PopoverContent>
//                   </Popover>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
            
//             {status === 'Completed' && (
//               <FormField
//                 control={form.control}
//                 name="completionDate"
//                 render={({ field }) => (
//                   <FormItem className="flex flex-col">
//                     <FormLabel>Completion Date <span className="text-red-500">*</span></FormLabel>
//                     <Popover>
//                       <PopoverTrigger asChild>
//                         <FormControl>
//                           <Button
//                             variant={"outline"}
//                             className={cn(
//                               "w-full pl-3 text-left font-normal",
//                               !field.value && "text-muted-foreground"
//                             )}
//                           >
//                             {field.value ? (
//                               format(new Date(field.value), "PPP")
//                             ) : (
//                               <span>Pick a date</span>
//                             )}
//                             <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                           </Button>
//                         </FormControl>
//                       </PopoverTrigger>
//                       <PopoverContent className="w-auto p-0" align="start">
//                         <Calendar
//                           mode="single"
//                           selected={field.value ? new Date(field.value) : undefined}
//                           onSelect={(date) => {
//                             if (date) {
//                               field.onChange(format(date, 'yyyy-MM-dd'));
//                             }
//                           }}
//                           disabled={(date) =>
//                             date > new Date() || date < new Date("1900-01-01")
//                           }
//                           initialFocus
//                         />
//                       </PopoverContent>
//                     </Popover>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             )}
            
//             <DialogFooter className="mt-4">
//               <Button type="button" variant="outline" onClick={onCancel}>
//                 Cancel
//               </Button>
//               <Button type="submit">
//                 {isEditing ? 'Update Stage' : 'Add Stage'}
//               </Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// };











// // frontend/app/components/projects/ProjectStageForm.tsx
// import React, { useState, useEffect } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Calendar } from "@/components/ui/calendar";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Button } from "@/components/ui/button";
// import { CalendarIcon } from "lucide-react";
// import { format } from "date-fns";
// import { cn } from "@/lib/utils";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { type StageEntry, type ProjectStageEntry } from "@/lib/schema";

// const stageFormSchema = z.object({
//   stageId: z.string().min(1, { message: "Stage is required" }),
//   status: z.enum(['Ongoing', 'Completed']),
//   startDate: z.string().optional(),
//   completionDate: z.string().optional(),
// }).refine(data => {
//   if (data.status === 'Ongoing') {
//     return data.startDate !== undefined;
//   }
//   if (data.status === 'Completed') {
//     return data.startDate !== undefined && data.completionDate !== undefined;
//   }
//   return true;
// }, {
//   message: "Required date fields must be filled",
//   path: ["startDate"],
// });

// type StageFormValues = z.infer<typeof stageFormSchema>;

// interface ProjectStageFormProps {
//   availableStages?: StageEntry[];
//   stage?: ProjectStageEntry;
//   isEditing?: boolean;
//   onSubmit: (stageId: string, status: 'Ongoing' | 'Completed', startDate?: string, completionDate?: string) => void;
//   onCancel: () => void;
// }

// export const ProjectStageForm: React.FC<ProjectStageFormProps> = ({
//   availableStages = [],
//   stage,
//   isEditing = false,
//   onSubmit,
//   onCancel
// }) => {
//   const [status, setStatus] = useState<'Ongoing' | 'Completed'>(stage?.status || 'Ongoing');
  
//   const form = useForm<StageFormValues>({
//     resolver: zodResolver(stageFormSchema),
//     defaultValues: {
//       stageId: stage?.stage._id || '',
//       status: stage?.status || 'Ongoing',
//       startDate: stage?.start_date ? format(new Date(stage.start_date), 'yyyy-MM-dd') : '',
//       completionDate: stage?.completion_date ? format(new Date(stage.completion_date), 'yyyy-MM-dd') : '',
//     },
//   });
  
//   const watchedStatus = form.watch('status');
  
//   useEffect(() => {
//     if (watchedStatus) {
//       setStatus(watchedStatus);
//     }
//   }, [watchedStatus]);
  
//   const handleSubmit = (values: StageFormValues) => {
//     onSubmit(
//       values.stageId,
//       values.status,
//       values.startDate,
//       values.completionDate
//     );
//   };
  
//   return (
//     <Dialog open={true} onOpenChange={onCancel}>
//       <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>
//             {isEditing ? 'Edit Project Stage' : 'Add Stage to Project'}
//           </DialogTitle>
//           <DialogDescription>
//             {isEditing 
//               ? "Update the stage details below." 
//               : "Fill in the details to create a new stage."
//             }
//           </DialogDescription>
//         </DialogHeader>
        
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
//             {!isEditing && (
//               <FormField
//                 control={form.control}
//                 name="stageId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Stage</FormLabel>
//                     <Select onValueChange={field.onChange} defaultValue={field.value}>
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select a stage" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         {availableStages.map(stage => (
//                           <SelectItem key={stage._id} value={stage._id}>
//                             {stage.stage_name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             )}
            
//             <FormField
//               control={form.control}
//               name="status"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Status</FormLabel>
//                   <Select onValueChange={(value) => {
//                     field.onChange(value);
//                     setStatus(value as 'Ongoing' | 'Completed');
//                   }} defaultValue={field.value}>
//                     <FormControl>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select status" />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       <SelectItem value="Ongoing">Ongoing</SelectItem>
//                       <SelectItem value="Completed">Completed</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
            
//             <FormField
//               control={form.control}
//               name="startDate"
//               render={({ field }) => (
//                 <FormItem className="flex flex-col">
//                   <FormLabel>Start Date {status === 'Ongoing' && <span className="text-red-500">*</span>}</FormLabel>
//                   <Popover>
//                     <PopoverTrigger asChild>
//                       <FormControl>
//                         <Button
//                           variant={"outline"}
//                           className={cn(
//                             "w-full pl-3 text-left font-normal",
//                             !field.value && "text-muted-foreground"
//                           )}
//                         >
//                           {field.value ? (
//                             format(new Date(field.value), "PPP")
//                           ) : (
//                             <span>Pick a date</span>
//                           )}
//                           <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                         </Button>
//                       </FormControl>
//                     </PopoverTrigger>
//                     <PopoverContent className="w-auto p-0" align="start">
//                       <Calendar
//                         mode="single"
//                         selected={field.value ? new Date(field.value) : undefined}
//                         onSelect={(date) => {
//                           if (date) {
//                             field.onChange(format(date, 'yyyy-MM-dd'));
//                           }
//                         }}
//                         disabled={(date) =>
//                           date > new Date() || date < new Date("1900-01-01")
//                         }
//                         initialFocus
//                       />
//                     </PopoverContent>
//                   </Popover>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
            
//             {status === 'Completed' && (
//               <FormField
//                 control={form.control}
//                 name="completionDate"
//                 render={({ field }) => (
//                   <FormItem className="flex flex-col">
//                     <FormLabel>Completion Date <span className="text-red-500">*</span></FormLabel>
//                     <Popover>
//                       <PopoverTrigger asChild>
//                         <FormControl>
//                           <Button
//                             variant={"outline"}
//                             className={cn(
//                               "w-full pl-3 text-left font-normal",
//                               !field.value && "text-muted-foreground"
//                             )}
//                           >
//                             {field.value ? (
//                               format(new Date(field.value), "PPP")
//                             ) : (
//                               <span>Pick a date</span>
//                             )}
//                             <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                           </Button>
//                         </FormControl>
//                       </PopoverTrigger>
//                       <PopoverContent className="w-auto p-0" align="start">
//                         <Calendar
//                           mode="single"
//                           selected={field.value ? new Date(field.value) : undefined}
//                           onSelect={(date) => {
//                             if (date) {
//                               field.onChange(format(date, 'yyyy-MM-dd'));
//                             }
//                           }}
//                           disabled={(date) =>
//                             date > new Date() || date < new Date("1900-01-01")
//                           }
//                           initialFocus
//                         />
//                       </PopoverContent>
//                     </Popover>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             )}
            
//             <DialogFooter className="mt-4">
//               <Button type="button" variant="outline" onClick={onCancel}>
//                 Cancel
//               </Button>
//               <Button type="submit">
//                 {isEditing ? 'Update Stage' : 'Add Stage'}
//               </Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// };









// // frontend/app/components/projects/ProjectStageForm.tsx
// import React, { useState, useEffect } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Calendar } from "@/components/ui/calendar";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Button } from "@/components/ui/button";
// import { CalendarIcon } from "lucide-react";
// import { format } from "date-fns";
// import { cn } from "@/lib/utils";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { type StageEntry, type ProjectStageEntry } from "@/lib/schema";

// const stageFormSchema = z.object({
//   stageId: z.string().min(1, { message: "Stage is required" }),
//   status: z.enum(['Ongoing', 'Completed']),
//   startDate: z.string().optional(),
//   completionDate: z.string().optional(),
// });

// type StageFormValues = z.infer<typeof stageFormSchema>;

// interface ProjectStageFormProps {
//   availableStages?: StageEntry[];
//   stage?: ProjectStageEntry;
//   isEditing?: boolean;
//   onSubmit: (stageId: string, status: 'Ongoing' | 'Completed', startDate?: string, completionDate?: string) => void;
//   onCancel: () => void;
// }

// export const ProjectStageForm: React.FC<ProjectStageFormProps> = ({
//   availableStages = [],
//   stage,
//   isEditing = false,
//   onSubmit,
//   onCancel
// }) => {
//   const [status, setStatus] = useState<'Ongoing' | 'Completed'>(stage?.status || 'Ongoing');
  
//   const form = useForm<StageFormValues>({
//     resolver: zodResolver(stageFormSchema),
//     defaultValues: {
//       stageId: stage?.stage._id || '',
//       status: stage?.status || 'Ongoing',
//       startDate: stage?.start_date ? format(new Date(stage.start_date), 'yyyy-MM-dd') : '',
//       completionDate: stage?.completion_date ? format(new Date(stage.completion_date), 'yyyy-MM-dd') : '',
//     },
//   });
  
//   const watchedStatus = form.watch('status');
  
//   useEffect(() => {
//     if (watchedStatus) {
//       setStatus(watchedStatus);
//     }
//   }, [watchedStatus]);
  
//   const handleSubmit = (values: StageFormValues) => {
//     onSubmit(
//       values.stageId,
//       values.status,
//       values.status === 'Ongoing' ? values.startDate : undefined,
//       values.status === 'Completed' ? values.completionDate : undefined
//     );
//   };
  
//   return (
//     <Dialog open={true} onOpenChange={onCancel}>
//       <DialogContent className="sm:max-w-[425px]">
//         <DialogHeader>
//           <DialogTitle>
//             {isEditing ? 'Edit Project Stage' : 'Add Stage to Project'}
//           </DialogTitle>
//         </DialogHeader>
        
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
//             {!isEditing && (
//               <FormField
//                 control={form.control}
//                 name="stageId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Stage</FormLabel>
//                     <Select onValueChange={field.onChange} defaultValue={field.value}>
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select a stage" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         {availableStages.map(stage => (
//                           <SelectItem key={stage._id} value={stage._id}>
//                             {stage.stage_name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             )}
            
//             <FormField
//               control={form.control}
//               name="status"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Status</FormLabel>
//                   <Select onValueChange={field.onChange} defaultValue={field.value}>
//                     <FormControl>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select status" />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       <SelectItem value="Ongoing">Ongoing</SelectItem>
//                       <SelectItem value="Completed">Completed</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
            
//             {status === 'Ongoing' && (
//               <FormField
//                 control={form.control}
//                 name="startDate"
//                 render={({ field }) => (
//                   <FormItem className="flex flex-col">
//                     <FormLabel>Start Date</FormLabel>
//                     <Popover>
//                       <PopoverTrigger asChild>
//                         <FormControl>
//                           <Button
//                             variant={"outline"}
//                             className={cn(
//                               "w-full pl-3 text-left font-normal",
//                               !field.value && "text-muted-foreground"
//                             )}
//                           >
//                             {field.value ? (
//                               format(new Date(field.value), "PPP")
//                             ) : (
//                               <span>Pick a date</span>
//                             )}
//                             <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                           </Button>
//                         </FormControl>
//                       </PopoverTrigger>
//                       <PopoverContent className="w-auto p-0" align="start">
//                         <Calendar
//                           mode="single"
//                           selected={field.value ? new Date(field.value) : undefined}
//                           onSelect={(date) => {
//                             if (date) {
//                               field.onChange(format(date, 'yyyy-MM-dd'));
//                             }
//                           }}
//                           disabled={(date) =>
//                             date > new Date() || date < new Date("1900-01-01")
//                           }
//                           initialFocus
//                         />
//                       </PopoverContent>
//                     </Popover>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             )}
            
//             {status === 'Completed' && (
//               <FormField
//                 control={form.control}
//                 name="completionDate"
//                 render={({ field }) => (
//                   <FormItem className="flex flex-col">
//                     <FormLabel>Completion Date</FormLabel>
//                     <Popover>
//                       <PopoverTrigger asChild>
//                         <FormControl>
//                           <Button
//                             variant={"outline"}
//                             className={cn(
//                               "w-full pl-3 text-left font-normal",
//                               !field.value && "text-muted-foreground"
//                             )}
//                           >
//                             {field.value ? (
//                               format(new Date(field.value), "PPP")
//                             ) : (
//                               <span>Pick a date</span>
//                             )}
//                             <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                           </Button>
//                         </FormControl>
//                       </PopoverTrigger>
//                       <PopoverContent className="w-auto p-0" align="start">
//                         <Calendar
//                           mode="single"
//                           selected={field.value ? new Date(field.value) : undefined}
//                           onSelect={(date) => {
//                             if (date) {
//                               field.onChange(format(date, 'yyyy-MM-dd'));
//                             }
//                           }}
//                           disabled={(date) =>
//                             date > new Date() || date < new Date("1900-01-01")
//                           }
//                           initialFocus
//                         />
//                       </PopoverContent>
//                     </Popover>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             )}
            
//             <DialogFooter>
//               <Button type="button" variant="outline" onClick={onCancel}>
//                 Cancel
//               </Button>
//               <Button type="submit">
//                 {isEditing ? 'Update Stage' : 'Add Stage'}
//               </Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// };



