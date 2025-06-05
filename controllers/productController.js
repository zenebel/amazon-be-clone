// Dummy product data
const products = [
  {
    id: 1,
    name: "Apple AirPods Pro",
    price: 199.99,
    inStock: true,
  },
  {
    id: 2,
    name: "Echo Dot (5th Gen)",
    price: 49.99,
    inStock: true,
  },
  {
    id: 3,
    name: "Kindle Paperwhite",
    price: 139.99,
    inStock: false,
  },
];

// @desc    Get all products
// @route   GET /products
export const getAllProducts = (req, res) => {
  console.log("GET /products triggered");
  res.json(products);
};

// @desc    Get single product by ID
// @route   GET /products/:id
export const getProductById = (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find((item) => item.id === id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(product);
};
