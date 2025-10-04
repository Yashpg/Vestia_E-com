import {
  LOADER_HTML,
  calculateDiscount,
  createImageElement,
} from "./common.js";
import { fetchProducts } from "./services.js";

// Reference date for filtering new arrivals
const CURRENT_DATE = new Date("Wed Jan 15 2025");

// Filter products created within 5 days
const FILTER_DATE = 5 * 24 * 3600 * 1000;

/**
 * Generates a product card as an HTML string.
 *   productId  {string}  -  Unique ID of the product.
 *   onSale     {boolean} -  Indicates if the product is on sale.
 *   image      {string}  -  URL of the product image.
 *   name       {string}  -  Name of the product.
 *   category   {string}  -  Category of the product.
 *   salePrice  {number}  -  Sale price of the product.
 *   price      {number}  -  Original price of the product.
 */

const createProductCard = (
  productId,
  onSale = false,
  image,
  name = "Unknown",
  category = "unknown",
  salePrice = 0,
  price = 0
) =>
  `
  <div class="product__card" data-discount="${onSale}">
            <!-- Image , Name & Category -->
            <a
              href="product-detail.html?productId=${productId}"
              class="product_detail-link"
            >
              <div class="product_image-holder">
              ${createImageElement(image, name)}
              </div>
              <!-- Name & Category -->
              <div class="product__meta">
                <h6 class="product__name">
                ${name}
                </h6>
                <span class="product__category">${category}</span>
              </div>
            </a>
            <!--  Price , Discount Price , Discount Percentage -->
            <div class="product__data">
              <!-- Price & Discount Price -->
              <div class="product__value">
                <span class="product_discount-price">$${salePrice}</span>
                <span class="product__price">$${price}</span>
              </div>
              <span class="product_discount-percent">-${calculateDiscount(
                price,
                salePrice
              )}%</span>
            </div>
          </div>

`;

// ---- * Filters products by category. * ----
const filterProducts = (products, category) => {
  return products.filter((product) => product.category === category);
};

/**
 * Fetches and renders products into the specified container.
 * Handles special cases like "newArrival" filtering based on creation date.
 */

const renderProducts = async (containerId, category) => {
  const container = document.getElementById(containerId);
  container.innerHTML = LOADER_HTML; // Show loader while fetching products
  try {
    const products = await fetchProducts();
    // If category is "newArrival," filter products added in the last 5 days
    const filteredProduct =
      category === "newArrival"
        ? products.filter(
            (item) => CURRENT_DATE - new Date(item.createdAt) <= FILTER_DATE
          )
        : filterProducts(products, category);

    // Render the products or show a fallback message if none exist
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

// Initializes the homepage by rendering products for specific sections

export const initializeHomePage = () => {
  if (document.getElementById("arrival-container")) {
    renderProducts("arrival-container", "newArrival");
  }
  if (document.getElementById("menwear-container")) {
    renderProducts("menwear-container", "men");
  }
  if (document.getElementById("womenwear-container")) {
    renderProducts("womenwear-container", "women");
  }
};
