// const order = require('../../../models/order')

// function orderController() {
//     return {
//         index(req, res) {
//             order.find({ status: { $ne: 'completed' } }, null, { sort: {'createdAt': -1} }).populate('cusomerId', '-password').exec((err, orders) => {
//                 if(req.xhr) {
//                     return res.json(orders)
//                 } else {
//                     return res.render('admin/orders')
//                 }
//             })
//         }
//     }
// }

// module.exports = orderController

const Order = require('../../../models/order');

function orderController() {
    return {
        async index(req, res) {
            try {
                const orders = await Order.find({ status: { $ne: 'completed' } })
                    .sort({ createdAt: -1 })
                    .populate('customerId', '-password');
                
                if (req.xhr) {
                    return res.json(orders);
                } else {
                    return res.render('admin/orders', { orders });
                }
            } catch (error) {
                console.error('Error occurred:', error);
                // Handle error appropriately
                return res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    };
}

module.exports = orderController;
