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








// import { Loader2 } from "lucide-react";

// export const Loader = () => {
//   return (
//     <div className="flex items-center justify-center h-full">
//       <Loader2 className="w-10 h-10 animate-spin" />
//     </div>
//   );
// };
