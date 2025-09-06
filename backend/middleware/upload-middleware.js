// // backend/middleware/upload-middleware.js
// import multer from 'multer';

// // Configure multer for file uploads
// const storage = multer.memoryStorage(); // Store files in memory for PDF generation

// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 10 * 1024 * 1024, // 10MB limit
//   },
//   fileFilter: (req, file, cb) => {
//     // Accept only PDF files
//     if (file.mimetype === 'application/pdf') {
//       cb(null, true);
//     } else {
//       cb(new Error('Only PDF files are allowed'), false);
//     }
//   },
// });

// export default upload;