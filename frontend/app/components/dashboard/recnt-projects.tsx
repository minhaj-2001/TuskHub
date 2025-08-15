// import React from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { useProjects } from "@/hooks/use-project";
// import { useNavigate } from "react-router-dom";

// const RecentProjects = () => {
//   const { projects, loading } = useProjects();
//   const navigate = useNavigate();

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'Pending': return 'bg-yellow-100 text-yellow-800';
//       case 'Ongoing': return 'bg-blue-100 text-blue-800';
//       case 'Completed': return 'bg-green-100 text-green-800';
//       case 'Archived': return 'bg-gray-100 text-gray-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   return (
//     <Card>
//       <CardHeader className="flex flex-row items-center justify-between">
//         <CardTitle>Recent Projects</CardTitle>
//         <Button 
//           variant="outline" 
//           onClick={() => navigate('/dashboard/projects/create')}
//         >
//           New Project
//         </Button>
//       </CardHeader>
//       <CardContent>
//         {loading ? (
//           <div className="text-center py-4">Loading projects...</div>
//         ) : projects.length === 0 ? (
//           <div className="text-center py-4">
//             <p className="text-gray-500 mb-2">No projects found</p>
//             <Button 
//               onClick={() => navigate('/dashboard/projects/create')}
//             >
//               Create Your First Project
//             </Button>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {projects.slice(0, 5).map((project) => (
//               <div key={project._id} className="flex items-center justify-between">
//                 <div>
//                   <h3 className="font-medium">{project.project_name}</h3>
//                   <p className="text-sm text-gray-500">{project.owner.name}</p>
//                 </div>
//                 <Badge className={getStatusColor(project.status)}>
//                   {project.status}
//                 </Badge>
//               </div>
//             ))}
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// export default RecentProjects;