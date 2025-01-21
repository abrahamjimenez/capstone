"use client";

import React, { useState } from "react";
import {
  Bars3Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useDisclosure } from "@mantine/hooks";
import { Button, Drawer } from "@mantine/core";
import { MenuInterface } from "@/components/NavigationMenu";
import Link from "next/link";

interface InnerMenuInterface {
  title: string;
  url: string;
  items: [{ title: string; url: string }];
}

const Hamburger = ({ data }: { data: MenuInterface }) => {
  const [openedDrawer, { open, close }] = useDisclosure(false);
  const [openedInnerDrawer, { open: openInner, close: closeInner }] =
    useDisclosure(false);
  const [innerData, setInnerData] = useState<InnerMenuInterface>();

  // get title
  // find all data from that title
  // add it to inner drawer
  function updateInnerDrawer(title: string) {
    const result: InnerMenuInterface | undefined = data.items.find(
      (item) => item.title === title
    );

    if (result) {
      console.log("Found:", result);
      setInnerData(result);
    } else {
      console.log("Not found");
    }
  }

  function resetDrawer() {
    closeInner();
    close();
  }

  return (
    <>
      <Drawer opened={openedDrawer} onClose={close} size={"sm"}>
        {/* Looping over the first level of items */}
        <div>
          {data.items.map(
            (item: {
              title: string;
              items: { title: string }[];
              url: string;
            }) => (
              <div key={item.title}>
                {item.items.length > 0 ? (
                  <Button
                    className={"p-0"}
                    size={"compact-md"}
                    variant="transparent"
                    color={"black"}
                    onClick={() => {
                      openInner();
                      updateInnerDrawer(item.title);
                    }}
                  >
                    <div className={"flex items-center cursor-pointer"}>
                      {item.title}
                      <ChevronRightIcon className={"size-6"} />
                    </div>
                  </Button>
                ) : (
                  <Link
                    href={item.url.replace(
                      process.env.NEXT_PUBLIC_SHOPIFY_URL as string,
                      "/"
                    )}
                    onClick={close}
                  >
                    {item.title}
                  </Link>
                )}
              </div>
            )
          )}
        </div>

        <Drawer opened={openedInnerDrawer} onClose={resetDrawer} size={"sm"}>
          <div className={"flex items-center cursor-pointer"}>
            <ChevronLeftIcon className={"size-6"} />
            <p onClick={closeInner} className={"font-bold"}>
              {innerData?.title}
            </p>
          </div>

          <div>
            {innerData?.items.map((item) => (
              <Link
                className={"block"}
                key={item.url}
                href={item.url.replace(
                  process.env.NEXT_PUBLIC_SHOPIFY_URL as string,
                  "/"
                )}
                onClick={close}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </Drawer>
      </Drawer>
      <Button
        className={"p-0"}
        size={"compact-md"}
        variant="transparent"
        color={"black"}
        onClick={open}
      >
        <Bars3Icon className={"size-6"} />
      </Button>
    </>
  );
};

export default Hamburger;
