// frontend/app/component/dashboard/StatsCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface StatsCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: any;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  color?: string;
  filterType?: 'all' | 'ongoing' | 'completed' | 'pending';
  onClick?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  color = "bg-blue-50",
  filterType,
  onClick
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    
    if (filterType) {
      // Navigate to projects page with filter
      // For "all", use "all" directly, for others use proper case (first letter capitalized)
      const filterValue = filterType === 'all' ? 'all' : filterType.charAt(0).toUpperCase() + filterType.slice(1);
      console.log(`Navigating to /projects?filter=${filterValue}`); // Debug log
      navigate(`/projects?filter=${filterValue}`);
    }
  };

  const getCardColor = () => {
    switch (filterType) {
      case 'ongoing': return 'bg-blue-50 hover:bg-blue-100 border-blue-200';
      case 'completed': return 'bg-green-50 hover:bg-green-100 border-green-200';
      case 'pending': return 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200';
      default: return `${color} hover:bg-gray-100`;
    }
  };

  const getIconColor = () => {
    switch (filterType) {
      case 'ongoing': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getBadgeColor = () => {
    switch (filterType) {
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${getCardColor()} ${className}`}
      onClick={handleClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {title}
          {filterType && (
            <Badge className={getBadgeColor()}>
              {filterType}
            </Badge>
          )}
        </CardTitle>
        <Icon className={`h-5 w-5 ${getIconColor()}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div className={`flex items-center text-xs mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <span>{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
            <span className="ml-1">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};





// import React from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { useNavigate } from "react-router-dom";

// interface StatsCardProps {
//   title: string;
//   value: number | string;
//   description?: string;
//   icon: any;
//   trend?: {
//     value: number;
//     isPositive: boolean;
//   };
//   className?: string;
//   color?: string;
//   filterType?: 'all' | 'ongoing' | 'completed' | 'pending';
//   onClick?: () => void;
// }

// export const StatsCard: React.FC<StatsCardProps> = ({
//   title,
//   value,
//   description,
//   icon: Icon,
//   trend,
//   className,
//   color = "bg-blue-50",
//   filterType,
//   onClick
// }) => {
//   const navigate = useNavigate();
  
//   const handleClick = () => {
//     if (onClick) {
//       onClick();
//       return;
//     }
    
//     if (filterType) {
//       // Navigate to projects page with filter
//       navigate(`/projects?filter=${filterType}`);
//     }
//   };

//   const getCardColor = () => {
//     switch (filterType) {
//       case 'ongoing': return 'bg-blue-50 hover:bg-blue-100 border-blue-200';
//       case 'completed': return 'bg-green-50 hover:bg-green-100 border-green-200';
//       case 'pending': return 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200';
//       default: return `${color} hover:bg-gray-100`;
//     }
//   };

//   const getIconColor = () => {
//     switch (filterType) {
//       case 'ongoing': return 'text-blue-600';
//       case 'completed': return 'text-green-600';
//       case 'pending': return 'text-yellow-600';
//       default: return 'text-gray-600';
//     }
//   };

//   const getBadgeColor = () => {
//     switch (filterType) {
//       case 'ongoing': return 'bg-blue-100 text-blue-800';
//       case 'completed': return 'bg-green-100 text-green-800';
//       case 'pending': return 'bg-yellow-100 text-yellow-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   return (
//     <Card 
//       className={`cursor-pointer transition-all duration-200 ${getCardColor()} ${className}`}
//       onClick={handleClick}
//     >
//       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//         <CardTitle className="text-sm font-medium flex items-center gap-2">
//           {title}
//           {filterType && (
//             <Badge className={getBadgeColor()}>
//               {filterType}
//             </Badge>
//           )}
//         </CardTitle>
//         <Icon className={`h-5 w-5 ${getIconColor()}`} />
//       </CardHeader>
//       <CardContent>
//         <div className="text-3xl font-bold">{value}</div>
//         {description && (
//           <p className="text-xs text-muted-foreground mt-1">
//             {description}
//           </p>
//         )}
//         {trend && (
//           <div className={`flex items-center text-xs mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
//             <span>{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
//             <span className="ml-1">from last month</span>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// };









// import React from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Icon } from "lucide-react";

// interface StatsCardProps {
//   title: string;
//   value: number | string;
//   description?: string;
//   icon: any; // Using any for icon to avoid type issues with lucide-react
//   trend?: {
//     value: number;
//     isPositive: boolean;
//   };
//   className?: string;
// }

// export const StatsCard: React.FC<StatsCardProps> = ({
//   title,
//   value,
//   description,
//   icon: Icon,
//   trend,
//   className
// }) => {
//   return (
//     <Card className={className}>
//       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//         <CardTitle className="text-sm font-medium">{title}</CardTitle>
//         <Icon className="h-4 w-4 text-muted-foreground" />
//       </CardHeader>
//       <CardContent>
//         <div className="text-2xl font-bold">{value}</div>
//         {description && (
//           <p className="text-xs text-muted-foreground mt-1">
//             {description}
//           </p>
//         )}
//         {trend && (
//           <div className={`flex items-center text-xs mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
//             <span>{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
//             <span className="ml-1">from last month</span>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// };