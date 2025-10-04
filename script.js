import { products } from "./data.js";

// =========== Constants =============
const LOADER_HTML = `<div class="loader-container"><span class="loader"></span></div>`;

const CURRENT_DATE = new Date("Wed Jan 15 2025");

// Load cart from localStorage
const cartData = JSON.parse(localStorage.getItem("orderItems")) || [];

// Utility to update cart count
const updateCartCount = () => {
  const productCountLabels = document.querySelectorAll(".productCount");
  productCountLabels.forEach(
    (label) => (label.innerText = cartData.length || 0)
  );
};
updateCartCount();

// ----- * Navigate Back Button (on history) * ------
document.querySelectorAll(".back-button").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (history.length > 1) {
      history.back();
    } else {
      window.location.href = "/";
    }
  });
});

// -------- * Signup dialog * ------------
const dialog = document.getElementById("signUpDialog");
const showButton = document.getElementById("openSignUp");
const closeButton = document.getElementById("closeDialog");

// "Show the dialog" button opens the dialog modally
showButton.addEventListener("click", () => {
  dialog.showModal();
  document.body.style.overflow = "hidden";
});

// "Close" button closes the dialog
closeButton.addEventListener("click", () => {
  dialog.close();
  document.body.style.overflow = "auto";
});

// ----------- * Calculations * -----------

const calculateDiscount = (actualPrice, disPrice) => {
  return Math.round(((actualPrice - disPrice) / actualPrice) * 100);
};

const calculateCartTotals = () => {
  // Guard clause: Check if we're on the cart page
  const totalSection = document.getElementById("subTotal");
  if (!totalSection) return;

  // Get elements
  const elements = {
    subTotal: document.getElementById("subTotal"),
    totalDiscount: document.getElementById("totalDiscount"),
    deliveryFee: document.getElementById("deliveryFee"),
    total: document.getElementById("total"),
  };

  const currentCart = JSON.parse(localStorage.getItem("orderItems")) || [];

  // Initialize totals
  let subtotalCount = 0;
  let totalDiscountCount = 0;

  // Calculate totals
  currentCart.forEach((item) => {
    const product = products.find((p) => p.productId === item.productId);
    if (product) {
      const itemPrice = product.onSale ? product.salePrice : product.price;
      const discount = product.onSale ? product.price - product.salePrice : 0;

      subtotalCount += itemPrice * item.quantity;
      totalDiscountCount += discount * item.quantity;
    }
  });

  // Calculate total
  const deliveryFeeAmount = (2 / 100) * (totalDiscountCount + subtotalCount);
  const finalTotal = subtotalCount + deliveryFeeAmount;
  // Update DOM elements with formatted values

  elements.subTotal.innerText = `$${subtotalCount.toFixed(2)}`;
  elements.totalDiscount.innerText = `$${totalDiscountCount.toFixed(2)}`;
  elements.deliveryFee.innerText = `$${deliveryFeeAmount.toFixed(2)}`;
  elements.total.innerText = `$${finalTotal.toFixed(2)}`;
};

//* ------- * Generate Html * ---------

const createImageElement = (src, alt) => {
  if (!src) return '<div class="no-img">Vestia</div>';
  return `<img src="${src}" alt="${alt}" onerror="this.onerror=null;this.parentElement.innerHTML='<div class=${"no-img"}>Vestia</div>'"/>`;
};

