const API_URL = "https://mocki.io/v1/51f98500-3824-43da-a172-fa2f2ec771e8";

export const fetchProducts = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};
