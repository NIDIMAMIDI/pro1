import crypto from "crypto"
import mongoose, { Mongoose } from "mongoose";
import validator from "validator";
import bcrypt from 'bcryptjs'
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please provide a name'],
        trim:true
    },
    email:{
        type:String,
        required:[true,'Please provide a Email'],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail, 'Please provide a valid Email']
    },photo:{
        type:String,
        default:'default.jpg'
        // required:[true,'USer must have a name']
    },
    role:{
        type:String,
        enum:['user', 'guide', 'lead-guide', 'admin'],
        default:'user'
    },
    password:{
        type:String,
        required:[true,'Please provide a password'],
        minlength: 8, 
        select: false
    },passwordConform:{
        type:String,
        required:[true,'Please provide a password'],
        validate:{
            validator: function(el) {
                return el === this.password 
            },
            message: 'passwords are not same'
        },
        select:false
    },passwordChangesAt:{
        type:Date,
        
    }, 
    passwordResetToken: String,
    passwordResetExpires: Date,
    active:{
        type:Boolean,
        default:true,
        select:false
    }
})


// userSchema.pre('save', async function(next){
//     if(!this.isModified('password')) return next()

//     this.password = await bcrypt.hash(this.password, 12)
//     this.passwordConform = undefined
//     next()
// })

// userSchema.pre('save', function(next){
//     if(this.isModified('password') || this.isNew) return next()

//     this.passwordChangesAt = Date.now() - 1000
//     next()
// })
userSchema.pre(/^find/, function(next) {
    this.find({ active: { $ne: false } });
    next();
});


userSchema.methods.correctPassword = async function(candidatePassword, userPAssword){
    return await bcrypt.compare(candidatePassword, userPAssword)
}


userSchema.methods.changePasswordAfter = function(JWTTimestamp){
    // console.log(JWTTimestamp);
    // console.log(this.passwordChangesAt.getTime());
    if(this.passwordChangesAt){
        const changedTimeStamp = parseInt(this.passwordChangesAt.getTime()/1000, 10);
        // console.log(changedTimeStamp, JWTTimestamp); // Debugging within the method
        // // return changedTimeStamp > JWTTimestamp / 1000; // Example condition
        // console.log(JWTTimestamp < changedTimeStamp);
        return JWTTimestamp < changedTimeStamp
    }


    return false;
}

userSchema.methods.createPasswordResetToken = function() {
    // const resetToken = crypto.randomBytes(32).toString('hex');
    // import crypto from 'crypto';

    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

    //console.log({resetToken}, this.passwordResetToken);
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000
    return resetToken
}

export const User = mongoose.model('User', userSchema)