const Product = require("../models/product.model");

const allowedCategories = ["clothing", "accessory", "equipment", "supplement"];
const allowedGenders = ["male", "female", "unisex"];
const homeSectionMeta = {
clothing: {
    label: "Training Wear",
    title: "Performance layers for every session",
    description:
    "Sweat-ready fits, precise cuts, and premium essentials that hold up through real work.",
},
accessory: {
    label: "Accessories",
    title: "Small details that upgrade the entire routine",
    description:
    "Grip, carry, hydrate, recover. These are the pieces that make the training day smoother.",
},
equipment: {
    label: "Equipment",
    title: "Home-gym staples with serious presence",
    description:
    "Strength tools and cardio essentials selected to feel substantial, not disposable.",
},
supplement: {
    label: "Supplements",
    title: "Recovery and performance support that earns its place",
    description:
    "Protein, daily support, and goal-specific picks from the names people already trust.",
},
};

const escapeRegex = (value = "") =>
value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeText = (value = "") =>
value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const STOP_WORDS = new Set([
"for",
"a",
"an",
"the",
"and",
"or",
"of",
"in",
"to",
"with",
"by",
"at",
"from",
]);

const GENDER_TERMS = new Map([
["men", "male"],
["man", "male"],
["male", "male"],
["mens", "male"],
["guys", "male"],
["women", "female"],
["woman", "female"],
["female", "female"],
["womens", "female"],
["ladies", "female"],
["boys", "male"],
["boy", "male"],
["girls", "female"],
["girl", "female"],
]);

const levenshteinDistance = (a = "", b = "") => {
const left = a.toLowerCase();
const right = b.toLowerCase();

if (!left.length) {
    return right.length;
}

if (!right.length) {
    return left.length;
}

const matrix = Array.from({ length: left.length + 1 }, () =>
    Array(right.length + 1).fill(0),
);

for (let i = 0; i <= left.length; i += 1) {
    matrix[i][0] = i;
}

for (let j = 0; j <= right.length; j += 1) {
    matrix[0][j] = j;
}

for (let i = 1; i <= left.length; i += 1) {
    for (let j = 1; j <= right.length; j += 1) {
    const cost = left[i - 1] === right[j - 1] ? 0 : 1;
    matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
    );
    }
}

return matrix[left.length][right.length];
};

const similarityRatio = (query = "", target = "") => {
    if (!query || !target) {
        return 0;
    }

    const distance = levenshteinDistance(query, target);
    const maxLength = Math.max(query.length, target.length);
    if (!maxLength) {
        return 0;
    }

    return 1 - distance / maxLength;
};

const scoreSingleToken = (
qToken,
normalizedName,
normalizedBrand,
productTokens,
product,
) => {
let score = 0;
if (normalizedName.startsWith(qToken)) score += 0.6;
if (normalizedBrand.startsWith(qToken)) score += 0.3;
if (normalizedName.includes(qToken)) score += 0.4;
if (normalizedBrand.includes(qToken)) score += 0.2;

const fullText = `${normalizedName} ${normalizedBrand}`.trim();
score += similarityRatio(qToken, fullText) * 0.8;

const tokenBestRatio = productTokens.reduce(
    (best, t) => Math.max(best, similarityRatio(qToken, t)),
    0,
);
score += tokenBestRatio * 0.7;

if (product.isFeatured) score += 0.08;
score += (Number(product.rating) || 0) / 100;
return score;
};

const TOKEN_MATCH_THRESHOLD = 0.84;

const scoreSuggestion = (query, product) => {
const normalizedQuery = normalizeText(query);
const normalizedName = normalizeText(product.name || "");
const normalizedBrand = normalizeText(product.brand || "");
const productTokens = `${normalizedName} ${normalizedBrand}`
    .trim()
    .split(" ")
    .filter(Boolean);

if (!normalizedQuery || !productTokens.length) return 0;

const allQueryTokens = normalizedQuery.split(" ").filter(Boolean);

if (allQueryTokens.length === 1) {
    return scoreSingleToken(
    allQueryTokens[0],
    normalizedName,
    normalizedBrand,
    productTokens,
    product,
    );
}

let genderRequested = null;
const contentTokens = [];

for (const token of allQueryTokens) {
    if (STOP_WORDS.has(token)) continue;
    const gender = GENDER_TERMS.get(token);
    if (gender) {
    genderRequested = gender;
    } else {
    contentTokens.push(token);
    }
}

const productGender = (product.gender || "").toLowerCase();
if (genderRequested) {
    const isOpposite =
    (genderRequested === "male" && productGender === "female") ||
    (genderRequested === "female" && productGender === "male");
    if (isOpposite) return 0;
}

if (contentTokens.length === 0) {
    let s =
    productGender === genderRequested
        ? 0.6
        : productGender === "unisex" || !productGender
        ? 0.3
        : 0;
    if (product.isFeatured) s += 0.05;
    s += (Number(product.rating) || 0) / 100;
    return s;
}

let totalScore = 0;
let matchedCount = 0;

for (const qToken of contentTokens) {
    let best = 0;
    for (const pToken of productTokens) {
    let m = 0;
    if (pToken === qToken) {
        m = 1.0;
    } else if (pToken.startsWith(qToken) || qToken.startsWith(pToken)) {
        m = 0.85;
    } else {
        const ratio = similarityRatio(qToken, pToken);
        m = ratio >= TOKEN_MATCH_THRESHOLD ? ratio : ratio * 0.25;
    }
    if (m > best) best = m;
    }
    totalScore += best;
    if (best >= TOKEN_MATCH_THRESHOLD) matchedCount++;
}

const avgScore = totalScore / contentTokens.length;
const matchRatio = matchedCount / contentTokens.length;

if (matchedCount === 0) return 0;

let score = avgScore * matchRatio * 2.0;

if (matchedCount === contentTokens.length) score += 0.3;

if (genderRequested) {
    if (productGender === genderRequested) score += 0.2;
    else if (productGender === "unisex" || !productGender) score += 0.05;
}

if (product.isFeatured) score += 0.05;
score += (Number(product.rating) || 0) / 100;
return score;
};

