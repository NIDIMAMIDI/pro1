import AppError from "./../utils/appError.js";
import { User } from "./../model/userModel.js";
import { catchAsync } from "./../utils/catchAsync.js";
import { startSession } from "mongoose";
import {createOne, deleteOne, getAll, getOne, updateOne} from "./../controllers/handlerFactory.js"
import multer from "multer"
import sharp from "sharp";
// const upload = multer({dest : 'public/img/users'})


// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users')
//     },
//     filename: (req, file, cb) =>{
//         const ext = file.mimetype.split('/')[1]
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//     }
// })


const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb)=>{
    if(file.mimetype.startsWith('image')){
        cb(null, true)
    }else{
        cb(new AppError('Not an Image! Please upload only images.', 400), false)
    }
}

export const uploadUserPhoto = catchAsync(async(req, res, next) => {
    if(!req.file) return next()


     req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`
        
    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({quality:90})
        .toFile(`public/img/users/${req.file.filename}`)

    next()
})

const upload = multer({
    storage:multerStorage,
    fileFilter: multerFilter
})

export const uploadPhoto = upload.single('photo')

const filterObj = (obj, ...allowedFields) =>{
    const newObj = {};
    Object.keys(obj).forEach(el=>{
        if(allowedFields.includes(el)) newObj[el] = obj[el]
    })
    return newObj
}

export const getMe = (req, res, next) =>{
    req.params.id = req.user.id;
    next()
}

export const getAllUsers = getAll(User)

export const updateMe = catchAsync(async(req, res, next)=>{
    // create error if user post password data
    // console.log(req.user);
    // console.log(req.file);
    // console.log(req.body);
    if(req.body.password || req.body.passwordConform){
        return next(new AppError(`This route is not for password updates.Please use /updatePassword route`, 400))
    }
    // update user document remove the unwanted fields
    const filterBody = filterObj(req.body, 'name', 'email')

    if(req.file) filterBody.photo = req.file.filename;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
        new:true,
        runValidators: true
    });
   
    res.status(200).json({
        status:"success",
        updatedUser
    })
})

// export const updateMe

export const deleteMe = catchAsync(async(req, res, next)=>{
    await User.findByIdAndUpdate(req.user.id, {active:false})
    res.status(204).json({
        status:"success", 
        data:null
    })
})

export const getUser =getOne(User)

// export const createUser = signup(User)


// export const createUser = (req, res)=>{
//     res.status(500)
//     .json({
//         status: "failure",
//         message : "This route is not yet defined! please /signup instead"
//     })
// }

// export const createUser = (req, res)=>{
//     res.redirect()
// }

export const updateUser = updateOne(User)

export const deleteUser = deleteOne(User)