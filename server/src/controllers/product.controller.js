const Product = require('../models/product.model');

const getProducts = async (req, res) => {
    try {
        const { keyword = "", page = 1, limit = 12 } = req.query;

        const normalized = normalizeKeyword(keyword);
        const { filters, cleanKeyword } = parseKeyword(normalized);

        const query = { isActive: true };

        if (cleanKeyword) {
            query.$text = { $search: cleanKeyword };
        }

        if (filters.gender) {
            query.gender = filters.gender;
        }

        if (filters.maxPrice) {
            query.basePrice = { $lte: filters.maxPrice };
        }

        const skip = (page - 1) * limit;

        const products = await Product.find(query)
            .skip(skip)
            .limit(Number(limit));

        res.json(products);

    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {getProducts};