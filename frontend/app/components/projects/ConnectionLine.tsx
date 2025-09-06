import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type StageConnectionEntry } from "@/lib/schema";

interface ConnectionLineProps {
  connection: StageConnectionEntry;
  onRemove: (connectionId: string) => void;
  position: {
    x: number;
    y: number;
  };
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({ 
  connection, 
  onRemove,
  position
}) => {
  return (
    <div 
      className="absolute pointer-events-auto z-30" 
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <Button
        variant="outline"
        size="sm"
        className="bg-white shadow-md hover:bg-red-50 hover:text-red-600 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(connection._id);
        }}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};