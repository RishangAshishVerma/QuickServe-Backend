import user from "../models/user.model.js"
import Order from "../models/order.model.js"

export const reorder = async (req, res) => {
    try {
        const orderid = req.params

        if (!orderid) {
            return res.status(400).json({
                success: false,
                message: "order id not found."
            })
        }

        const order = Order.findById(orderid)

        const reorder = await Order.create({
            storeId: order.storeId,
            userId: order.userId,
            product: order.cart,
            pickUpLocation: order.storeLocation.storeLocation,
            deliveryLocation: order.userlocation.userlocation,
            status: "pending",
            totalPrice: order.price,
            isreorder: true,
        });

        return res.status(200).json({
            success: true,
            message: "order placed ."
        })

    } catch (error) {
        console.log(`error while placeing order support staff ${error}`);
        
        return res.status(200).json({
            success: true,
            message: "Something went wrong.",
        })

    }
}

