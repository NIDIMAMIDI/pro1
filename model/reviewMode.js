import mongoose  from "mongoose"
import { Tour } from "./tourModel.js"
const reviewSchema = new mongoose.Schema({
    review:{
        type:String,
        required:[true, 'Review Cannot be Empty!']
    },
    rating:{
        type:Number,
        min:1,
        max:5
    },
    createdAt:{
        type:Date,
        default:Date.now
    },tour:{
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, "Review must belong to a tour"]
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, "Review must belong to a user"]
    }

}, {
        toJSON:{
            virtuals:true
        },
        toObject:{
            virtuals:true
        }
})


reviewSchema.index({tour:1, user : 1}, {unique : true})

reviewSchema.pre(/^find/, function(next) {
     this.populate({
        path:"user",
        select: 'name photo'
    })
    next()
})



// tourSchema.pre(/^find/, function(next) {
//     this.populate({
//         path: 'guides',
//         select: '-__v -passwordChangedAt'
//     });
//     next();
// });


reviewSchema.statics.calAverageRatings = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match: {tour : tourId},
        },
        {
                $group:{
                    _id : '$tour',
                    nRating : {$sum : 1},
                    avgRating: {$avg: '$rating'}
                }
        }
        
    ])

    // await Tour.findByIdAndUpdate(tourId,{
    //             ratingsQuantity: stats[0].nRating,
    //             ratingsAverage:stats[0].avgRating
    //         })
    // console.log(stats);
    if(stats.length > 0){
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity: stats[0].nRating,
            ratingsAverage:stats[0].avgRating
        })
    }
    else{
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        })
    }
    
}

reviewSchema.post('save', function(){
    // this points to current review
    this.constructor.calAverageRatings(this.tour);
 

})

reviewSchema.pre(/^findOneAnd/, async function(next){
    this.r = await this.findOne().clone()
    console.log(this.r);
    next()
})

reviewSchema.post(/^findOneAnd/, async function(){
    await this.r.constructor.calAverageRatings(this.r.tour)
})

export const Review = mongoose.model('Review', reviewSchema)

//66866fdb8a3884d540b52801