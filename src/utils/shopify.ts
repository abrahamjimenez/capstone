export async function fetchShopifyData(query: string) {
  try {
    const response = await fetch(process.env.STOREFRONT_API_URL as string, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": process.env
          .X_SHOPIFY_STOREFRONT_ACCESS_TOKEN as string,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      console.error("Shopify API error: ", response.statusText);
    }

    const json = await response.json();

    if (json.errors) {
      console.error("Shopify GraphQL error: ", JSON.stringify(json.errors));
    }

    return json.data;
  } catch (error) {
    console.error("Error fetching Shopify data:", error);
    throw error; // Optionally re-throw to handle it higher up
  }
}
