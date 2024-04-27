import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    productId: { 
        type: String,
        required: true, 
    },
    quantity: { 
        type: Number,
        required: true 
        },
});

export default mongoose.model('cartModel', cartSchema);
