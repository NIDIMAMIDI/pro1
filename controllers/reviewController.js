import {Review} from "./../model/reviewMode.js"
// import { catchAsync } from "../utils/catchAsync.js"
import {createOne, deleteOne, getAll, getOne, updateOne} from "./../controllers/handlerFactory.js"


export const getAllReviews = getAll(Review)

export const setTourUserId = (req, res, next)=>{
    if(!req.body.tour) req.body.tour = req.params.tourID;
    if(!req.body.user) req.body.user = req.user.id;
    next()
}

export const getReview = getOne(Review)
export const createReview = createOne(Review)
//5c88fa8cf4afda39709c296c

export const deleteReview = deleteOne(Review) 
export const updateReview = updateOne(Review)