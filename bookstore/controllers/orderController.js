const Order = require('../models/Order');
const Book = require('../models/Book');

// Create new order
const createOrder = async (req, res) => {
    try {
        const { items, shippingAddress, paymentMethod } = req.body;

        // Validate items
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Order must have at least one item' });
        }

        let totalAmount = 0;
        const orderItems = [];

        // Process each item
        for (const item of items) {
            const book = await Book.findById(item.book);
            if (!book) {
                return res.status(404).json({ message: `Book not found: ${item.book}` });
            }

            if (book.stock < item.quantity) {
                return res.status(400).json({ 
                    message: `Insufficient stock for: ${book.title}. Available: ${book.stock}` 
                });
            }

            const itemTotal = book.price * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                book: book._id,
                quantity: item.quantity,
                price: book.price
            });

            // Update book stock
            book.stock -= item.quantity;
            await book.save();
        }

        const order = await Order.create({
            user: req.user._id,
            items: orderItems,
            totalAmount,
            shippingAddress,
            paymentMethod
        });

        const populatedOrder = await Order.findById(order._id)
            .populate('user', 'username email')
            .populate('items.book', 'title author imageUrl');

        res.status(201).json(populatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get user orders
const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('items.book', 'title author imageUrl')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all orders (admin only)
const getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const orders = await Order.find()
            .populate('user', 'username email')
            .populate('items.book', 'title author')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Order.countDocuments();

        res.json({
            orders,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single order
const getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'username email')
            .populate('items.book', 'title author imageUrl price');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user owns the order or is admin
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update order status (admin only)
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        ).populate('user', 'username email')
         .populate('items.book', 'title author');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update payment status (admin only)
const updatePaymentStatus = async (req, res) => {
    try {
        const { paymentStatus } = req.body;

        if (!['pending', 'completed', 'failed'].includes(paymentStatus)) {
            return res.status(400).json({ message: 'Invalid payment status' });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { paymentStatus },
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Cancel order
const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user owns the order or is admin
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to cancel this order' });
        }

        // Restore book stock if order is cancelled
        if (req.user.role === 'admin' || order.status === 'pending') {
            for (const item of order.items) {
                const book = await Book.findById(item.book);
                if (book) {
                    book.stock += item.quantity;
                    await book.save();
                }
            }

            order.status = 'cancelled';
            await order.save();

            const populatedOrder = await Order.findById(order._id)
                .populate('user', 'username email')
                .populate('items.book', 'title author');

            res.json(populatedOrder);
        } else {
            return res.status(400).json({ message: 'Cannot cancel order in current status' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createOrder,
    getUserOrders,
    getAllOrders,
    getOrder,
    updateOrderStatus,
    updatePaymentStatus,
    cancelOrder
};