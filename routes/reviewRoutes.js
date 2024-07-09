import express from "express"
import {getAllReviews,createReview, deleteReview, updateReview, setTourUserId, getReview} from "./../controllers/reviewController.js"
import {resrictTo, protect} from  "./../controllers/authController.js"
const router = express.Router({mergeParams:true})
// const router = express.Router()
import { isLoggedIn } from "./../controllers/authController.js"
//setting protect middleware
router.use(protect)

router.route('/')
    .get(getAllReviews)
    .post(
        resrictTo('user'),
        setTourUserId,
        createReview
    )

router.route("/:id")
        .get(getReview)
        .delete(resrictTo('user', 'admin'),deleteReview)
        .patch(resrictTo('user', 'admin'),updateReview)

export default router