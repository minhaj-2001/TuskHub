// frontend/app/components/loader.tsx
import { Loader2 } from "lucide-react";

interface LoaderProps {
  className?: string;
}

export const Loader = ({ className }: LoaderProps) => {
  return (
    <div className="flex justify-center items-center">
      <Loader2 className={`h-8 w-8 animate-spin ${className || ""}`} />
    </div>
  );
};

// Optional: Default export for backward compatibility
export default Loader;