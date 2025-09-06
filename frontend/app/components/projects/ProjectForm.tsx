// frontend/app/components/projects/projectForm.tsx
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { projectSchema, type ProjectEntry } from "@/lib/schema";
import { z } from "zod";

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  project?: ProjectEntry | null;
  onSubmit: (values: z.infer<typeof projectSchema>) => void;
}

// Helper function to format date as YYYY-MM-DD without timezone conversion
const formatDateForSubmission = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const ProjectForm: React.FC<ProjectFormProps> = ({
  isOpen,
  onClose,
  project,
  onSubmit
}) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      project_name: "",
      description: "",
      status: "Pending",
      created_at: new Date().toISOString().split('T')[0],
    },
  });

  // Reset form when project changes or dialog opens/closes
  useEffect(() => {
    if (isOpen && project) {
      // Editing existing project
      const projectDate = new Date(project.created_at);
      setDate(projectDate);
      form.reset({
        project_name: project.project_name || "",
        description: project.description || "",
        status: project.status || "Pending",
        created_at: project.created_at,
      });
    } else if (isOpen) {
      // Creating new project
      const today = new Date();
      setDate(today);
      form.reset({
        project_name: "",
        description: "",
        status: "Pending",
        created_at: formatDateForSubmission(today),
      });
    } else {
      // Dialog closed
      form.reset();
      setDate(undefined);
    }
  }, [isOpen, project, form]);

  // Handle date selection from calendar
  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      // Format date as YYYY-MM-DD for form submission without timezone conversion
      const formattedDate = formatDateForSubmission(selectedDate);
      form.setValue("created_at", formattedDate);
    }
  };

  const handleSubmit = (values: z.infer<typeof projectSchema>) => {
    onSubmit(values);
    form.reset();
    setDate(undefined);
  };

  const handleCancel = () => {
    form.reset();
    setDate(undefined);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {project ? "Edit Project" : "Create Project"}
          </DialogTitle>
          <DialogDescription>
            {project ? "Update the project details below." : "Fill in the details to create a new project."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="project_name"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Project Name" {...field} />
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
                    <Textarea placeholder="Enter Project Description" className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Ongoing">Ongoing</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="created_at"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Created At</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          {date ? (
                            format(date, "PPP")
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
                        selected={date}
                        onSelect={handleDateSelect}
                        disabled={(date) => date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="mt-4">
              <Button type="submit">
                {project ? "Update Project" : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};