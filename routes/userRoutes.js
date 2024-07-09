import express from "express"
import {getAllUsers, getUser, updateUser, deleteUser, updateMe, deleteMe, getMe} from "./../controllers/userController.js";
import { signup, login, forgotPassword, resetPassword, updatePassword, protect, resrictTo} from "./../controllers/authController.js";
const router = express.Router()


router.post("/signup", signup)
router.post("/login", login)
router.post("/forgotPassword", forgotPassword)
router.patch("/resetPassword/:token", resetPassword)


// router.post("/", (req, res) => {
//     console.log("Sifmnfndkjbgdfjbgjkj");
//     res.redirect("/api/v1/users/signup"); // Ensure the correct path to the signup route
// });
//using protect middleware
router.use(protect)



router.patch("/updatePassword", updatePassword)
router.patch("/updateMe", updateMe)
router.patch("/deleteMe", deleteMe)
router.get('/me', getMe, getUser)


router.use(resrictTo('admin'))
router.route("/")
    .get(getAllUsers)
    

router.route("/:id")
    .get(getUser)
    .patch(updateUser)
    .delete(protect,  resrictTo('admin'), deleteUser)

export default router

