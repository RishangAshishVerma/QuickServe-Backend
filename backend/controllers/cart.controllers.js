import Cart from "../models/cart.model.js"
import Product from "../models/product.model.js";

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

        const product = await Product.findById(productId).select("price");
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const price = Number(product.price) || 0;
        const subtotal = price * quantity;

        const cart = await Cart.create({
            storeId,
            userId,
            products: [
                {
                    productId,
                    quantity,
                    price
                }
            ],
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
            message: "Server error"
        });
    }
};

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
            if (!existingProduct) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found in cart"
                });
            }

            cart.products = cart.products.filter(
                (p) => p.productId.toString() !== productId.toString()
            );
        } else if (existingProduct && decrease) {
            existingProduct.quantity -= quantity;

            if (existingProduct.quantity <= 0) {
                cart.products = cart.products.filter(
                    (p) => p.productId.toString() !== productId.toString()
                );
            }
        } else if (existingProduct && !decrease) {
            existingProduct.quantity += quantity;
        } else {
            const product = await Product.findById(productId).select("price");
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            const price = Number(product.price) || 0;

            cart.products.push({
                productId,
                quantity,
                price
            });
        }

        cart.totalPrice = (cart.products || []).reduce((sum, item) => {
            const price = Number(item.price) || 0;
            const qty = Number(item.quantity) || 0;
            return sum + price * qty;
        }, 0);

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            data: cart
        });

    } catch (error) {
        console.error('updateCart error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

export const getCartById = async (req, res) => {
    try {
        const userId = req.user?.id

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId is required"
            })
        }

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(400).json({
                success: false,
                message: " cart not found "
            })
        }

        return res.status(200).json({
            success: true,
            message: "cart found",
            data: cart
        })
    } catch (error) {
        console.log(`error while getting the cart of the login user ${error}`);

        return res.status(200).json({
            success: false,
            message: "error while getting the cart of the login user"
        })

    }
};

export const clearCart = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'Missing userId'
            });
        }

        const cart = await Cart.findOneAndUpdate(
            { userId: userId },
            { $set: { products: [] } },
            { new: true }
        );

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Cart cleared',
            data: cart
        });

    } catch (error) {
        console.error(`'clearCart error ${error}'`);

        return res.status(500).json({
            success: false,
            error: 'clearCart error'
        });
    }
};

