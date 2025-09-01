import app from './app.js';
import logger from './utils/logger.js';

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

export default app;
