// Import necessary modules and libraries
import { Router } from "express";
import * as controller from '../controller/controller.js';
import Auth from "../middleware/auth.js";

const router = Router();
router.route('/register').post(controller.register);
router.route('/login').post(controller.login);
router.route('/getproduct').get(Auth,controller.getproduct);
router.route('/addproduct').post(Auth,controller.addToCart);
router.route('/removeproduct').delete(Auth,controller.removeFromCart);

export default router;




