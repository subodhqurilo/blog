export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Console par error dikhaye development mein
  console.error(`❌ Error: ${err.message}`);

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    // Stack trace sirf development mode mein dikhayein
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};