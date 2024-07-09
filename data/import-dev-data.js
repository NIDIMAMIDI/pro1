import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({path:'./../.env'}); 
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Tour } from './../model/tourModel.js'; // Use named import for Tour
import { User } from '../model/userModel.js';
import { Review } from '../model/reviewMode.js';


// Ensure this is at the top

console.log(process.env.DATABASE);
console.log(process.env.DATABASE_PASSWORD);


// const DB = process.env.DATABASE.replace(
//   '<PASSWORD>',
//   process.env.DATABASE_PASSWORD
// );
const DB = process.env.DATABASE_LOCAL
mongoose.connect(DB).then(() => {
  console.log('DB connection is successful');
}).catch(err => {
  console.error('DB connection error:', err);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, {validateBeforeSave:false});
    await Review.create(reviews);
    console.log('Data Loaded Successfully');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data Deleted Successfully');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

console.log(process.argv);

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
