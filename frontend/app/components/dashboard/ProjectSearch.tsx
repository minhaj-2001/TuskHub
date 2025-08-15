// import React, { useState, useEffect } from 'react';
// import { Search, X } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { 
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { useProjects } from "@/hooks/use-projects";

// interface ProjectSearchProps {
//   onProjectSelect: (project: any) => void;
//   selectedProject?: any;
// }

// export const ProjectSearch: React.FC<ProjectSearchProps> = ({ 
//   onProjectSelect, 
//   selectedProject 
// }) => {
//   const { projects } = useProjects();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isOpen, setIsOpen] = useState(false);
//   const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  
//   // Filter projects based on search term
//   useEffect(() => {
//     if (!searchTerm) {
//       setFilteredProjects(projects.slice(0, 5)); // Show first 5 projects when no search term
//       return;
//     }
    
//     const term = searchTerm.toLowerCase();
//     const filtered = projects.filter(project =>
//       project.project_name.toLowerCase().includes(term) ||
//       (project.description && project.description.toLowerCase().includes(term))
//     );
    
//     setFilteredProjects(filtered);
//   }, [searchTerm, projects]);
  
//   const handleProjectClick = (project: any) => {
//     onProjectSelect(project);
//     setIsOpen(false);
//     setSearchTerm('');
//   };
  
//   const clearSelection = () => {
//     onProjectSelect(null);
//     setSearchTerm('');
//   };
  
//   return (
//     <div className="relative w-full max-w-md">
//       <Popover open={isOpen} onOpenChange={setIsOpen}>
//         <PopoverTrigger asChild>
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//             <Input
//               placeholder="Search projects..."
//               value={selectedProject ? selectedProject.project_name : searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               onFocus={() => setIsOpen(true)}
//               className="pl-10 pr-10"
//             />
//             {selectedProject && (
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
//                 onClick={clearSelection}
//               >
//                 <X className="h-4 w-4" />
//               </Button>
//             )}
//           </div>
//         </PopoverTrigger>
//         <PopoverContent className="w-full p-0" align="start">
//           <div className="max-h-80 overflow-y-auto">
//             {filteredProjects.length === 0 ? (
//               <div className="p-4 text-center text-gray-500">
//                 No projects found
//               </div>
//             ) : (
//               <div className="py-1">
//                 {filteredProjects.map((project) => (
//                   <div
//                     key={project._id}
//                     className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
//                     onClick={() => handleProjectClick(project)}
//                   >
//                     <div>
//                       <div className="font-medium">{project.project_name}</div>
//                       <div className="text-sm text-gray-500 truncate max-w-xs">
//                         {project.description || "No description"}
//                       </div>
//                     </div>
//                     <div className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
//                       {project.status}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </PopoverContent>
//       </Popover>
//     </div>
//   );
// };