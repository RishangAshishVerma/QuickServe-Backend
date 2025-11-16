import Cart from "../models/cart.model.js"

export const createCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const storeId = req.params.storeId;
        const productId = req.params.productId;
        const quantity = 1;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId is required"
            });
        }

        if (!storeId) {
            return res.status(400).json({
                success: false,
                message: "storeId is required"
            });
        }

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "productId is required"
            });
        }

        const cart = await Cart.create({
            storeId,
            userId,
            products: [
                {
                    productId,
                    quantity
                }
            ]
        });

        return res.status(201).json({
            success: true,
            message: "Cart created successfully",
            cart
        });

    } catch (error) {

        console.log(`error while creating the cart ${error}`);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

export const updateCart = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        const cartId = req.params.cartId;
        const productId = req.params.productId;
        const quantity = (req.body && Number(req.body.quantity)) ? Number(req.body.quantity) : 1;
        const remove = req.body && req.body.remove === true;
        const decrease = req.body && req.body.decrease === true;

        if (!userId) return res.status(400).json({
            success: false,
            message: "userId is required"
        });

        if (!productId) return res.status(400).json({
            success: false,
            message: "productId is required"
        });

        if (!cartId) return res.status(400).json({
            success: false,
            message: "cartId is required"
        });

        const cart = await Cart.findById(cartId);

        if (!cart) return res.status(404).json({
            success: false,
            message: "Cart not found"
        });

        const cartStoreId = cart.storeId;

        if (!cartStoreId) return res.status(400).json({
            success: false,
            message: "Cart does not have a storeId set"
        });

        const existingProduct = (cart.products || []).find(
            (p) => p.productId.toString() === productId.toString()
        );

        if (remove) {
            const updatedCart = await Cart.findByIdAndUpdate(
                cartId,
                { $pull: { products: { productId } } },
                { new: true }
            );
            return res.status(200).json({
                success: true,
                message: "Product removed",
                data: updatedCart
            });
        }

        if (existingProduct && decrease) {
            existingProduct.quantity -= quantity;

            if (existingProduct.quantity <= 0) {
                cart.products = cart.products.filter(
                    (p) => p.productId.toString() !== productId.toString()
                );
            }

            await cart.save();
            return res.status(200).json({
                success: true,
                message: "Quantity decreased",
                data: cart
            });
        }

        if (existingProduct && !decrease) {
            existingProduct.quantity += quantity;
            await cart.save();
            return res.status(200).json({
                success: true,
                message: "Quantity updated",
                data: cart
            });
        }

        const updatedCart = await Cart.findByIdAndUpdate(
            cartId,
            { $push: { products: { productId, quantity } } },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Product added to cart",
            data: updatedCart
        });

    } catch (error) {
        console.error('updateCart error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