const createProductCard = (
  productId,
  onSale = false,
  image,
  name = "Unknown",
  category = "unknown",
  salePrice = 0,
  price = 0
) =>
  `<div
  class="product"
  data-sale-type="${onSale}"
>
  <a href="product-detail.html?productId=${productId}">
    <div class="product-img">
     ${createImageElement(image, name)}
    </div>
    <div class="product-info">
      <p class="product-name">${name}</p>
      <span class="product-category">${category}</span>
    </div>
  </a>
  <div class="product-purchase">
    <div class="product-prices">
      <span class="product-dis_price">$${salePrice}</span>
      <span class="product-price">$${price}</span>
    </div>
    <span class="discount">-${calculateDiscount(price, salePrice)}%</span>
  </div>
</div>`;

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
) => `
<div
  class="product_detail product-section"
  data-sale-type="${onSale}"
>
  <div class="prod_image">
      ${createImageElement(productImg, productName)}
  </div>
  <div class="prod_info">
    <div class="prod_summary">
      <h2 class="prod_name">${productName}</h2>
      <div class="prod_purchase">
        <div class="prod_discount">
          <span class="prod_discountPrice">
            $${productSalePrice}
          </span>
          <span class="prod_price">$${productPrice}</span>
        </div>
        <div class="prod_discount-percent">
          -${calculateDiscount(productPrice, productSalePrice)}%
        </div>
      </div>
      <p class="prod_description">${productDescription}</p>
    </div>
    <hr />
    <div class="prod_form">
      <div class="prod_size">
        <span>Choose Size</span>
        <div class="size_available">
          ${productsSizes
            .map(
              (size, index) =>
                `<input
              type="radio"
              id="${size}"
              name="size"
              value="${size}"
              required
              ${index === 0 ? "checked" : ""}
              title="size"
            />
            <label for="${size}">${size}</label>`
            )
            .join("")}
        </div>
      </div>
      <hr />
      ${
        availableStock >= 1
          ? `
        <div class="prod_actions">
        <div class="prod_quantity">
          <button type="button" class="decrease_qty" id="decreaseQuantity">
            <i class="ri-subtract-line"></i>
          </button>
          <input
            type="text"
            class="input_qty"
            id="inputQty"
            value="1"
            min="1"
            max="${availableStock}"
            readonly
          />
          <button type="button" class="increase_qty" id="increaseQuantity">
            <i class="ri-add-line"></i>
          </button>
          <span> stock : ${availableStock}</span>
        </div>
        <button type="button" class="large-button" id="addToCart" 
        onclick="handleAddToCart('${productId}')">
          Add to Cart
        </button>
      </div>`
          : '<span class="stock-over">Out of stock</span>'
      }
    </div>
  </div>
</div>`;

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
<div class="order-item" data-item-sale="${isItemSale}">
  <div class="order-item_image">
  ${createImageElement(productImg, productName)}
  </div>
  <div class="order-item_details">
    <div class="order-item_summary">
      <div class="order-item_meta">
        <h3 class="order-item_name">${productName}</h3>
        <button type="button" class="order-item_remove" id="removeOrder" onclick="handleRemoveCartItem('${productId}')">
          <i class="ri-delete-bin-line"></i>
        </button>
      </div>
      <p class="order-item_size">
        size: <span>${productSize}</span>
      </p>
      <p class="order-item_category">${productCategory}</p>
    </div>

    <div class="order-item_purchase">
    <div class="order-item_value">
       <span class="order-item_salePrice">$${productSalePrice}</span>
       <span class="order-item_price">$${productPrice}</span>
     </div>
      <span class="order-item_quantity">Qty: ${productQty}</span>
    </div>
  </div>
