// Importing utility functions and initialization modules
import { handleRegisterDialog, navigateBack } from "./common.js";
import { initializeHomePage } from "./homePage.js";
import { initializeProductDetails, updateCartCount } from "./productDetails.js";
import { initializeCart } from "./cart.js";

// Callbacks and initializations for different page functionalities
navigateBack();
updateCartCount();
handleRegisterDialog();

// Initialize the homepage if it's the homepage view
initializeHomePage();

// Initialize the cart page if the orders list is present in the DOM
if (document.getElementById("order-items")) {
  initializeCart();
}
// Initialize the product details page if it's the product detail view
if (document.getElementById("product-detail")) {
  initializeProductDetails();
}
