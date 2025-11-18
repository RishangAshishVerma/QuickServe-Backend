
import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js"
import Store from "../models/store.model.js"


export const createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const cartId = req.params.id;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "useId not found."
            });
        }

        if (!cartId) {
            return res.status(400).json({
                success: false,
                message: "cartId id not found."
            });
        }

        const cart = await Cart.findById(cartId);
        if (!cart) {
            return res.status(400).json({
                success: false,
                message: "cart id not found."
            });
        }

        const storeId = cart.storeId;
        const userlocation = await User.findById(userId).select("+userlocation");
        const storeLocation = await Store.findById(storeId).select("+storeLocation");

        const longitude = storeLocation.storeLocation?.coordinates?.[0];
        const latitude = storeLocation.storeLocation?.coordinates?.[1];
        const deliveryBoy = await User.findOne({
            role: "rider",
            isAvailable: true,
            storeLocation: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: 5000
                }
            }
        });

        if (!deliveryBoy) {
            return res.status(404).json({ message: "No rider found in 5km radius" });
        }
        
        const order = await Order.create({
            storeId: storeId,
            userId: userId,
            product: cart,
            pickUpLocation: storeLocation.storeLocation,
            deliveryLocation: userlocation.userlocation,
            deliveryBoyId: deliveryBoy ? deliveryBoy._id : null,
            status: "on_the_way"
        });


        return res.status(200).json(order);

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};