</div>`;

//* ------- * Generate Html End !! * ---------

//* =========== Data Fetching and Page Updates ===========

// Filter products by category
const filterProducts = (category) => {
  return products.filter((product) => product.category === category);
};

//*---------- * Home page products  * -----------

const renderProducts = async (containerId, category) => {
  const container = document.getElementById(containerId);
  container.innerHTML = LOADER_HTML;

  try {
    const filteredProduct =
      category === "newArrival"
        ? products.filter(
            (item) =>
              CURRENT_DATE - new Date(item.createdAt) <= 5 * 24 * 3600 * 1000 // 5 days
          )
        : await filterProducts(category);

    if (filteredProduct.length > 0) {
      container.innerHTML = filteredProduct
        .map((product) =>
          createProductCard(
            product.productId,
            product.onSale,
            product.image,
            product.name,
            product.category,
            product.salePrice,
            product.price
          )
        )
        .join("");
    } else {
      container.innerHTML = `<div class="loader-container"><p>No products available at the moment.</p></div>`;
    }
  } catch (error) {
    console.error("Error while fetching products:", error);
    container.innerHTML = `<div class="loader-container"><p>Something went wrong. Please try again later.</p></div>`;
  }
};

// Page-specific functions

const newArrival = async () =>
  renderProducts("new-arrival-container", "newArrival");
const menWear = async () => renderProducts("menWear-container", "men");
const womenWear = async () => renderProducts("womenWear-container", "women");

//*---------- * Product Details Page * -----------

const productDetails = () => {
  const productDetailSection = document.getElementById("productDetail");

  // Extracting Product id from url dynamically
  const extractProductId = new URLSearchParams(window.location.search);
  const currentProductId = extractProductId.get("productId");

  // Show loader initially
  productDetailSection.innerHTML = LOADER_HTML;

  try {
    // Find product using productId
    const product = products.find((p) => p.productId === currentProductId);

    if (product) {
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
    } else {
      productDetailSection.innerHTML = `<div class="loader-container"><p>Product not found.</p></div>`;
    }
  } catch (error) {
    console.error("Error fetching product detail:", error);
    productDetailSection.innerHTML = `<div class="loader-container"><p>Something went wrong. Please try again later.</p></div>`;
  }
};

//* ------- * Order cart page * ---------

const loadOrders = async () => {
  const ordersContainer = document.getElementById("ordersList");

  // Show loader initially
  ordersContainer.innerHTML = LOADER_HTML;

  try {
    const currentCart = JSON.parse(localStorage.getItem("orderItems")) || [];
    if (currentCart.length > 0) {
      const orderItems = currentCart
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

      ordersContainer.innerHTML = orderItems;
      calculateCartTotals();
    } else {
      ordersContainer.innerHTML = `<div class="loader-container"><p>No Product Selected</p></div>`;
      calculateCartTotals();
    }
  } catch (error) {
    ordersContainer.innerHTML = `<div class="loader-container"><p>Something went wrong. Please try again later.</p></div>`;
  }
};

//* =========== Data Fetching and Page Updates End !! ===========

//* --------- * Increase & Decrease item qty * ----------
const handleItemQuantity = () => {
  const increaseQtyBtn = document.getElementById("increaseQuantity");
  const decreaseQtyBtn = document.getElementById("decreaseQuantity");
  const inputQtyField = document.getElementById("inputQty");

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

//* -------- * Add to cart * ----------
window.handleAddToCart = (productId) => {
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
      existingOrder.quantity = qualitySelected;
    } else {
      const newItem = {
        productId,
        selectedSize,
        quantity: parseInt(qualitySelected),
      };
      cartData.push(newItem);
      alert("Item added to cart");
      updateCartCount();
    }
    localStorage.setItem("orderItems", JSON.stringify(cartData));
  } catch (error) {
    console.log("Error add to cart", error);
    alert("Failed to add product to cart. Please try again later.");
  }
};

//* ------- * Remove Items from Cart * ------------
window.handleRemoveCartItem = async (productId) => {
  try {
    if (!productId) {
      throw new Error("productId is not available.");
    }
    // Filter out the removed item
    const currentCart = JSON.parse(localStorage.getItem("orderItems")) || [];
    const removeItem = currentCart.filter(
      (item) => item.productId !== productId
    );

    // Save the updated order items back to localStorage
    localStorage.setItem("orderItems", JSON.stringify(removeItem));

    await loadOrders();
    calculateCartTotals();
  } catch (error) {
    console.log("Error remove item from cart", error);
    alert("Failed to remove product from cart. Please try again later.");
  }
};

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  // Only run relevant functions based on page elements
  if (document.getElementById("new-arrival-container")) {
    newArrival();
  }
  if (document.getElementById("menWear-container")) {
    menWear();
  }
  if (document.getElementById("womenWear-container")) {
    womenWear();
  }
  if (document.getElementById("ordersList")) {
    loadOrders();
  }
  if (document.getElementById("productDetail")) {
    productDetails();
    handleItemQuantity();
  }
});
