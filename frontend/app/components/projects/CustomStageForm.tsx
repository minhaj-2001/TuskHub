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
import { AlertCircle } from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api-v1";

const customStageSchema = z.object({
  stage_name: z.string().min(1, { message: "Stage name is required" }),
  description: z.string().optional(),
});

type CustomStageValues = z.infer<typeof customStageSchema>;

interface CustomStageFormProps {
  projectId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CustomStageForm: React.FC<CustomStageFormProps> = ({
  projectId,
  onSuccess,
  onCancel
}) => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  const form = useForm<CustomStageValues>({
    resolver: zodResolver(customStageSchema),
    defaultValues: {
      stage_name: "",
      description: "",
    },
  });

  const handleSubmit = async (values: CustomStageValues) => {
    if (!projectId) return;
    
    setIsCreating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/stages/add-stage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...values,
          isCustom: true,
          projectId: projectId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create custom stage");
      }

      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Error creating custom stage:", error);
      setAlertMessage("Failed to create custom stage");
      setShowAlert(true);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Custom Stage</DialogTitle>
          <DialogDescription>
            Create a custom stage specific to this project.
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
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Custom Stage"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};