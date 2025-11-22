
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

        const price = cart.totalPrice

        const order = await Order.create({
            storeId: storeId,
            userId: userId,
            product: cart,
            pickUpLocation: storeLocation.storeLocation,
            deliveryLocation: userlocation.userlocation,
            status: "pending",
            totalPrice: price
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

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required."
            });
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully.",
            data: order
        });

    } catch (error) {
        console.error("orderStatus error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const assignRider = async (req, res) => {
    try {
        const orderId = req.params.id;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "orderId not found."
            });
        }

        const order = await Order.findById(orderId).lean().exec();

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "order not found."
            });
        }

        if (order.deliveryBoyId) {
            return res.status(400).json({
                success: false,
                message: "Order already has a rider assigned."
            });
        }

        const coords = order.pickUpLocation?.coordinates;

        if (!Array.isArray(coords) || coords.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Order pickUpLocation coordinates not available."
            });
        }

        const [longitude, latitude] = coords;

        if (typeof longitude !== "number" || typeof latitude !== "number") {
            return res.status(400).json({
                success: false,
                message: "Invalid pickUpLocation coordinates."
            });
        }

        const riders = await User.find({
            role: "rider",
            isAvailable: true,
            userlocation: {
                $near: {
                    $geometry: { type: "Point", coordinates: [longitude, latitude] },
                    $maxDistance: 10000
                }
            }
        })
            .limit(10)
            .lean()
            .exec();

        if (!riders || riders.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No riders within 10 km.",
                riders: []
            });
        }

        return res.status(200).json({
            success: true,
            message: "Riders fetched successfully.",
            riders: riders
        });

    } catch (error) {
        console.error("assignRider error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const acceptOrder = async (req, res) => {
    try {
        const { status } = req.body;
        const riderId = req.user.id;
        const orderId = req.params.id;

        if (!riderId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: rider not authenticated."
            });
        }

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Invalid order id."
            });
        }

        const rider = await User.findById(riderId).lean().exec();

        if (!rider) {
            return res.status(404).json({
                success: false,
                message: "Rider not found."
            });
        }

        if (rider.isAvailable === false) {
            return res.status(400).json({
                success: false,
                message: "Rider is not available to accept orders."
            });
        }

        const order = await Order.findById(orderId)

        if (status === "accepted") {
            if (order.status === "out for delivery") {
                await Order.findByIdAndUpdate(orderId, {
                    deliveryBoyId: riderId,
                    status: "accepted"
                });

                await User.findByIdAndUpdate(riderId, {
                    isAvailable: false
                })
            }
        }

        return res.status(200).json({
            success: true,
            message: "Order accepted successfully."
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

export const getUserOrder = async (req, res) => {
    try {

        const userId = req.user.id

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "Invalid user id."
            });
        }

        const userOrder = await Order.find({ userId: userId });

        return res.status(200).json({
            success: true,
            message: "user order status",
            data: userOrder
        });

    } catch (error) {

        console.log(`error while getting currect user order ${error}`);
        return res.status(500).json({
            success: false,
            message: "Server error.",
        });
    }
}

export const getStoreOrder = async (req, res) => {
    try {
        const userId = req.user.id

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "Invalid user id."
            });
        }

        const store = await Store.find({ owner: userId }).select("_id")

        if (!store) {
            return res.status(400).json({
                success: false,
                message: "Invalid user id."
            });
        }

        const userOrder = await Order.find({ storeId: store });

        return res.status(200).json({
            success: true,
            message: "store order status",
            data: userOrder
        });

    } catch (error) {
        console.log(`error while getting currect store order ${error}`);
        return res.status(500).json({
            success: false,
            message: "Server error.",
        });
    }
}

export const getOrderById = async (req, res) => {
    try {
        const orderId = req.body.id;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID."
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Here is the order.",
            data: order
        });

    } catch (error) {
        console.error(`Error fetching order ${error}`);

        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};
