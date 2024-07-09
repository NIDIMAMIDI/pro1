import {Tour} from "./../model/tourModel.js"
import { catchAsync } from "../utils/catchAsync.js"


export const overviewPage = catchAsync(async(req, res)=>{
    // 1.   Get tour data from Collection
    const tours = await Tour.find()

    // 2.Build template


    res.status(200).render('overview',{
      title:"All the tours",
      tours
    })
})

export const getTour = catchAsync(async(req, res)=>{
    const tour = await Tour.findOne({slug:req.params.slug}).populate({
      path : 'reviews',
      fields:'review rating user'
    })
    res.status(200).render('tour',{
      title:  `${tour.name} Tour`,
      tour
    })
})

export const getLoginForm = catchAsync(async(req, res, next)=>{
  res.status(200).render('login', {
    title:'Login to your account'
  })

})