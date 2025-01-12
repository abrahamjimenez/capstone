import React from "react";
import { fetchShopifyData } from "@/utils/shopify";
import Hamburger from "@/components/Hamburger";

export interface MenuInterface {
  items: [
    {
      title: string;
      url: string;
      items: [
        {
          title: string;
          url: string;
        },
      ];
    },
  ];
}

const NavigationMenu = async () => {
  const menuQuery = `{
    menu(handle: "main-menu") {
      items {
        title
        url
        items {
          title
          url
        }
      }
    }
  }`;

  let menuItems: MenuInterface = {
    items: [{ title: "", url: "", items: [{ title: "", url: "" }] }],
  };

  try {
    const { menu } = await fetchShopifyData(menuQuery);
    if (!menu && !menu.items) {
      Error("Menu data is empty or undefined");
    }

    menuItems = menu;
  } catch (error) {
    console.error("Failed to fetch shop name:", error);
  }

  return (
    <div>
      <Hamburger data={menuItems} />
    </div>
  );
};

export default NavigationMenu;
