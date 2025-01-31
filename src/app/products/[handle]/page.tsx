import React from "react";
import { fetchShopifyData } from "@/utils/shopify";
import Image from "next/image";
import Product from "@/components/Product";

interface ProductData {
  title: string;
  descriptionHtml: string;
  variants: {
    nodes: [
      {
        price: {
          amount: string;
        };
        image: {
          url: string;
          altText: string;
        };
        selectedOptions: [
          {
            name: string;
            value: string;
          },
        ];
        quantityAvailable: number;
      },
    ];
  };
}

const Page = async ({ params }: { params: Promise<{ handle: string }> }) => {
  // todo Display data from handle
  // image, title, price, stock number?, color variants, size variants, description

  const handle = (await params).handle;
  const productByHandleQuery = `{
  product(handle: "${handle}") {
    title
    descriptionHtml
    variants(first: 100) {
      nodes {
        price {
          amount
        }
        image {
          url
          altText

        }
        selectedOptions {
          name
          value
        }
        quantityAvailable
      }
    }
  }
}`;
  // todo data: ProductData
  let data: ProductData = {
    title: "",
    descriptionHtml: "",
    variants: {
      nodes: [
        {
          price: {
            amount: "",
          },
          image: {
            url: "",
            altText: "",
          },
          selectedOptions: [
            {
              name: "",
              value: "",
            },
          ],
          quantityAvailable: 0,
        },
      ],
    },
  };

  const uniqueColors = new Set<string | "Gold" | "White gold">();

  try {
    const { product } = await fetchShopifyData(productByHandleQuery);
    data = product;

    // Collect unique colors
    data.variants.nodes.forEach((variant) => {
      variant.selectedOptions.forEach((option) => {
        if (option.name === "Color") {
          uniqueColors.add(option.value);
        }
      });
    });
  } catch (e) {
    console.error("Failed to fetch product data: ", e);
  }

  return (
    <div>
      <h1>Handle Page</h1>
      <Image
        src={data.variants.nodes[0].image.url}
        alt={data.variants.nodes[0].image.altText || data.title}
        width={1000}
        height={1000}
      />
      <p>{data.title}</p>
      Local component for some data
      <p>TODO: PRICE</p>
      <p>TODO: SOLD OUT || STOCK</p>
      {/*todo javascript SET method to only show the 2 values*/}
      <Product colors={uniqueColors} />
      <p>Color: </p>
      <p>Ring Size :</p>
      <p>Quantity: </p>
      <button>Sold out || Add to cart</button>
      <div dangerouslySetInnerHTML={{ __html: data.descriptionHtml }} />
    </div>
  );
};

export default Page;
