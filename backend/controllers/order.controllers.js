
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


        const order = await Order.create({
            storeId: storeId,
            userId: userId,
            product: cart,
            pickUpLocation: storeLocation.storeLocation,
            deliveryLocation: userlocation.userlocation,
            status: "pending"
        });


        return res.status(200).json(order);

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const orderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "orderId not found."
            });
        }


        const order = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        ).populate('storeId').exec();

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }


        const storeDoc = order.storeId;
        if (!storeDoc) {
            console.warn('Order has no storeId or store not found.');
            return res.status(200).json({
                success: true,
                riders: [],
                message: 'Store not attached to order.'
            });
        }

        const coordinates = storeDoc.storeLocation?.coordinates;
        if (!Array.isArray(coordinates) || coordinates.length < 2) {
            console.warn('Store location coordinates missing or malformed:', coordinates);
            return res.status(200).json({
                success: true,
                riders: [],
                message: 'Store location not available.'
            });
        }

        const [longitude, latitude] = coordinates.map(Number);
        if (!isFinite(longitude) || !isFinite(latitude)) {
            console.warn('Coordinates are not numeric:', coordinates);
            return res.status(200).json({
                success: true,
                riders: [],
                message: 'Store coordinates invalid.'
            });
        }



        const maxDistanceMeters = 5000;
        const riders = await User.find({
            role: "rider",
            userlocation: {
                $near: {
                    $geometry: { type: "Point", coordinates: [longitude, latitude] },
                    $maxDistance: maxDistanceMeters
                }
            }
        }).lean().exec();


        return res.status(200).json({
            success: true,
            data: riders
        });

    } catch (error) {
        console.error("orderStatus error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};







