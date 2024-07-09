// routes/tourRoutes.js

import express from "express";
import {getAllTours, createTour, getTourById, updateTour, deleteTour, aliasTopTour, getTourStats, getMonthlyPlan, getToursWithin, getDistance} from "./../controllers/tourController.js"; // Named imports
import { protect , resrictTo} from "./../controllers/authController.js";
// import { createReview } from "../controllers/reviewController.js";
// import authController from "./../controllers/authController.js"
import reviewRouter from "./../routes/reviewRoutes.js";


const router = express.Router();


// POST /tour/35y892jidhf/reviews

// router.
//     route('/:tourID/reviews')
//      .post(
//         protect, 
//         resrictTo('user'),
//         createReview
//     )

router.use('/:tourID/reviews', reviewRouter)
// router.param('id', checkId)
router.route("/top-5-cheap").get(aliasTopTour, getAllTours)
router.route("/tour-stats").get(getTourStats)

router.route("/monthly-plan/:year")
        .get(protect, resrictTo('admin', 'lead-guide', 'guide'),getMonthlyPlan)


router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(getToursWithin)
router.route("/distance/:latlng/unit/:unit").get(getDistance)
router.route("/")
    .get(protect,getAllTours)
    .post(protect, resrictTo('admin', 'lead-guide'),createTour);

router.route("/:id")
    .get(getTourById)
    .patch(protect, resrictTo('admin', 'lead-guide'),updateTour)
    .delete(protect, resrictTo('admin', 'lead-guide'),deleteTour);



export default router;
