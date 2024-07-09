import mongoose from "mongoose"
import slugify from "slugify"
// import validator from "validator"
// import { User } from "./userModel.js"

const tourSchema = new mongoose.Schema({
    name: {
        type:String,
        required:[true, 'Tour must have a name'],
        unique:true,
        trim:true, 
        maxlength: [20, 'A tour name must have less than or equal to 20 characters'],
        minlength:[3, 'A  tour name must have more than or equal to 3 characters'],
        // validate:[validator.isAlpha, 'Tour name must only contain characters']
    },
    slug:String,
    duration:{
        type:Number,
        required:[true,'tour must have duration']
    },
    maxGroupSize:{
        type:Number,
        required:[true,'tour must have maxGroupSize']
    },
    difficulty:{
        type:String,
        required:[true, 'Tour must have a difficulty'],
        enum:{
            values : ['easy','difficult', 'medium'],
            message: "Difficulty is either easy, medium, difficult"
        }
    },
    ratingsAverage :{
        type:Number,
        default:4.5,
        min:[1, "Rating must be above 1.0"],
        max:[5, "Rating must be below 5.0"],
        set: val => Math.round(val*10)/10
    },
    ratingsQuantity :{
        type:Number,
        default:0
    },
    price : {
        type: Number,
        required:[true, "Tour must have a price"]
    },
    discount:{
        type: Number,
        validate:{
            validator: function(value){
                return value < this.price
            },
            message : "Discount price ({VALUE}) should be below regular price"
        }
    }, summary:{
        type:String,
        trim:true,
        required:[true, "Tour must have a description"]
    }, description:{
        type:String,
        trim:true
    }, imageCover:{
        type:String,
        required:[true,"Tour must have a description"]
    }, images:[String],
    createdAt:{
        type:Date,
        default:Date.now,
        select: false
    },
    startDates:[Date],
    secretTour:{
        type: Boolean,
        default:false
    },
    startLocation:{
        // GeoJSON
        type:{
            type: String,
            default : 'Point',
            enum: ['Point']
        }, coordinates: [Number],
        address:String,
        description:String
        
    },
    locations:[
        {
            type:{
                type: String,
                default : 'Point',
                enum: ['Point']
            }, 
            coordinates: [Number],
            // Cast to ObjectId failed for value "signup" (type string) at path "_id" for model "User"
            address:String,
            description:String,
            day:Number
        }
    ],
    guides: [
        {
            type:mongoose.Schema.ObjectId,
            ref : 'User'
        }
        
    ]

}, {
    toJSON:{
        virtuals:true
    },
    toObject:{
        virtuals:true
    }
})

// tourSchema.index({price:1})

tourSchema.index({price:1, ratingsAverage : -1})
tourSchema.index({slug:1})
// tourSchema.index({startLocation: '2dsphere'})

tourSchema.virtual('durationWeeks').get(function(){
    return this.duration/7
})

// tourSchema.virtual('reviews', {
//     ref: 'Review',
//     foreignField: 'tour',
//     localField:"_id"
// })


tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});

// Document middleware
tourSchema.pre('save', function(next){
    this.slug = slugify(this.name, {lower: true})
    next()
})

// tourSchema.pre('save', async function(next){
//     const guidesPromises = this.guides.map(async id=> await User.findById(id));
//     this.guides= await Promise.all(guidesPromises)

//     next()
// })

// tourSchema.pre('save', function(next){
//     this.guides.map
//     next()
// })
//Query Middleware

tourSchema.pre(/^find/, function(next){
    this.find({secretTour:{$ne:true}})
    this.start = Date.now()
    next();
})


tourSchema.post(/^find/, function(docs, next){
    console.log(`Query took ${Date.now() - this.start} milliseconds`);
   
    next()
})


// tourSchema.pre(/^find/, function(next){
//     this.populate({
//         path:'guides',
//         select: '-__v -passwordChangedAt'
//     })
//     next()
// })

tourSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    });
    next();
});


// tourSchema.pre('aggregate', function(next){
//     this.pipeline().unshift({ $match: { secretTour: { $ne : true }} })
//     console.log(this.pipeline());
//     next()
// })
// tourSchema.pre('save', function(next){
//     console.log("will save document...");
//     next()
// })

// tourSchema.post('save', function(doc, next){
//     console.log(doc);
//     next()
// })


export const Tour = mongoose.model('Tour', tourSchema);

