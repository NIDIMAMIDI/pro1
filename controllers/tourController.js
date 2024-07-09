
import {Tour} from "./../model/tourModel.js"

import { catchAsync } from "../utils/catchAsync.js"
import AppError from "../utils/appError.js"
import {deleteOne, updateOne, createOne, getOne, getAll} from "./../controllers/handlerFactory.js"



import multer from "multer"
import sharp from "sharp";


const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb)=>{
    if(file.mimetype.startsWith('image')){
        cb(null, true)
    }else{
        cb(new AppError('Not an Image! Please upload only images.', 400), false)
    }
}

export const resizeTourImages = catchAsync(async(req, res, next) => {
    
    if(!req.files.imageCover || !req.files.images) return next()

// 1) Image Cover
    const imageCoverFileName = `tour-${req.params.id}-${DAte.now()}-cover.jpeg`

    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({quality:90})
        .toFile(`public/img/tours/${imageCoverFileName}`)



        // 2) Images

    req.body.images = []

    await Promise.all(
        req.files.images.map(async(file, i)=>{
            const fileName = `tour-${req.params.id}-${DAte.now()}-${i + 1}.jpeg`

            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({quality:90})
                .toFile(`public/img/tours/${fileName}`)

            req.body.images.push(fileName)
        })
    )

    next()
})

const upload = multer({
    storage:multerStorage,
    fileFilter: multerFilter
})


export const uploadTourImages = upload.fields([
    {name: 'imageCover', maxCount: 1},
    {name: 'images', maxCount: 3}
])


export const aliasTopTour = (req, res, next) =>{
    req.query.limit = '5',
    req.query.sort = '-ratingsAverage,price',
    req.query.fields = 'name,duration,difficulty,price,summary'
    next()
}




export const getAllTours = getAll(Tour)
export const getTourById =  getOne(Tour, {path : 'reviews'})


export const createTour = createOne(Tour)

export const updateTour = updateOne(Tour)

export const deleteTour = deleteOne(Tour);



export const getTourStats = catchAsync(async(req, res, next) =>{
   
        const stats =await Tour.aggregate([
            {
                $match:{ratingsAverage : {$gte : 4.5}}
        
            },{
                $group: {
                    _id:{$toUpper:  "$difficulty"},
                    numTours :{$sum: 1},
                    numRating:{$sum: "$ratingsQuantity"},
                    avgRating:{$avg:'$ratingsAverage'},
                    avgPrice:{$avg: '$price'},
                    minPrice:{$min: '$price'},
                    maxPrice:{$max:'$price'}
                }
            },{
                $sort:{
                    maxPrice:-1
                }
            }
            // }, {
            //     $match : {_id:{$ne: "EASY"}}
            // }
        ])
        res.status(200)
            .json({
                status: "success",
                data: {
                    tour : stats
                }
            });
        })


export const getMonthlyPlan = catchAsync(async (req, res, next) =>{
    
        const year = req.params.year * 1
        const plan = await Tour.aggregate([
            {
                $unwind: "$startDates"
            },
            {
                $match:{
                    startDates:{
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },{
                $group:{
                    _id: {$month : '$startDates'},
                    numTourStarts:{$sum:1},
                    tours:{$push:'$name'}
                }
            },{
                $addFields:{
                    month:'$_id'
                }
            },{
                $project:{
                    _id:0
                }
            }, {$sort: {
                numTourStarts:-1
                }
            },{
                $limit: 12
            }
        ])
        res.status(200)
            .json({
                status: "success",
                data: {
                    plan
                }
            });
        
   
})

// export const getToursWithin = catchAsync(async(req, res, next)=>{
//     const {distance, latlng, unit} = req.params;
//     const [lat, lng] = latlng.split(',');

//     const radius = unit === 'mi'? distance/3963.2: distance/6378.1

//     if(!lat || !lng){
//         next(new AppError("Please provide latitude and longitude in the fotmat latitude,longitude", 400))
//     }
//     const tours = await Tour.find({
//         startLocation:{ $geoWithin:{ $centerSphere: [lng, lat], radius}}
//     })
//     console.log(distance, lat, lng, unit);
//     res.status(200).json({
//         status : "success",
//         count: tours.length,
//         data: {
//             data : tours
//         }
//     })
// })



export const getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
        next(new AppError("Please provide latitude and longitude in the format latitude,longitude", 400));
    }

    const tours = await Tour.find({
        startLocation: {
            $geoWithin: {
                $centerSphere: [[lng, lat], radius]
            }
        }
    });

    res.status(200).json({
        status: "success",
        results: tours.length,
        data: {
            data: tours
        }
    });
});
export const getDistance = catchAsync(async(req, res, next)=>{

    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

   const multiplier = unit === 'mi'? 0.000621371: 0.001;

    if (!lat || !lng) {
        next(new AppError("Please provide latitude and longitude in the format latitude,longitude", 400));
    }


    const distance = await Tour.aggregate([
        {
            $geoNear:{
                near:{
                    type: 'Point',
                    coordinates :[lng*1, lat*1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },{
            $project:{
                distance: 1,
                name:1
            }
        }
    ])
    res.status(200).json({
        status: "success",
        data: {
            data: distance
        }
    });

})