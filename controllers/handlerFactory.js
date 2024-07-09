import { catchAsync } from "./../utils/catchAsync.js";
import AppError from "./../utils/appError.js";
import APIFeatures from "../utils/apiFeatures.js"
export const deleteOne = Model => catchAsync(async(req, res, next) => {
    
    const doc = await Model.findByIdAndDelete(req.params.id)
    // console.log(doc);
    if(!doc){
        return next(new AppError('NO document found with that Id', 404));
    }
    res.status(204)
    .json({
            status: "success",
            data: null
    });
})

export const updateOne = Model => catchAsync(async (req, res,next) => {
   
    console.log("djndjdjjd")

    const data = await Model.findByIdAndUpdate(req.params.id, req.body,{
        new :true,
        runValidators:true
    })
    console.log("jhj",data);
    if(!data){
        return next(new AppError('NO document found with that Id', 404));
    }
    res.status(200)
        .json({
            status: "success",
            updatedData: {
                data
            }
        });
   
})

export const createOne = Model => catchAsync(async (req, res, next) => {
    
    const doc =  await Model.create(req.body)
    res.status(200)
        .json({
            status: "success",
            data: {
                doc
            }
        });
    
})


export const getOne = (Model, popOptions) => 
    catchAsync(async(req, res, next) => {
    
    let query = Model.findById(req.params.id)

    if(popOptions)query.populate(popOptions)
    const doc = await query
    // const doc = await Model.findById(req.params.id).populate('reviews')
    
    
    if(!doc){
        return next(new AppError('NO document found with that Id', 404));
    }
    res.status(200)
    .json({
        status: "success",
        data:{
                data:doc
        }
    });

})

export const getAll = Model=>
    catchAsync(async (req, res, next) => {
        // To allow for nested GET reviews on the tour
        let filter = {}
        if(req.params.tourID) filter = {tour : req.params.tourID}
    
        const features = new APIFeatures(Model.find(filter), req.query).filter().sort().limitFields().pagination();

        const docs = await features.query;

        res.status(200).json({
            status: "success",
            count: docs.length,
            toursData: {
                docs
            }
        });
   
})


