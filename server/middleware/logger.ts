import morgan from 'morgan';

export const requestLogger = morgan(
  process.env.NODE_ENV === 'development' ? 'dev' : 'combined'
);

