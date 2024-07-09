import express from 'express';
import morgan from 'morgan';
import path from 'path';
import rateLimit from "express-rate-limit"
import helmet from "helmet"
import mongoSanitize from "express-mongo-sanitize"
import xss from "xss-clean"
import hpp from "hpp"
import cookieParser from 'cookie-parser';
import AppError from './utils/appError.js';
import { globalError } from './controllers/errorController.js';
import dotenv from 'dotenv';
dotenv.config();
import { fileURLToPath } from 'url';
import './db.js'
import router from "./routes/viewRoutes.js"
import route from './routes/route.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT || 3000
const app = express();

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))



//serving static File
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

console.log(process.env.NODE_ENV);  // This should now show 'development'
// global middlewares
// set security HTTP headers
app.use(helmet())


//environment loggers
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// limit requests from the same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});

app.use('/api',limiter);


//Body parser, reading data from the body into the parser
app.use(express.json({limit: '10kb'}));
app.use(cookieParser())



//Data sanitization aganist NoSQL query injection
app.use(mongoSanitize())

//Data sanitization aganist xss
app.use(xss())


//prevent parameter pollution
app.use(hpp({
  whitelist:[
    'duration',
    'ratingsQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'price'
  ]
}));



// app.use((req, res, next) => {
//   console.log('Hello from middleware');
//   next();
// });

//Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});


app.use("/", router)

app.use('/api/v1/', route);



app.all("*", (req, res, next)=>{
  // res.status(404).json({
  //   status:"Fail",
  //   message:`Can't find ${req.originalUrl} on the server`
  // })

  // const err = new Error(`Can't find ${req.originalUrl} on the server`)
  // err.status = 'fail',
  // err.statusCode = 404
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404))
})

app.use(globalError)


app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "ws://localhost:60009", "http://127.0.0.1:3000"]
      // Add other directives as needed
    },
  })
);

const server = app.listen(port, () => {
    console.log(`Server started at ${port}`);
});



process.on('unhandledRejection', err=>{
  console.log(err.name, err.message);
  console.log('Unhandled REjection ! Shut Down');
  server.close(()=>{
    process.exit(1);
  })
})


//  export default app;