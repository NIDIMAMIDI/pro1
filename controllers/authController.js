import {promisify} from 'util'
import jwt from 'jsonwebtoken';
import { User } from "./../model/userModel.js";
import { catchAsync } from "../utils/catchAsync.js";
import AppError from './../utils/appError.js';
import sendEmail from './../utils/email.js';
import crypto from "crypto";
import { log } from 'console';


const signToken = id =>{
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn:process.env.JWT_EXPIRES_IN
});

}


const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id)

    const cookieOption = {
        expires : new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly:true
    }

    if(process.env.NODE_ENV === 'production') cookieOption.secure=true
    res.cookie('jwt', token, cookieOption)

    // remove password from the output

    user.password = undefined;
    res.status(statusCode).json({
        status: "success",
        data: {
            user: user,
            token: token // Include the generated token in the response
        }
    });
}

export const signup = catchAsync(async(req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        role:req.body.role,
        password: req.body.password,
        passwordConform: req.body.passwordConform,
        passwordChangesAt: req.body.passwordChangesAt,
        passwordResetToken : req.body.passwordResetToken,
        passwordResetDate : req.body.passwordResetDate,
        active : req.body.active
    });
    createSendToken(newUser, 201, res);
});




export const login= catchAsync(async(req, res, next) =>{
    const {email , password}= req.body;
    // check if email and password exists
    if(!email || ! password){
       return  next(new AppError('Please provide email and Password', 400))
    }
    // check if user exists and password is correct

    const user = await User.findOne({email}).select('+password')

    // console.log(user);
    // if every thing is ok then send token to the client
    // const correct = await user.correctPassword(password, user.password)

    if(!user || !(await user.correctPassword(password, user.password))){
        return  next(new AppError('Incorrect email and Password', 401))
    }
    createSendToken(user, 200, res);
    
})

export const protect = catchAsync(async(req, res, next)=>{
    //getting token and check if it is there

    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
    }

    else if(req.cookies.jwt){
        token = req.cookies.jwt
    }
    // console.log(token);
    if(!token) {
        return next(new AppError('you are not logged in! Please log in to get access.', 401))
    }


     // verification of token

    const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET);
    // console.log(decoded);


    // check if user still exists
    const freshUser = await User.findById(decoded.id);
    // console.log(freshUser);
    // console.log(decoded.iat)
    if(!freshUser) return next(new AppError('The User with the token is no longer exists', 401))
    
    // console.log(freshUser.changePasswordAfter(decoded.iat));
    if(freshUser.changePasswordAfter(decoded.iat)){
        return next(new AppError('User recently changed the password, please login again', 401))
    }
        //new AppError('The User with the token is no longer exists', 401)
    
     req.user = freshUser
    //  console.log(req.user.id); //6683b1fa10e40e689dc45bb0
   next()
   

})


//only for rendered pages
export const isLoggedIn = catchAsync(async(req, res, next)=>{
    //getting token and check if it is there

    if(req.cookies.jwt){
     // verification of token

    const decoded = await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET);
    // console.log(decoded);


    // check if user still exists
    const freshUser = await User.findById(decoded.id);
    // console.log(freshUser);
    // console.log(decoded.iat)
    if(!freshUser) return next()
    
    // console.log(freshUser.changePasswordAfter(decoded.iat));
    if(freshUser.changePasswordAfter(decoded.iat)){
        return next()
    }
        //new AppError('The User with the token is no longer exists', 401)
    
     res.locals.user = freshUser
     return next()
    //  console.log(req.user.id); //6683b1fa10e40e689dc45bb0
  
   
}
next()
})










export const resrictTo = (...roles)=>{
    return (req, res, next)=>{
        if(!roles.includes(req.user.role)){
            return next(new AppError("You do not have permission to perfom this action", 403))
        }
        next()
    }
}


export const forgotPassword = catchAsync(async(req, res, next)=>{
    // get user based on posted email
    const user = await User.findOne({email:req.body.email})
    // console.log(user);
    if(!user){
        return next(new AppError("There is no user with this email address", 404));
    }
    // generete random token
    const resetToken = user.createPasswordResetToken();
    // console.log(resetToken);
    await user.save({validateBeforeSave: false});
    //send it  to user email
    //const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const resetURL = `${req.protocol}://localhost:3000/api/v1/users/forgotPassword/${resetToken}`;
    // console.log(resetURL);
    const message = `Forgrot your password? submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\n If you didn't forget your password, please ignore this email`;

   try{
    await sendEmail({
        email:req.body.email,
        subject:`your password reset token (valid for 10 min)`,
        message
    })
    res.status(200).json({
        status: 'success',
        message: 'Token sent to Email!'
    })
   }
   catch(err) {
        user.passwordResetToken=undefined,
        user.passwordResetExpires= undefined,

        await user.save({validateBeforeSave:false})

        return next(
            new AppError(`There was an error sending the email. TRy again later`), 500
        )
   }
    // next()
})

export const resetPassword = catchAsync(async(req, res, next)=>{
    console.log(req.params.token);
    const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')
    console.log(hashedToken)
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {$gt: Date.now()}
    })

console.log(user);
    if(!user) {
        return next(new AppError("Token is invalid or has expired", 400))
    }
    user.password = req.body.password,
    user.passwordConform = req.body.passwordConform,
    user.passwordResetToken = undefined,
    user.passwordResetExpires = undefined
    await user.save()
    createSendToken(user, 200, res);
//     const token = signToken(user._id)
//     res.status(200).json({
//         status:'success',
//         token
//     })
// //   next()
})

export const updatePassword = catchAsync(async(req, res, next)=>{
    // get user from collection 
    const user = await User.findById(req.user.id).select('+password')
    // check if posted current password is correct
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('your current password is wrong', 401))
    }
// if so, update password
    user.password = req.body.password
    user.passwordConform = req.body.passwordConform
    await user.save()

    createSendToken(user, 200, res);
    //
})