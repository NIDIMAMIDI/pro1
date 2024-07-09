import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// const DB = process.env.DATABASE_LOCAL
mongoose.connect(DB).then((con) => {
    // console.log(con.connections);
  console.log('DB connection is successful');
 })//.catch(err => {
//   console.error('DB connection error:', err);
// });


// process.on('unhandledRejection', err=>{
//   console.log(err.name, err.message);
//   console.log('Unhandled REjection ! Shut Down');
//   process.exit(1);
// })
