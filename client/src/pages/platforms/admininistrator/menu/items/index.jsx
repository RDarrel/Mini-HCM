import { useEffect } from "react";

import Modal from "./modal";
import "./style.css";
import { useDispatch, useSelector } from "react-redux";
import { BROWSE } from "@/services/redux/slices/menu/menus";
import { BROWSE as BROWSE_CATEGORIES } from "@/services/redux/slices/menu/categories";
import { BROWSE as BROWSE_INVENTORY_ITEMS } from "@/services/redux/slices/inventory/inventoryItems";
import { BROWSE as BROWSE_ADD_ONS } from "@/services/redux/slices/menu/addOns/addOns";
import Header from "./header";
import Body from "./body";

const Items = () => {
  const dispatch = useDispatch();
  const { token } = useSelector(({ auth }) => auth);

  useEffect(() => {
    // Scope "page-level" CSS behaviors to Menu > Items only.
    document.documentElement.classList.add("menu-items-scope");
    document.body.classList.add("menu-items-scope");

    return () => {
      document.documentElement.classList.remove("menu-items-scope");
      document.body.classList.remove("menu-items-scope");
    };
  }, []);

  useEffect(() => {
    if (token) {
      dispatch(BROWSE({ token }));
      dispatch(BROWSE_CATEGORIES({ token }));
      dispatch(BROWSE_INVENTORY_ITEMS({ token }));
      dispatch(BROWSE_ADD_ONS({ token }));
    }
  }, [token, dispatch]);

  return (
    <div className="menu-items-page  bg-background text-foreground p-4 md:p-5 ">
      <div className="mx-auto max-w-7xl space-y-4">
        <Header />
        <Body />
      </div>

      <Modal />
    </div>
  );
};

export default Items;
