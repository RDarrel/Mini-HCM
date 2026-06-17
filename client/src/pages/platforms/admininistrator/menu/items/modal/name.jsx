import { AlertCircle } from "lucide-react";
import { useSelector } from "react-redux";

const normalizeName = (value = "") => value.trim().toLowerCase();

const Name = ({ name = "", selectedId }) => {
  const { collections } = useSelector(({ menus }) => menus);
  const normalizedName = normalizeName(name);

  if (!normalizedName) {
    return null;
  }

  const existingMenu = collections.find(
    (item) =>
      normalizeName(item.name) === normalizedName && item._id !== selectedId,
  );

  if (existingMenu) {
    return (
      <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>"{name.trim()}" already exists. Please use a different menu name.</p>
      </div>
    );
  }
  return null;
};

export const isExistingMenuName = (collections = [], name = "", selectedId) => {
  const normalizedName = normalizeName(name);

  if (!normalizedName) {
    return false;
  }

  return collections.some(
    (item) =>
      normalizeName(item.name) === normalizedName && item._id !== selectedId,
  );
};

export default Name;
