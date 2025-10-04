export const STORAGE_KEY = "orderItems";
// HTML structure for a loader element
export const LOADER_HTML = `<div class="loader__container"><span class="loader"></span></div>`;

/**
 * Navigate Back Button (on history)
 * Adds functionality to "back" buttons to navigate to the previous page if history exists,
 * or redirects to the homepage if no history is available.
 */
export const navigateBack = () => {
  document.querySelectorAll(".back__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (history.length > 1) {
        history.back();
      } else {
        window.location.href = "/";
      }
    });
  });
};

/**
 * Register dialog
 * Handles the display and interaction logic for the sign-up dialog.
 */

export const handleRegisterDialog = async () => {
  const dialog = document.getElementById("register-dialog");
  const showButton = document.getElementById("register_open-btn");
  const closeButton = document.getElementById("close-dialog");
  const emailInput = document.getElementById("signup-Email");
  const signupButton = document.getElementById("signup-btn");

  // Open the dialog and prevent page scrolling
  showButton.addEventListener("click", () => {
    dialog.showModal();
    document.body.style.overflow = "hidden"; // Prevent background scroll
  });

  // Close the dialog and restore page scrolling
  closeButton.addEventListener("click", () => {
    dialog.close();
    document.body.style.overflow = "auto"; // Re-enable background scroll
  });

  // Handle the sign-up button click
  // signupButton.addEventListener("click", () => {
  //   const email = emailInput.value;
  //   console.log(email);
  // });
};
/**
 * Creates an image element with fallback behavior.
 * If `src` is not provided or the image fails to load, a default placeholder is shown.
 */

export const createImageElement = (src, alt) => {
  if (!src)
    return '<div class="no_product-image">Sorry, no image available</div>';
  return `<img src="${src}" alt="${alt}" onerror="this.onerror=null;this.parentElement.innerHTML='<div class=${"no_product-image"}>Sorry, no image available</div>'"/>`;
};

/**
 * Calculates the discount percentage between the original price and the discounted price.
 * actualPrice  {number}  -  The original price of the product.
 * disPrice     {number}  -  The discounted price of the product.
 * Return       {number}  -  Discount percentage rounded to the nearest whole number.
 */

export const calculateDiscount = (actualPrice, disPrice) => {
  return Math.round(((actualPrice - disPrice) / actualPrice) * 100);
};
