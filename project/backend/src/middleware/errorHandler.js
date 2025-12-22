export const notFoundHandler = (req, res) => {
  const isPostgrest = req.originalUrl.startsWith('/rest/v1/');
  if (isPostgrest) {
    return res.status(404).json({
      message: 'Not Found',
      details: null,
      hint: null,
      code: 'PGRST404',
    });
  }

  return res.status(404).json({ message: 'Not Found' });
};

export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const isPostgrest = req.originalUrl.startsWith('/rest/v1/');

  if (isPostgrest) {
    return res.status(status).json({
      message: err.message || 'Server error',
      details: err.details || null,
      hint: err.hint || null,
      code: err.code || 'PGRST000',
    });
  }

  return res.status(status).json({
    message: err.message || 'Server error',
  });
};
