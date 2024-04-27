import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import productModel from "../models/productmodel.js";
import cartModel from "../models/cartModel.js";

export async function register(req, res) {
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const { email, password, confirmPassword } = req.body;
    if (!email) {
      return res.status(400).send({ error: "Please provide an email address" });
    } else if (!emailRegex.test(email)) {
      return res
        .status(400)
        .send({ error: "Please provide a valid email address" });
    }
    const existEmail = await userModel.findOne({ email });
    if (existEmail) {
      return res.status(400).send({ error: "This email is already in use" });
    }

    if (password) {
      if (password.length < 6) {
        return res
          .status(400)
          .send({ error: "Password should be at least 6 characters long" });
      }
      if (password === confirmPassword) {
        const hashPassword = await bcrypt.hash(password, 10);
        const user = new userModel({
          email,
          password: hashPassword,
        });

        await user.save();
        return res.status(201).json({
          error: false,
          message: "User registered successfully",
          data: number,
          token,
        });
      } else {
        return res.status(400).send({
          error: true,
          message: "Password and confirm password do not match",
        });
      }
    } else {
      return res
        .status(400)
        .send({ error: true, message: "Please provide a password" });
    }
  } catch (error) {
    res.status(500).send({ error: error.message || "Internal Server Error" });
  }
}
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res
        .status(400)
        .send({ error: true, message: "Email should not be empty" });
    }
    if (!password) {
      return res
        .status(400)
        .send({ error: true, message: "Password should not be empty" });
    }
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).send({ error: true, message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res
        .status(400)
        .send({ error: true, message: "Incorrect password" });
    }
    const token = Jwt.sign(
      {
        userid: user._id,
        email: user.email,
      },
      process.env.JWTS
    );

    return res.status(200).send({
      error: false,
      message: "Logged in successfully!",
      email: user.email,
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
}

export async function getproduct(req, res) {
  try {
    const user = req.user.userid;

    if (user) {
      const product = await productModel.find({});

      if (product.length === 0) {
        return res
          .status(404)
          .json({ error: true, message: "product data not found" });
      } else {
        return res.status(200).json({
          error: false,
          message: "Products retrieved successfully",
          data: response,
        });
      }
    } else {
      res.status(404).json({
        error: true,
        message: "Authentication error",
        data: null,
      });
    }
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Internal Server Error",
      data: null,
    });
  }
}

export async function addToCart(req, res) {
  try {
    const user = req.user.userid;

    if (user) {
      const { productId } = req.body;
      const productExist = await cartModel.findOne({ productId });

      if (productExist) {
        await cartModel.updateOne({ productId }, { $inc: { quantity: 1 } });

        return res
          .status(200)
          .json({
            error: false,
            msg: "1 quantity added",
            quantity: productExist.quantity,
            productId: productId,
          });
      } else {
        const newCartItem = new cartModel({
          productId,
          quantity: 1,
        });
        await newCartItem.save();
      }

      return res
        .status(200)
        .json({ msg: "Product added to cart successfully" });
    } else {
      res.status(404).json({
        error: true,
        message: "Authentication error",
        data: null,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

export async function removeFromCart(req, res) {
  try {
    const user = req.user.userid;

    if (user) {
      const { productId } = req.body;

      const product = await cartModel.findOne({ productId });

      if (!product) {
        return res
          .status(404)
          .json({ error: true, msg: "Product not found in cart" });
      }

      if (product.quantity > 1) {
        await cartModel.updateOne({ productId }, { $inc: { quantity: -1 } });
        return res
          .status(200)
          .json({
            error: false,
            msg: "1 quantity removed",
            quantity: product.quantity - 1,
            productId: productId,
          });
      } else {
        await cartModel.deleteOne({ productId });
        return res
          .status(200)
          .json({
            error: false,
            msg: "Product removed from cart",
            productId: productId,
          });
      }
    } else {
      res.status(404).json({
        error: true,
        message: "Authentication error",
        data: null,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
