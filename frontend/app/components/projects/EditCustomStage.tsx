import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { type StageEntry } from "@/lib/schema";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api-v1";

const customStageSchema = z.object({
  stage_name: z.string().min(1, { message: "Stage name is required" }),
  description: z.string().optional(),
});

type CustomStageValues = z.infer<typeof customStageSchema>;

interface EditCustomStageProps {
  stage: StageEntry;
  projectId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void; // Changed from onClose to onOpenChange
  onSuccess: () => void;
}

export const EditCustomStage: React.FC<EditCustomStageProps> = ({
  stage,
  projectId,
  isOpen,
  onOpenChange,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<CustomStageValues>({
    resolver: zodResolver(customStageSchema),
    defaultValues: {
      stage_name: stage.stage_name,
      description: stage.description || "",
    },
  });

  const handleSubmit = async (values: CustomStageValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/stages/update-stage/${stage._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update custom stage");
      }

      onSuccess();
      onOpenChange(false); // Close the dialog after successful update
    } catch (err) {
      console.error("Error updating custom stage:", err);
      setError(err instanceof Error ? err.message : "Failed to update custom stage");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false); // Close the dialog when cancel is clicked
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
            Edit Custom Stage
          </DialogTitle>
          <DialogDescription>
            Update the name and description for this custom stage. Changes will be reflected across all projects using this stage.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="stage_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stage Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter stage name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter stage description" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Project:</span> {projectId}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Stage Type:</span> Custom (Project Specific)
              </p>
            </div>
            
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Stage"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};