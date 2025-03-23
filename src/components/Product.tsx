"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import classes from "./Product.module.css";
import {
  NumberInput,
  Button,
  Paper,
  NumberInputHandlers,
} from "@mantine/core";
import { PlusIcon, MinusIcon } from "@heroicons/react/20/solid";
import { ProductData } from "@/app/products/[handle]/page";
import { fetchShopifyData } from "@/utils/shopify";
import ImageCarousel from "@/components/ImageCarousel";

interface CreateCartId {
  cartCreate: {
    cart: {
      id: string;
    };
  };
}

interface CartResponse {
  cartLinesAdd: {
    cart: {
      id: string;
      checkoutUrl: string;
    };
  };
}

const Product = ({ data }: { data: ProductData }) => {
  const productId = data.variants.nodes[0]?.id;
  const handlersRef = useRef<NumberInputHandlers>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [cartId, setCartId] = useState<string | null>(null);

  useEffect(() => {
    const existingCartId = localStorage.getItem("cartId");
    if (existingCartId) {
      setCartId(existingCartId);
    }
  }, []);

  const handleAddToCart = useCallback(async () => {
    try {
      let currentCartId = cartId;

      if (!currentCartId) {
        const createCartIdMutation = `mutation {
          cartCreate {
            cart {
              id
            }
          }
        }`;
        const cartData: CreateCartId = await fetchShopifyData(createCartIdMutation);
        currentCartId = cartData?.cartCreate?.cart?.id;

        if (!currentCartId) {
          console.error("Failed to create cart");
          return;
        }

        setCartId(currentCartId);
        localStorage.setItem("cartId", currentCartId);
      }

      const addProductsToCartMutation = `mutation {
        cartLinesAdd(
          cartId: "${currentCartId}"
          lines: [{quantity: ${quantity}, merchandiseId: "${productId}"}]
        ) {
          cart {
            id
            checkoutUrl
          }
        }
      }`;

      const cartResponse: CartResponse = await fetchShopifyData(addProductsToCartMutation);
      const checkoutUrl = cartResponse?.cartLinesAdd?.cart?.checkoutUrl;

      if (checkoutUrl) {
        localStorage.setItem("checkoutUrl", checkoutUrl);
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  }, [cartId, productId, quantity]);

  const imageUrls: string[] = data.images.edges.map((map) => map.node.url);

  return (
    <div className={"p-4 sm:px-6 lg:p-8"}>
      <div className={"md:grid md:grid-cols-2 gap-10 mx-auto"}>
        <ImageCarousel images={imageUrls} />
        <div className={"pt-6 flex flex-col gap-4"}>
          <h2 className={"text-2xl md:text-3xl"}>{data.title}</h2>
          <p className={"font-bold text-sm md:text-lg"}>
            ${parseFloat(data.variants.nodes[0]?.price.amount || "0").toFixed(2)} USD
          </p>
          <p className={"text-xs text-gray-500 md:hidden"}>Quantity</p>
        </div>
      </div>

      <Paper p="md" withBorder className={"flex justify-center"} classNames={classes}>
        <Button variant={"transparent"} onClick={() => handlersRef.current?.decrement()}>
          <MinusIcon className="size-6" />
        </Button>

        <NumberInput
          classNames={classes}
          handlersRef={handlersRef}
          min={1}
          value={quantity}
          onChange={(value) => {
            if (typeof value === "number") {
              setQuantity(value);
            }
          }}
          defaultValue={1}
          hideControls
        />
        <Button variant={"transparent"} onClick={() => handlersRef.current?.increment()}>
          <PlusIcon className="size-6" />
        </Button>
      </Paper>

      <p className={"text-gray-500 text-xs md:text-sm lg:text-lg md:text-gray-600 pt-4"}>
        {data.variants.nodes[0]?.quantityAvailable > 0 ? "In Stock" : "Sold Out"}
      </p>
      <Button
        disabled={data.variants.nodes[0]?.quantityAvailable === 0}
        onClick={handleAddToCart}
        fullWidth
      >
        Add to Cart
      </Button>
    </div>
  );
};

export default Product;
