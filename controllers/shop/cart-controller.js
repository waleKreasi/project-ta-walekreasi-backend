const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const Seller = require("../../models/Seller");

const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Data yang diberikan tidak valid!",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan.",
      });
    }

    const seller = await Seller.findById(product.sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Toko tidak ditemukan.",
      });
    }

    if (product.totalStock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Stok tidak mencukupi. Maksimum hanya tersedia ${product.totalStock} item.`,
      });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, itemsByStore: [] });
    }

    const storeIndex = cart.itemsByStore.findIndex(
      (entry) => entry.storeId.toString() === seller._id.toString()
    );

    if (storeIndex === -1) {
      cart.itemsByStore.push({
        storeId: seller._id,
        storeName: seller.storeName,
        items: [{ productId, quantity }],
      });
    } else {
      const productIndex = cart.itemsByStore[storeIndex].items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (productIndex === -1) {
        cart.itemsByStore[storeIndex].items.push({ productId, quantity });
      } else {
        const currentQty = cart.itemsByStore[storeIndex].items[productIndex].quantity;
        const newQty = currentQty + quantity;

        if (newQty > product.totalStock) {
          return res.status(400).json({
            success: false,
            message: `Stok tidak mencukupi. Maksimum hanya tersedia ${product.totalStock} item.`,
          });
        }

        cart.itemsByStore[storeIndex].items[productIndex].quantity = newQty;
      }
    }

    await cart.save();
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
    });
  }
};

const fetchCartItems = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "ID pengguna wajib diisi!",
      });
    }

    const cart = await Cart.findOne({ userId }).populate({
      path: "itemsByStore.items.productId",
      select: "image title price salePrice totalStock", // ✅ totalStock ditambahkan
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Keranjang tidak ditemukan.",
      });
    }

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
    });
  }
};

const updateCartItemQty = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Data yang diberikan tidak valid!",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan.",
      });
    }

    if (quantity > product.totalStock) {
      return res.status(400).json({
        success: false,
        message: `Stok tidak mencukupi. Maksimum hanya tersedia ${product.totalStock} item.`,
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Keranjang tidak ditemukan.",
      });
    }

    let itemUpdated = false;

    for (let store of cart.itemsByStore) {
      const itemIndex = store.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (itemIndex !== -1) {
        store.items[itemIndex].quantity = quantity;
        itemUpdated = true;
        break;
      }
    }

    if (!itemUpdated) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan di keranjang.",
      });
    }

    await cart.save();
    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
    });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "Data yang diberikan tidak valid!",
      });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Keranjang tidak ditemukan.",
      });
    }

    for (let i = 0; i < cart.itemsByStore.length; i++) {
      const storeGroup = cart.itemsByStore[i];
      const originalLength = storeGroup.items.length;

      storeGroup.items = storeGroup.items.filter(
        (item) => item.productId.toString() !== productId
      );

      if (storeGroup.items.length === 0 && originalLength > 0) {
        cart.itemsByStore.splice(i, 1);
        i--; // Adjust index after splice
      }
    }

    await cart.save();
    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
    });
  }
};

module.exports = {
  addToCart,
  fetchCartItems,
  updateCartItemQty,
  deleteCartItem,
};
