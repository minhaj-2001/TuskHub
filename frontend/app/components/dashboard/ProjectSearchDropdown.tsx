// frontend/app/component/dashboard/ProjectSearchDropdown.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useProjects } from "@/hooks/use-projects";

interface ProjectSearchDropdownProps {
  onProjectSelect: (project: any) => void;
  selectedProject?: any;
}

export const ProjectSearchDropdown: React.FC<ProjectSearchDropdownProps> = ({ 
  onProjectSelect, 
  selectedProject 
}) => {
  const { projects } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Filter projects based on search term
  useEffect(() => {
    if (!searchTerm) {
      // Show all projects when no search term
      setFilteredProjects(projects);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = projects.filter(project =>
      project.project_name.toLowerCase().includes(term) ||
      (project.description && project.description.toLowerCase().includes(term))
    );
    
    setFilteredProjects(filtered);
  }, [searchTerm, projects]);
  
  const handleProjectClick = (project: any) => {
    onProjectSelect(project);
    setIsOpen(false);
    setSearchTerm('');
  };
  
  const clearSelection = () => {
    onProjectSelect(null);
    setSearchTerm('');
  };
  
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Ongoing': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full max-w-md" ref={dropdownRef}>
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search projects..."
              value={selectedProject ? selectedProject.project_name : searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsOpen(true)}
              className="pl-10 pr-10"
            />
            {selectedProject && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={clearSelection}
              >
                ×
              </Button>
            )}
          </div>
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1"
          >
            Select
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </div>
        
        {isOpen && (
          <Card className="absolute z-10 w-full mt-1 shadow-lg">
            <CardContent className="p-0">
              <div className="max-h-80 overflow-y-auto">
                {filteredProjects.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No projects found
                  </div>
                ) : (
                  <div className="py-1">
                    {filteredProjects.map((project) => (
                      <div
                        key={project._id}
                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleProjectClick(project)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium break-words">{project.project_name}</div>
                            {project.description && (
                              <div className="text-sm text-gray-500 mt-1 break-words">
                                {project.description}
                              </div>
                            )}
                            <div className="text-xs text-gray-400 mt-1">
                              Created: {new Date(project.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="ml-2 flex-shrink-0">
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                              {project.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};






// import React, { useState, useEffect } from 'react';
// import { Search, ChevronDown } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent } from "@/components/ui/card";
// import { useProjects } from "@/hooks/use-projects";

// interface ProjectSearchDropdownProps {
//   onProjectSelect: (project: any) => void;
//   selectedProject?: any;
// }

// export const ProjectSearchDropdown: React.FC<ProjectSearchDropdownProps> = ({ 
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
  
//   const getStatusColor = (status?: string) => {
//     switch (status) {
//       case 'Pending': return 'bg-yellow-100 text-yellow-800';
//       case 'Ongoing': return 'bg-blue-100 text-blue-800';
//       case 'Completed': return 'bg-green-100 text-green-800';
//       case 'Archived': return 'bg-gray-100 text-gray-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   return (
//     <div className="w-full">
//       <div className="relative">
//         <div className="flex gap-2">
//           <div className="relative flex-1">
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
//                 ×
//               </Button>
//             )}
//           </div>
//           <Button 
//             variant="outline" 
//             onClick={() => setIsOpen(!isOpen)}
//             className="flex items-center gap-1"
//           >
//             Select
//             <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
//           </Button>
//         </div>
        
//         {isOpen && (
//           <Card className="absolute z-10 w-full mt-1 shadow-lg">
//             <CardContent className="p-0">
//               <div className="max-h-80 overflow-y-auto">
//                 {filteredProjects.length === 0 ? (
//                   <div className="p-4 text-center text-gray-500">
//                     No projects found
//                   </div>
//                 ) : (
//                   <div className="py-1">
//                     {filteredProjects.map((project) => (
//                       <div
//                         key={project._id}
//                         className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
//                         onClick={() => handleProjectClick(project)}
//                       >
//                         <div className="flex justify-between items-start">
//                           <div className="flex-1 min-w-0">
//                             <div className="font-medium truncate">{project.project_name}</div>
//                             {project.description && (
//                               <div className="text-sm text-gray-500 mt-1 break-words">
//                                 {project.description}
//                               </div>
//                             )}
//                             <div className="text-xs text-gray-400 mt-1">
//                               Created: {new Date(project.created_at).toLocaleDateString()}
//                             </div>
//                           </div>
//                           <div className="ml-2 flex-shrink-0">
//                             <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
//                               {project.status}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </div>
//   );
// };