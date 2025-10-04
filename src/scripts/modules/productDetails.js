import {
  LOADER_HTML,
  STORAGE_KEY,
  calculateDiscount,
  createImageElement,
} from "./common.js";
import { fetchProducts } from "./services.js";

// ------ * Cart data management * ---------

export const cartData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

/**
 * Generates the HTML structure for the product details section.
 *  productId            {string}   -  Unique identifier for the product.
 *  onSale               {boolean}  -  Indicates if the product is on sale.
 *  productImg           {string}   -  Image URL of the product.
 *  productName          {string}   -  Name of the product.
 *  productDescription   {string}   -  Description of the product.
 *  productsSizes        {Array}    -  List of available sizes for the product.
 *  productSalePrice     {number}   -  Sale price of the product.
 *  productPrice         {number}   -  Regular price of the product.
 *  availableStock       {number}   -  Available stock for the product.
 */

const productDetailHTML = (
  productId,
  onSale = false,
  productImg,
  productName = "Unknown",
  productDescription = "No description",
  productsSizes = [],
  productSalePrice = 0,
  productPrice = 0,
  availableStock = 0
) =>
  `
<div class="product_detail-card" data-discount="${onSale}">
<!-- Product Image -->
<div class="product_detail-image">
${createImageElement(productImg, productName)}
</div>
<!-- Product Details -->
<div class="product_detail-data">
  <!-- Name , Discount Price , Price , Description & Discount Percent -->
  <div class="product_detail-summary">
    <h2 class="product_detail-name">
    ${productName}
    </h2>
    <!--  Discount Price , Price & Discount Percent  -->
    <div class="product_detail-value">
      <!--  Discount Price & Price  -->
      <div class="detail_buy-value">
        <span class="product_detail-discount">  $${productSalePrice}</span>
        <span class="product_detail-price">$${productPrice}</span>
      </div>
      <span class="product_detail-dispercent">-${calculateDiscount(
        productPrice,
        productSalePrice
      )}%</span>
    </div>
    <p class="product_detail-description">
    ${productDescription}
    </p>
  </div>
  <!-- Choose Size -->
  <hr />
  <div class="product_choose-size">
    <h6>Choose Size</h6>
    <div class="product__sizes">

    ${productsSizes
      .map(
        (size, index) =>
          `  <div>
          <input
            type="radio"
            title="size"
            name="size"
            class="radio__input"
            value="${size}"
            id="${size}"
            ${index === 0 ? "checked" : ""}
          />
          <label for="${size}" class="radio__label">
          ${size}
          </label>
        </div>`
      )
      .join("")}
    </div>
  </div>
  <hr />
  <!-- Quantity & Add to cart btn -->
  ${
    availableStock >= 1
      ? `
  <div class="product_detail-actions">
    <!-- Increase & Decrease Quantity -->
    <div class="product__quantity">
      <!-- Decrease Quantity Btn -->
      <button class="decrease__qty" id="decrease-qty">
        <i class="ri-subtract-line"></i>
      </button>

      <input
        type="text"
        class="product_qty-input"
        id="qty-input"
        value="1"
        min="1"
        max="${availableStock}"
        readonly
      />
      <button class="increase__qty" id="increase-qty">
        <i class="ri-add-line"></i>
      </button>

      <span class="product__instock">stock:${availableStock}</span>
    </div>
    <button
      class="product_add-cart primary__btn"
      id="add-to-cart-btn"
      onclick="handleAddToCart('${productId}')"
    >
      Add to Cart
    </button>
  </div>`
      : `
  <div class="product__outofstock">Out of stock</div>`
  }
</div>
</div>
`;

/**
 * Updates the cart count label based on the items in the cart.
 */
export const updateCartCount = () => {
  const productCountLabels = document.querySelectorAll(".productCount");
  productCountLabels.forEach(
    (label) => (label.innerText = cartData.length || 0)
  );
};

/**
 * Handles the increase and decrease of the item quantity in the product detail section.
 */
const handleItemQuantity = () => {
  const increaseQtyBtn = document.getElementById("increaseQuantity");
  const decreaseQtyBtn = document.getElementById("decreaseQuantity");
  const inputQtyField = document.getElementById("inputQty");

  // Updates the state of the increase and decrease buttons based on the current quantity.
  const updateQtyButtonState = () => {
    const value = parseInt(inputQtyField.value);
    increaseQtyBtn.disabled = value >= parseInt(inputQtyField.max);
    decreaseQtyBtn.disabled = value <= 1;
  };

  // Increase
  increaseQtyBtn.addEventListener("click", () => {
    let value = parseInt(inputQtyField.value);
    value = isNaN(value) ? 1 : Math.min(value + 1, parseInt(inputQtyField.max));
    inputQtyField.value = value;
    updateQtyButtonState();
  });

  // Decrease
  decreaseQtyBtn.addEventListener("click", () => {
    let value = parseInt(inputQtyField.value);
    value = isNaN(value) ? 1 : Math.max(value - 1, 1);
    inputQtyField.value = value;
    updateQtyButtonState();
  });
};

/**
 * Adds the selected product to the cart.
 * productId  {string}  - Unique identifier of the product.
 */
const handleAddToCart = (productId) => {
  const selectedSize = document.querySelector(
    'input[name="size"]:checked'
  ).value;
  const qualitySelected = document.getElementById("inputQty").value;

  try {
    if (!productId) {
      throw new Error("productId is not available.");
    }

    // Check if product is already present (ProductId && SelectedSize)
    const existingOrder = cartData.find(
      (item) =>
        item.productId === productId && item.selectedSize === selectedSize
    );

    if (existingOrder) {
      // Update quantity if the item already exists in the cart
      existingOrder.quantity = qualitySelected;
    } else {
      const newItem = {
        productId,
        selectedSize,
        quantity: parseInt(qualitySelected),
      };
      // Add new item to the cart
      cartData.push(newItem);
      alert("Item added to cart");
      updateCartCount();
    }
    // Persist cart data in localStorage
    localStorage.setItem("orderItems", JSON.stringify(cartData));
  } catch (error) {
    console.log("Error add to cart", error);
    alert("Failed to add product to cart. Please try again later.");
  }
};

export const initializeProductDetails = async () => {
  const productDetailSection = document.getElementById(
    "product_detail-wrapper"
  );

  // Extracting Product id from url dynamically
  const extractProductId = new URLSearchParams(window.location.search);
  const currentProductId = extractProductId.get("productId");

  // Show loader initially
  productDetailSection.innerHTML = LOADER_HTML;

  try {
    // Fetch all products from the service
    const products = await fetchProducts();

    // Find product using productId
    const product = products.find((p) => p.productId === currentProductId);

    if (product) {
      // Render product details on successful fetch
      productDetailSection.innerHTML = productDetailHTML(
        product.productId,
        product.onSale,
        product.image,
        product.name,
        product.description,
        product.sizes,
        product.salePrice,
        product.price,
        product.stock
      );

      // handleItemQuantity(); // Initialize quantity functionality
      // window.handleAddToCart = handleAddToCart; // Expose addToCart function globally
    } else {
      productDetailSection.innerHTML = `<div class="loader-container"><p>Product not found.</p></div>`;
    }
  } catch (error) {
    console.error("Error fetching product detail:", error);
    productDetailSection.innerHTML = `<div class="loader-container"><p>Something went wrong. Please try again later.</p></div>`;
  }
};
