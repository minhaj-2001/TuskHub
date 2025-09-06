// import React from 'react';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// interface StageProgressData {
//   name: string;
//   ongoing: number;
//   completed: number;
// }

// interface StageProgressChartProps {
//   data: StageProgressData[];
// }

// export const StageProgressChart: React.FC<StageProgressChartProps> = ({ data }) => {
//   // Check if there's any data to display
//   const hasData = data.some(item => item.ongoing > 0 || item.completed > 0);
  
//   return (
//     <Card className="col-span-1">
//       <CardHeader>
//         <CardTitle>Stage Progress Over Time</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="h-80">
//           {hasData ? (
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart
//                 data={data}
//                 margin={{
//                   top: 20,
//                   right: 30,
//                   left: 20,
//                   bottom: 5,
//                 }}
//               >
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="name" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Bar dataKey="ongoing" fill="#8884d8" name="Ongoing Stages" />
//                 <Bar dataKey="completed" fill="#82ca9d" name="Completed Stages" />
//               </BarChart>
//             </ResponsiveContainer>
//           ) : (
//             <div className="flex items-center justify-center h-full text-gray-500">
//               <div className="text-center">
//                 <p className="mb-2">No stage data available</p>
//                 <p className="text-sm">Create stages to see progress over time</p>
//               </div>
//             </div>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// };