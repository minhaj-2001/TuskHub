// import { useState, useEffect, useRef } from 'react';
// import { Chart as ChartJS, type ChartData, type ChartOptions } from 'chart.js';

// interface UseChartProps {
//   type: 'pie' | 'bar' | 'line' | 'doughnut' | 'radar' | 'polarArea' | 'bubble' | 'scatter';
//   data: ChartData;
//   options?: ChartOptions;
// }

// export const useChart = ({ type, data, options }: UseChartProps) => {
//   const chartRef = useRef<HTMLCanvasElement>(null);
//   const chartInstance = useRef<ChartJS | null>(null);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const [isInitialized, setIsInitialized] = useState(false);

//   useEffect(() => {
//     if (!chartRef.current) return;

//     // Destroy previous chart instance if it exists
//     if (chartInstance.current) {
//       chartInstance.current.destroy();
//       chartInstance.current = null;
//     }

//     // Clear the canvas
//     const canvas = chartRef.current;
//     const ctx = canvas.getContext('2d');
//     if (!ctx) return;

//     // Clear any existing content
//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     // Create new chart instance
//     chartInstance.current = new ChartJS(ctx, {
//       type,
//       data,
//       options: options || {
//         responsive: true,
//         maintainAspectRatio: false,
//       },
//     });

//     setIsInitialized(true);

//     // Cleanup function to destroy chart when component unmounts
//     return () => {
//       if (chartInstance.current) {
//         chartInstance.current.destroy();
//         chartInstance.current = null;
//       }
//       setIsInitialized(false);
//     };
//   }, [type, data, options]);

//   // Handle container resize
//   useEffect(() => {
//     const handleResize = () => {
//       if (chartInstance.current && isInitialized) {
//         chartInstance.current.resize();
//       }
//     };

//     const resizeObserver = new ResizeObserver(handleResize);
//     if (containerRef.current) {
//       resizeObserver.observe(containerRef.current);
//     }

//     return () => {
//       resizeObserver.disconnect();
//     };
//   }, [isInitialized]);

//   return {
//     chartRef,
//     containerRef,
//     isInitialized,
//   };
// };