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