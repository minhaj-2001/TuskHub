// frontend/app/components/projects/ConnectionForm.tsx
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { type ProjectStageEntry, type StageConnectionEntry } from "@/lib/schema";
import { ArrowRight } from "lucide-react";

interface ConnectionFormProps {
  stages: ProjectStageEntry[];
  connections: StageConnectionEntry[];
  onSubmit: (fromStageId: string, toStageId: string) => void;
  onCancel: () => void;
}

export const ConnectionForm: React.FC<ConnectionFormProps> = ({
  stages,
  connections,
  onSubmit,
  onCancel
}) => {
  const [fromStageId, setFromStageId] = useState<string>('');
  const [toStageId, setToStageId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = () => {
    if (!fromStageId || !toStageId) {
      setError("Please select both source and destination stages");
      return;
    }
    
    if (fromStageId === toStageId) {
      setError("Source and destination stages cannot be the same");
      return;
    }
    
    // Check if connection already exists
    const connectionExists = connections.some(conn => 
      conn.from_stage._id === fromStageId && conn.to_stage._id === toStageId
    );
    
    if (connectionExists) {
      setError("This connection already exists");
      return;
    }
    
    onSubmit(fromStageId, toStageId);
  };
  
  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connect Stages</DialogTitle>
          <DialogDescription>
            Create a connection between two stages in your project.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex items-center space-x-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">From Stage</label>
              <Select value={fromStageId} onValueChange={setFromStageId}>
                <SelectTrigger className="h-auto py-2">
                  <SelectValue placeholder="Select source stage" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map(stage => (
                    <SelectItem key={`from-${stage._id}`} value={stage._id} className="whitespace-normal">
                      <div className="max-w-xs">
                        <div className="whitespace-normal break-words">
                          {stage.stage.stage_name}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-center mt-6">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>
            
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">To Stage</label>
              <Select value={toStageId} onValueChange={setToStageId}>
                <SelectTrigger className="h-auto py-2">
                  <SelectValue placeholder="Select destination stage" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map(stage => (
                    <SelectItem key={`to-${stage._id}`} value={stage._id} className="whitespace-normal">
                      <div className="max-w-xs">
                        <div className="whitespace-normal break-words">
                          {stage.stage.stage_name}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Create Connection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};