// frontend/app/components/projects/ConnectionLine.tsx
import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type StageConnectionEntry } from "@/lib/schema";

interface ConnectionLineProps {
  connection: StageConnectionEntry;
  onRemove: (connectionId: string) => void;
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({ connection, onRemove }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-20">
      {/* Remove connection button */}
      <Button
        variant="outline"
        size="sm"
        className="absolute pointer-events-auto z-30 bg-white shadow-md"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        }}
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