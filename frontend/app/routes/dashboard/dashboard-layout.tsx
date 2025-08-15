// frontend/app/component/routs/dashboard-layout.tsx
import { Header } from "@/components/layout/header";
import { SidebarComponent } from "@/components/layout/sidebar-component";
import { Loader } from "@/components/loader";
import { useAuth } from "@/provider/auth-context";
import { Navigate, Outlet, useLocation } from "react-router";
import { useState, useEffect } from "react";

const DashboardLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [selectedProject, setSelectedProject] = useState<any>(null);
  
  if (isLoading) {
    return <Loader />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }
  
  const handleProjectSelect = (project: any) => {
    console.log("DashboardLayout handleProjectSelect:", project); // Debug log
    setSelectedProject(project);
  };
  
  // Only pass the project selection context on the dashboard page
  const isDashboard = location.pathname === '/dashboard';
  
  return (
    <div className="flex h-screen w-full">
      <SidebarComponent />
      <div className="flex flex-1 flex-col h-full">
        <Header 
          onProjectSelect={isDashboard ? handleProjectSelect : undefined} 
          selectedProject={isDashboard ? selectedProject : undefined} 
        />
        <main className="flex-1 overflow-y-auto h-full w-full">
          <div className="mx-auto container px-2 sm:px-6 lg:px-8 py-0 md:py-8 w-full h-full">
            <Outlet context={{ selectedProject: isDashboard ? selectedProject : null }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;











// // frontend/app/component/routs/dashboard.tsx
// import { Header } from "@/components/layout/header";
// import { SidebarComponent } from "@/components/layout/sidebar-component";
// import { Loader } from "@/components/loader";
// import { useAuth } from "@/provider/auth-context";
// import { Navigate, Outlet, useLocation } from "react-router";
// import { useState, useEffect } from "react";

// const DashboardLayout = () => {
//   const { isAuthenticated, isLoading } = useAuth();
//   const location = useLocation();
//   const [selectedProject, setSelectedProject] = useState<any>(null);

//   if (isLoading) {
//     return <Loader />;
//   }
  
//   if (!isAuthenticated) {
//     return <Navigate to="/sign-in" state={{ from: location }} replace />;
//   }

//   const handleProjectSelect = (project: any) => {
//     setSelectedProject(project);
//   };

//   return (
//     <div className="flex h-screen w-full">
//       <SidebarComponent />
//       <div className="flex flex-1 flex-col h-full">
//         <Header 
//           onProjectSelect={handleProjectSelect} 
//           selectedProject={selectedProject} 
//         />
//         <main className="flex-1 overflow-y-auto h-full w-full">
//           <div className="mx-auto container px-2 sm:px-6 lg:px-8 py-0 md:py-8 w-full h-full">
//             <Outlet context={{ selectedProject }} />
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default DashboardLayout;



// // frontend/app/component/routs/dashboard.tsx
// import { Header } from "@/components/layout/header";
// import { SidebarComponent } from "@/components/layout/sidebar-component";
// import { Loader } from "@/components/loader";
// import { useAuth } from "@/provider/auth-context";
// import { Navigate, Outlet } from "react-router";

// const DashboardLayout = () => {
//   const { isAuthenticated, isLoading } = useAuth();

//   if (isLoading) {
//     return <Loader />;
//   }
  
//   if (!isAuthenticated) {
//     return <Navigate to="/sign-in" />;
//   }

//   return (
//     <div className="flex h-screen w-full">
//       <SidebarComponent />
//       <div className="flex flex-1 flex-col h-full">
//         <Header />
//         <main className="flex-1 overflow-y-auto h-full w-full">
//           <div className="mx-auto container px-2 sm:px-6 lg:px-8 py-0 md:py-8 w-full h-full">
//             <Outlet />
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default DashboardLayout;