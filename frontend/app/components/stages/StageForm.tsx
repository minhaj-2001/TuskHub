// frontend/components/stages/StageForm.tsx
import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stageSchema, type StageEntry } from "@/lib/schema";
import { z } from "zod";

interface StageFormProps {
  stage?: StageEntry | null;
  isEditing?: boolean;
  onSubmit: (values: z.infer<typeof stageSchema>) => void;
  onCancel: () => void;
}

export const StageForm: React.FC<StageFormProps> = ({
  stage,
  isEditing = false,
  onSubmit,
  onCancel
}) => {
  const form = useForm<z.infer<typeof stageSchema>>({
    resolver: zodResolver(stageSchema),
    defaultValues: {
      stage_name: stage?.stage_name || "",
      description: stage?.description || "",
    },
  });

  // Reset form when stage changes or dialog opens/closes
  useEffect(() => {
    if (stage) {
      form.reset({
        stage_name: stage.stage_name || "",
        description: stage.description || "",
      });
    } else {
      form.reset({
        stage_name: "",
        description: "",
      });
    }
  }, [stage, form]);

  const handleSubmit = (values: z.infer<typeof stageSchema>) => {
    onSubmit(values);
    form.reset();
  };

  const handleCancel = () => {
    form.reset();
    onCancel();
  };

  return (
    <Dialog open={true} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Stage" : "Add Stage"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
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
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Update Stage" : "Add Stage"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};