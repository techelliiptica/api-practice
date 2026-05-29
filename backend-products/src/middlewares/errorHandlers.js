function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `Route not found: ${req.method} ${req.originalUrl}`
    }
  });
}

function errorHandler(err, req, res, next) {
  const status = Number(err.status || err.statusCode || 500);
  const code = err.code || (status === 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR");
  const message = err.message || "Something went wrong";

  res.status(status).json({
    error: {
      code,
      message,
      details: err.details || undefined
    }
  });
}

module.exports = { notFoundHandler, errorHandler };

