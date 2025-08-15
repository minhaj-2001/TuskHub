// "use client";
// import React, { useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { projectSchema } from "@/lib/schema";
// import { z } from "zod";
// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { useProjects } from "@/hooks/use-projects";
// import { useRouter } from "next/navigation";
// import { Loader } from "@/components/loader";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { TriangleAlert } from "lucide-react";

// const CreateProject = () => {
//   const router = useRouter();
//   const { createProject, isLoading, error } = useProjects();
//   const [formError, setFormError] = useState<string | null>(null);

//   const form = useForm<z.infer<typeof projectSchema>>({
//     resolver: zodResolver(projectSchema),
//     defaultValues: {
//       project_name: "",
//       description: "",
//       created_at: new Date().toISOString().split('T')[0],
//       status: "Pending",
//     },
//   });

//   const handleSubmit = async (values: z.infer<typeof projectSchema>) => {
//     try {
//       setFormError(null);
//       // Format the date to ISO string if it's a Date object
//       const formattedValues = {
//         ...values,
//         created_at: values.created_at
//           ? ((values.created_at as any) instanceof Date
//               ? (values.created_at as unknown as Date).toISOString().split('T')[0]
//               : values.created_at)
//           : "",
//       };
//       await createProject(formattedValues);
//       router.push("/admin-dashboard"); // Redirect to admin dashboard after successful creation
//     } catch (err) {
//       setFormError("Failed to create project. Please try again.");
//     }
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <div className="max-w-2xl mx-auto">
//         <h3 className="text-2xl font-bold mb-6">Create New Project</h3>
        
//         {(error || formError) && (
//           <Alert variant="destructive" className="mb-4">
//             <TriangleAlert className="h-4 w-4" />
//             <AlertTitle>Error</AlertTitle>
//             <AlertDescription>{error || formError}</AlertDescription>
//           </Alert>
//         )}

//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
//             <FormField
//               control={form.control}
//               name="project_name"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Project Name</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Enter Project Name" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="description"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Description</FormLabel>
//                   <FormControl>
//                     <Textarea 
//                       placeholder="Enter Project Description" 
//                       className="min-h-[100px]"
//                       {...field} 
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="created_at"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Created At</FormLabel>
//                   <FormControl>
//                     <Input 
//                       type="date" 
//                       {...field}
//                       value={field.value ? field.value.toString().split('T')[0] : ''}
//                       onChange={(e) => field.onChange(new Date(e.target.value))}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <Button type="submit" disabled={isLoading} className="w-full">
//               {isLoading ? <Loader /> : "Create Project"}
//             </Button>
//           </form>
//         </Form>
//       </div>
//     </div>
//   );
// };

// export default CreateProject;