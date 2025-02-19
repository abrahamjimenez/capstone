"use client";

import { useEffect, useRef, useState } from "react";
import {
  ColorSwatch,
  Group,
  NumberInput,
  Button,
  Paper,
  NumberInputHandlers,
} from "@mantine/core";
import { PlusIcon, MinusIcon } from "@heroicons/react/20/solid";
import { ProductData } from "@/app/products/[handle]/page";
import Image from "next/image";
import { fetchShopifyData } from "@/utils/shopify";

interface CreateCartId {
  cartCreate: {
    cart: {
      id: string
    }
  }
}

const Product = ({
  colors,
  sizes,
  data,
}: {
  colors: Set<string>;
  sizes: Set<string>;
  data: ProductData;
}) => {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const handlersRef = useRef<NumberInputHandlers>(null);

  useEffect(() => {
    if (data.variants.nodes.length > 0) {
      const firstVariant = data.variants.nodes[0];
      const colorOption = firstVariant.selectedOptions.find(
        (opt) => opt.name === "Color"
      );
      const sizeOption = firstVariant.selectedOptions.find(
        (opt) => opt.name === "Size"
      );

      if (colorOption) setSelectedColor(colorOption.value);
      if (sizeOption) setSelectedSize(sizeOption.value);
    }
  }, [data.variants.nodes]); // Run when variants data changes

  // This keeps track of the Size and Color. Uses find() to find the product variant id
  useEffect(() => {
    const filteredVariant = data.variants.nodes.find(
      (variant) =>
        variant.selectedOptions.some(
          (opt) => opt.name === "Color" && opt.value === selectedColor
        ) &&
        variant.selectedOptions.some(
          (opt) => opt.name === "Size" && opt.value === selectedSize
        )
    );

    if (filteredVariant) {
      setSelectedVariantId(filteredVariant.id)
    }
  }, [selectedSize, selectedColor]);

  const createCartIdMutation = `mutation {
    cartCreate {
      cart {
        id
      }
    }
  }`

  const handleAddToCart =  async () => {
    const cartData: CreateCartId = await fetchShopifyData(createCartIdMutation);
    const cartId = cartData.cartCreate.cart.id

    if (!localStorage.getItem("cartId")) {
      localStorage.setItem("cartId", cartId)
    }

    // todo get item clicked, qty, variant, and what not and add to cart data
    console.log("cartId already exists")
    console.log(data);
    console.log(selectedColor, selectedSize);
  }

  return (
    <div>
      {selectedVariantId ? (
        <div>
          <Image
            src={data.variants.nodes.find((variant) => variant.id === selectedVariantId)?.image.url ?? ""}
            alt={data.variants.nodes.find((variant) => variant.id === selectedVariantId)?.image.altText ?? data.title}
            width={1000}
            height={1000}
            priority
          />
          <h1>{data.title}</h1>
          <p>Price: ${data.variants.nodes.find((variant) => variant.id === selectedVariantId)?.price.amount}</p>
        </div>
      ) : (
        <div>
          <Image
            src={data.variants.nodes[0].image.url}
            alt={data.variants.nodes[0].image.altText || data.title}
            width={1000}
            height={1000}
            priority
          />
          <h1>{data.title}</h1>
          <p>Price: ${data.variants.nodes[0].price.amount}</p>
        </div>
      )}

      {selectedVariantId && <p>Color:</p>}

      <Group>
        {Array.from(colors).map((color, index) => (
          <ColorSwatch
            key={index}
            color={
              color === "White"
                ? "white"
                : color === "Rose CZ"
                  ? "#B76E79"
                  : "#ccc"
            }
            withShadow={selectedColor === color}
            onClick={() => setSelectedColor(color)}
            style={{
              cursor: "pointer",
              border: selectedColor === color ? "2px solid black" : "none",
            }}
          />
        ))}
      </Group>

      <Paper p="md" withBorder>
        <Group>
          <Button
            variant={"transparent"}
            onClick={() => handlersRef.current?.decrement()}
            disabled={
              data.variants.nodes.find((variant) => variant.id === selectedVariantId)?.quantityAvailable === 0
            }
          >
            <MinusIcon className="size-6" />
          </Button>

          <NumberInput
            handlersRef={handlersRef}
            min={1}
            max={
              data.variants.nodes.find((variant) => variant.id === selectedVariantId)?.quantityAvailable

            }
            defaultValue={1}
            hideControls
            disabled={
              data.variants.nodes.find((variant) => variant.id === selectedVariantId)?.quantityAvailable === 0
            }
          />
          <Button
            variant={"transparent"}
            onClick={() => handlersRef.current?.increment()}
            disabled={
              data.variants.nodes.find((variant) => variant.id === selectedVariantId)?.quantityAvailable === 0
            }
          >
            <PlusIcon className="size-6" />
          </Button>
        </Group>
      </Paper>

      {selectedVariantId && (
        <>
          <p>Sizes:</p>
          <Paper p="md" withBorder>
            <Group>
              {Array.from(sizes)
                .sort()
                .map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "filled" : "outline"}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </Button>
                ))}
            </Group>
          </Paper>
        </>
      )}

      {selectedVariantId ? (
        <div>
          <p>
            {(data.variants.nodes.find((variant) => variant.id = selectedVariantId)?.quantityAvailable ?? 0) > 0 ? "In Stock" : "Sold Out"}
          </p>
          <Button
            disabled={data.variants.nodes.find(variant => variant.id === selectedVariantId)?.quantityAvailable === 0}
            onClick={() => handleAddToCart()}>
            Add to Cart
          </Button>
        </div>
      ) : (
        <div>
          <p>
            {data.variants.nodes[0].quantityAvailable > 0
              ? "In Stock"
              : "Sold Out"}
          </p>
          <Button disabled={data.variants.nodes[0].quantityAvailable === 0} onClick={() => handleAddToCart()}>
            Add to Cart
          </Button>
        </div>
      )}
    </div>
  );
};

export default Product;
