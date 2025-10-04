import { LOADER_HTML, STORAGE_KEY, createImageElement } from "./common.js";
import { fetchProducts } from "./services.js";

/**
 * Generates the HTML structure for displaying an individual order item in the cart.
 *  productId          {string}  -  Unique identifier for the product.
 *  productName        {string}  -  Name of the product.
 *  productImg         {string}  -  Image URL of the product.
 *  productQty         {number}  -  Quantity of the product in the cart.
 *  productSize        {string}  -  Selected size of the product.
 *  productPrice       {number}  -  Regular price of the product.
 *  productSalePrice   {number}  -  Sale price of the product.
 *  isItemSale         {boolean} -  Whether the item is on sale.
 *  productCategory    {string}  -  Category of the product.
 */

const orderItemHTML = (
  productId,
  productName = "Unknown",
  productImg,
  productQty = 0,
  productSize = "unknown",
  productPrice = 0,
  productSalePrice = 0,
  isItemSale = false,
  productCategory = "unknown"
) => `
<div class="order__item" data-discount="${isItemSale}">
<!-- Item image -->
<div class="order_item-image">
${createImageElement(productImg, productName)}
</div>
<!-- Item Details -->
<div class="order_item-data">
  <!-- Name , Remove Btn , Size & Category -->
  <div class="order_item-summary">
    <!-- Name & Remove Btn -->
    <div class="order_item-meta">
      <h3 class="order_item-name">
      ${productName}
      </h3>
      <button class="order_item-remove" id="order-remove"
      onclick="handleRemoveCartItem('${productId}')">
        <i class="ri-delete-bin-line"></i>
      </button>
    </div>
    <!-- Size & Category -->
    <p class="order_item-size">size: ${productSize}</p>
    <p class="order_item-category">${productCategory}</p>
  </div>
  <!-- Discount Price , Price & Quantity -->
  <div class="order_item-purchase">
    <!-- Discount Price & Price -->
    <div class="order_item-value">
      <span class="order_item-disPrice">$${productSalePrice}</span>
      <span class="order_item-price">$${productPrice}</span>
    </div>
    <span class="order_item-quantity">Qty: ${productQty}</span>
  </div>
</div>
</div>
`;

/**
 * Calculates the total cost, discount, delivery fee, and final total for the cart.
 */

const calculateCartTotals = async () => {
  const totalSection = document.getElementById("subTotal");
  if (!totalSection) return;

  // Fetch all products data
  const products = await fetchProducts();
  const currentCart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  // Elements where totals will be displayed
  const elements = {
    subTotal: document.getElementById("subTotal"),
    totalDiscount: document.getElementById("totalDiscount"),
    deliveryFee: document.getElementById("deliveryFee"),
    total: document.getElementById("total"),
  };

  // Initialize subtotal and discount values
  let subtotalCount = 0;
  let totalDiscountCount = 0;

  // Calculate totals based on the cart data
  currentCart.forEach((item) => {
    const product = products.find((p) => p.productId === item.productId);
    if (product) {
      const itemPrice = product.onSale ? product.salePrice : product.price;
      const discount = product.onSale ? product.price - product.salePrice : 0;

      subtotalCount += itemPrice * item.quantity;
      totalDiscountCount += discount * item.quantity;
    }
  });
  // Delivery fee calculation
  const deliveryFeeAmount = (2 / 100) * (totalDiscountCount + subtotalCount);

  // Calculate final total
  const finalTotal = subtotalCount + deliveryFeeAmount;

  // Update the UI with calculated values
  elements.subTotal.innerText = `$${subtotalCount.toFixed(2)}`;
  elements.totalDiscount.innerText = `$${totalDiscountCount.toFixed(2)}`;
  elements.deliveryFee.innerText = `$${deliveryFeeAmount.toFixed(2)}`;
  elements.total.innerText = `$${finalTotal.toFixed(2)}`;
};

/**
 * Handles the removal of an item from the cart.
 * productId {string}  - Unique identifier for the product to be removed.
 */
const handleRemoveCartItem = (productId) => {
  try {
    if (!productId) {
      throw new Error("productId is not available.");
    }
    const currentCartItems =
      JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    // Remove the item from the cart
    const removeItem = currentCartItems.filter(
      (item) => item.productId !== productId
    );

    // Save the updated cart back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(removeItem));

    loadOrders(); // Reload orders after removal
    calculateCartTotals(); // Recalculate totals after item removal
  } catch (error) {
    console.log("Error remove item from cart", error);
    alert("Failed to remove product from cart. Please try again later.");
  }
};

/**
 * Loads and displays all the items in the cart.
 * It fetches product data and dynamically updates the UI.
 */
const loadOrders = async () => {
  const ordersContainer = document.getElementById("order-items");
  ordersContainer.innerHTML = LOADER_HTML; // Show loading indicator initially

  try {
    // Fetch product details from the API
    const products = await fetchProducts();
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    if (orders.length > 0) {
      const orderItems = orders
        .map((item) => {
          const product = products.find((p) => p.productId === item.productId);

          return product
            ? orderItemHTML(
                product.productId,
                product.name,
                product.image,
                item.quantity,
                item.selectedSize,
                product.price,
                product.salePrice,
                product.onSale,
                product.category
              )
            : null;
        })
        .filter(Boolean)
        .join("");

      ordersContainer.innerHTML = orderItems; // Update the orders container with cart items
      calculateCartTotals(); // Recalculate cart totals
    } else {
      ordersContainer.innerHTML = `<div class="loader__container"><p>No Product Selected</p></div>`;
      calculateCartTotals(); // Recalculate totals for empty cart
    }
  } catch (error) {
    console.log("Error cart loading:", error);
    ordersContainer.innerHTML = `<div class="loader__container"><p>Something went wrong. Please try again later.</p></div>`;
  }
};

/**
 * Initializes the cart by loading the orders and setting up necessary event listeners.
 */
export const initializeCart = () => {
  loadOrders();
  window.handleRemoveCartItem = handleRemoveCartItem;
};