const getProducts = async (req, res) => {
try {
    const {
    keyword = "",
    page = 1,
    limit = 12,
    category,
    gender,
    maxPrice,
    featured,
    } = req.query;

    const parsedPage = Math.max(Number(page) || 1, 1);
    const parsedLimit = Math.min(Math.max(Number(limit) || 12, 1), 48);

    const query = { isActive: true };

    if (category && allowedCategories.includes(category)) {
    query.category = category;
    }

    if (gender && allowedGenders.includes(gender)) {
    query.gender = gender;
    }

    if (featured === "true") {
    query.isFeatured = true;
    }

    if (maxPrice && !Number.isNaN(Number(maxPrice))) {
    query.minPrice = { $lte: Number(maxPrice) };
    }

    if (keyword.trim()) {
    const pattern = new RegExp(escapeRegex(keyword.trim()), "i");
    query.$or = [
        { name: pattern },
        { brand: pattern },
        { description: pattern },
        { category: pattern },
    ];
    }

    const skip = (parsedPage - 1) * parsedLimit;

    const [products, totalProducts] = await Promise.all([
    Product.find(query)
        .select(
        "name slug brand category description images gender minPrice maxPrice rating numReviews totalSold isFeatured variants",
        )
        .sort({ isFeatured: -1, rating: -1, createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit),
    Product.countDocuments(query),
    ]);

    return res.status(200).json({
    products,
    pagination: {
        page: parsedPage,
        limit: parsedLimit,
        totalProducts,
        totalPages: Math.ceil(totalProducts / parsedLimit),
    },
    });
} catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch products" });
}
};

const getHomeProducts = async (req, res) => {
try {
    const categoryResults = await Promise.all(
    allowedCategories.map(async (category) => {
        const products = await Product.aggregate([
        {
            $match: {
            isActive: true,
            category,
            },
        },
        { $sample: { size: 4 } },
        {
            $project: {
            name: 1,
            slug: 1,
            brand: 1,
            category: 1,
            description: 1,
            images: 1,
            gender: 1,
            minPrice: 1,
            maxPrice: 1,
            rating: 1,
            numReviews: 1,
            totalSold: 1,
            isFeatured: 1,
            variants: { $slice: ["$variants", 1] },
            },
        },
        ]);

        return [category, products];
    }),
    );

    const featured = await Product.aggregate([
    {
        $match: {
        isActive: true,
        isFeatured: true,
        },
    },
    { $sample: { size: 6 } },
    {
        $project: {
        name: 1,
        slug: 1,
        brand: 1,
        category: 1,
        description: 1,
        images: 1,
        gender: 1,
        minPrice: 1,
        maxPrice: 1,
        rating: 1,
        numReviews: 1,
        totalSold: 1,
        isFeatured: 1,
        variants: { $slice: ["$variants", 1] },
        },
    },
    ]);

    const categories = Object.fromEntries(categoryResults);
    const sections = allowedCategories.map((key) => ({
    key,
    ...(homeSectionMeta[key] || {}),
    products: categories[key] || [],
    }));

    return res.status(200).json({
    featured,
    categories,
    sections,
    });
} catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch home products" });
}
};

const getSearchSuggestions = async (req, res) => {
try {
    const query = (req.query.q || "").toString().trim();
    const limit = Math.min(Math.max(Number(req.query.limit) || 8, 1), 15);

    if (!query) {
    const fallback = await Product.find({
        isActive: true,
        isFeatured: true,
    })
        .select(
        "name slug brand category images minPrice maxPrice rating variants",
        )
        .sort({ rating: -1, totalSold: -1 })
        .limit(limit);

    return res.status(200).json({
        query: "",
        suggestions: fallback,
    });
    }

    const normalizedQuery = normalizeText(query);
    const regex = new RegExp(escapeRegex(query), "i");

    const candidates = await Product.find({ isActive: true })
    .select(
        "name slug brand category gender images minPrice maxPrice rating isFeatured variants",
    )
    .sort({ isFeatured: -1, rating: -1, totalSold: -1, createdAt: -1 })
    .limit(180);

    const queryTokenCount = normalizedQuery
    .split(" ")
    .filter(
        (t) => t.length > 0 && !STOP_WORDS.has(t) && !GENDER_TERMS.has(t),
    ).length;
    const minScore = queryTokenCount > 1 ? 0.45 : 0.2;

    const suggestions = candidates
    .map((product) => ({
        ...product.toObject(),
        _score: scoreSuggestion(normalizedQuery, product),
    }))
    .filter(
        (item) =>
        item._score >= minScore ||
        (queryTokenCount <= 1 &&
            (regex.test(item.name || "") || regex.test(item.brand || ""))),
    )
    .sort((a, b) => b._score - a._score)
    .slice(0, limit)
    .map(({ _score, ...product }) => product);

    return res.status(200).json({
    query,
    suggestions,
    });
} catch (err) {
    console.error(err);
    return res
    .status(500)
    .json({ message: "Failed to fetch search suggestions" });
}
};

module.exports = { getProducts, getHomeProducts, getSearchSuggestions };
