import AppError from "./../utils/appError.js";

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateErrorDB = err => {
  const value = err.errorResponse.errmsg.match(/(["'])(\\?.)*?\1/)[0]
  console.log(value);
  const message = `Duplicate field value: ${value} please use another value`
  return new AppError(message, 400)
}

const handleValidationErrorDB = err => {

  const errors = Object.values(err.errors).map(el=>el.message);

  const message = `Invalid input DAta. ${errors.join('. ')}`
  return new AppError(message, 400)
}


const handleJWTError = ()=>{
  return new AppError("Invalid token, please login again", 401)
}


const handleJWTExpiredError = () =>{
  return new AppError("Your token has been expired, please login again", 401)
}

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    console.error('Error', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong'
    });
  }
};

export const globalError = (err, req, res, next) => {
  console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    console.log(err.name);
    if (err.name === 'CastError') error = handleCastErrorDB(error); // Handle CastError specifically
    if(error.code === 11000) error = handleDuplicateErrorDB(error)
    if(err.name === 'ValidationError') error = handleValidationErrorDB(error)

    if(err.name === 'JsonWebTokenError')  error = handleJWTError()
    if(err.name === 'TokenExpiredError') error = handleJWTExpiredError()
    sendErrorProd(error, res);
  }
};

