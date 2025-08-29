export const errorHandler = (err, req, res, next) => {
  if (err.name === 'CastError' && err.path === '_id') {
    return res.status(400).json({
      status: 400,
      message: 'Invalid id',
      data: err.message,
    });
  }
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    status,
    message: status === 500 ? 'Something went wrong' : err.message || 'Error',
    data: err.message || null,
  });
};