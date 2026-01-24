const Product = require("../models/product.model");

// const getProducts = async (req, res) => {
//     try {
//         const { keyword = "", page = 1, limit = 12 } = req.query;

//         const normalized = normalizeKeyword(keyword);
//         const { filters, cleanKeyword } = parseKeyword(normalized);

//         const query = { isActive: true };

//         if (cleanKeyword) {
//             query.$text = { $search: cleanKeyword };
//         }

//         if (filters.gender) {
//             query.gender = filters.gender;
//         }

//         if (filters.maxPrice) {
//             query.basePrice = { $lte: filters.maxPrice };
//         }

//         const skip = (page - 1) * limit;

//         const products = await Product.find(query)
//             .skip(skip)
//             .limit(Number(limit));

//         res.json(products);

//     } catch (err) {
//         res.status(500).json({ message: "Server Error" });
//     }
// };

const getProducts = async (req, res) => {
    try {
        const { keyword = "", page = 1, limit = 12 } = req.query;

        const normalized = normalizeKeyword(keyword);
        const { filters, cleanKeyword } = parseKeyword(normalized);

        const skip = (page - 1) * limit;

        const pipeline = [];

        if (cleanKeyword) {
        pipeline.push({
            $search: {
            index: "default",
            compound: {
                must: [
                {
                    text: {
                    query: cleanKeyword,
                    path: [
                        { value: "name", score: { boost: { value: 4 } } },
                        { value: "brand", score: { boost: { value: 2 } } },
                        "description",
                        "variants.flavor",
                        "variants.weight",
                        "variants.material",
                        "variants.resistance_level",
                    ],
                    fuzzy: {
                        maxEdits: 2,
                    },
                    },
                },
                ],
                filter: [
                {
                    equals: {
                    path: "isActive",
                    value: true,
                    },
                },
                ],
            },
            },
        });

        pipeline.push({
            $addFields: {
            searchScore: { $meta: "searchScore" },
            },
        });

        pipeline.push({
            $sort: { searchScore: -1 },
        });
        } else {
        pipeline.push({
            $match: { isActive: true },
        });
        }

        if (filters.gender) {
        pipeline.push({
            $match: { gender: filters.gender },
        });
        }

        if (filters.maxPrice) {
        pipeline.push({
            $match: { minPrice: { $lte: filters.maxPrice } },
        });
        }

        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: Number(limit) });

        const products = await Product.aggregate(pipeline);

        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = { getProducts };
