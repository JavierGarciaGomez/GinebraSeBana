import express, { Router, Request, Response } from "express";
import {
  userLogin,
  createUser,
  updateUser,
} from "../controllers/authController";
import { check } from "express-validator";
import { fieldValidator } from "../middlewares/fieldValidator";
import { validateJwt } from "../helpers/validateJwt";
import { changePassword } from "../controllers/authController";

// const passport = require("passport");

// const {
//   googleAuth,
//   userLogin,
//   userRenewToken,
// } = require("../controllers/authController");
// const { fieldValidator } = require("../middlewares/fieldValidator");
// const { validateJwt } = require("../middlewares/validateJwt");

export const authRoutes = Router();
// wtf
/************PASSPORT********* */

// // route called by the callback if its a success
// router.get("/googleLogin/success", (req, res) => {
//   console.log("success", req.user);
//   if (req.user) {
//     res.status(200).json({
//       success: true,

//       message: "successfull",
//       user: req.user,
//       token: req.user.token,
//       //   cookies: req.cookies
//     });
//   }
// });

// // route called by the callback if its a failure
// router.get("/googleLogin/failed", (req, res) => {
//   res.status(401).json({
//     success: false,
//     message: "failure",
//   });
// });

// // first call from client, it triggers passport to very google account
// router.get(
//   "/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// // callback from google
// router.get(
//   "/google/callback",
//   passport.authenticate("google", {
//     failureRedirect: "/api/auth/googleLogin/failed",
//     // successRedirect: `${process.env.CLIENT_URL}/#/auth`,
//   }),
//   googleAuth
// );

/************USERS CRUD********* */

// CREATE USER
authRoutes.post(
  "/",
  [
    check(
      "username",
      "El nombre de usuario debe tener entre 4 y 16 caracteres"
    ).isLength({ min: 4, max: 16 }),
    check("email", "no es una forma de email correcta").isEmail(),
    fieldValidator,
  ],
  createUser
);

// UPDATE USER
authRoutes.put(
  "/:userId",
  [
    check(
      "username",
      "El nombre de usuario debe tener entre 4 y 16 caracteres"
    ).isLength({ min: 4, max: 16 }),
    check("email", "no es una forma de email correcta").isEmail(),
    fieldValidator,
  ],
  validateJwt,
  updateUser
);

// CHANGE PASSWORD
authRoutes.patch(
  "/changepass/:userId",
  [
    check("previousPassword", "El password anterir es necesario").notEmpty(),
    check("newPassword", "El password anterir es necesario").notEmpty(),
    fieldValidator,
  ],
  validateJwt,
  changePassword
);

// // LOGIN
// router.post(
//   "/",
//   [
//     check("email", "no es una forma de email correcta").isEmail(),
//     fieldValidator,
//   ],
//   userLogin
// );

// // TODO: XXXX
// router.get("/logout", (req, res) => {
//   req.logout();
//   res.redirect(`${process.env.CLIENT_URL}`);
// });

// // renew token
// router.get("/renew", validateJwt, userRenewToken);

// router.get("test", (req, res) => {});

// module.exports = router;
