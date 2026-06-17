import { useEffect, useRef, useState } from "react";
import { PhilippinePeso } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { capitalize, Formatter } from "@/services/utilities";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  SetNEW_MENU,
  SetUPDATED_MENU,
  TOGGLE,
  UPDATE,
} from "@/services/redux/slices/menu/menus";
import Bundles from "./bundles";
import { Type } from "@/services/fakeDB";
import { SAVE } from "@/services/redux/slices/menu/menus";
import Cloudinary from "@/services/utilities/cloudinary";
import { UPLOAD } from "@/services/redux/slices/persons/auth";
import MenuImage from "./image";
import Name, { isExistingMenuName } from "./name";
import Recipe from "./recipe";
import Resell from "./resell";
import RecommendedAddOns from "./addOns";
import FooterActions from "./footer-actions";
import {
  RemoveSetupConfirmDialog,
  SaveUnavailableNoticeDialog,
} from "./warning-dialogs";
import PriceWarningDialog from "./price-warning-dialog";
import {
  getInventoryCost,
  getUnitOptions,
  mapSelectedIngredient,
  resolveUnitValue,
} from "../../addOns/modal/utils";
import {
  getRemoveSetupCopy,
  getSetupOnlyDialogMeta,
  getSetupRequirementLabel,
  initialForm,
} from "./copy";

const Modal = () => {
  const { token } = useSelector(({ auth }) => auth);
  const {
    showModal,
    selected,
    modalMode,
    willCreate,
    category: actCategory,
    collections,
  } = useSelector(({ menus }) => menus);
  const { collections: categories } = useSelector(
    ({ menuCategories }) => menuCategories,
  );
  const { collections: inventoryItems = [] } = useSelector(
    ({ inventoryItems }) => inventoryItems,
  );
  const { collections: addOns } = useSelector(({ addOns }) => addOns);

  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitIntent, setSubmitIntent] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [showPriceWarning, setShowPriceWarning] = useState(false);
  const [showSetupLaterWarning, setShowSetupLaterWarning] = useState(false);
  const [showRemoveSetupWarning, setShowRemoveSetupWarning] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [pendingSetupLaterPayload, setPendingSetupLaterPayload] =
    useState(null);
  const [pendingRemoveSetupPayload, setPendingRemoveSetupPayload] =
    useState(null);
  const [hasManualPrice, setHasManualPrice] = useState(false);
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const isSetupOnly = !willCreate && modalMode === "setup";
  const isAddOnsOnly = !willCreate && modalMode === "addons";
  const isFullEdit = !isSetupOnly && !isAddOnsOnly;

  const shouldShowAvailabilitySaveOptions =
    !isAddOnsOnly && (willCreate || isSetupOnly);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    if (showModal) {
      if (!willCreate) {
        const existingIngredients =
          selected?.ingredients?.length > 0
            ? selected.ingredients.map((entry) =>
                mapSelectedIngredient(entry, inventoryItems),
              )
            : selected?.inventory
              ? [
                  mapSelectedIngredient(
                    {
                      inventory: selected.inventory,
                      qtyPerOrder: selected.qtyPerOrder,
                      unit: selected.unit,
                    },
                    inventoryItems,
                  ),
                ]
              : [];

        const existingRecommendedAddOns = Array.isArray(
          selected?.recommendedAddOns,
        )
          ? selected.recommendedAddOns
              .map((entry) => entry?._id || entry)
              .filter(Boolean)
          : [];

        const hasRecipeSetup = existingIngredients.length > 0;
        const hasBundleSetup = (selected?.bundleItems || []).length > 0;
        const hasResellSetup =
          selected?.type === "resell" ? existingIngredients.length > 0 : false;
        const shouldForceSetup = isSetupOnly;

        setForm({
          ...selected,
          ingredients: existingIngredients,
          setupRecipe: shouldForceSetup
            ? selected?.type === "prepared"
            : selected?.type === "prepared"
              ? hasRecipeSetup
              : false,
          setupBundle: shouldForceSetup
            ? selected?.type === "bundle"
            : selected?.type === "bundle"
              ? hasBundleSetup
              : false,
          setupResellLink: shouldForceSetup
            ? selected?.type === "resell"
            : selected?.type === "resell"
              ? hasResellSetup
              : false,
          enableAddOns: isAddOnsOnly
            ? true
            : existingRecommendedAddOns.length > 0,
          recommendedAddOns: existingRecommendedAddOns,
        });
        setHasManualPrice(true);
        setImagePreview(Cloudinary.getMenuImg(selected.imgId, selected._id));
      } else {
        setForm({
          ...initialForm,
          category: categories[0]?._id,
          ...(actCategory !== "all" && { category: actCategory }),
        });
        setHasManualPrice(false);
        setImagePreview("");
      }
    }
  }, [
    showModal,
    selected,
    willCreate,
    actCategory,
    categories,
    inventoryItems,
    isSetupOnly,
    isAddOnsOnly,
  ]);

  const toggle = () => dispatch(TOGGLE());
  const handleChange = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleTypeChange = (value) => {
    setForm((current) => ({
      ...current,
      type: value,
      bundleItems: value === "bundle" ? current.bundleItems : [],
      ingredients: [],
      setupRecipe: false,
      setupBundle: false,
      setupResellLink: false,
    }));
  };

  const selectedIngredientRows = form.ingredients.map((entry, index) => {
    const linkedItem =
      inventoryItems.find((item) => item?._id === entry.inventory) || null;
    const unitOptions = getUnitOptions(linkedItem?.measurement);
    const selectedUnit = resolveUnitValue(
      unitOptions,
      entry.unit,
      linkedItem?.measurement,
    );
    const estimatedCost = getInventoryCost(
      entry.qtyPerOrder,
      selectedUnit,
      linkedItem,
    );

    return {
      index,
      ...entry,
      unit: selectedUnit,
      linkedItem,
      unitOptions,
      estimatedCost,
    };
  });

  const totalEstimatedInventoryCost = selectedIngredientRows.reduce(
    (total, entry) => total + (entry.estimatedCost || 0),
    0,
  );

  const selectedResellRow = selectedIngredientRows[0] || null;
  const totalEstimatedBundleCost = form?.bundleItems?.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );
  const totalEstimatedResellCost = Number(
    selectedResellRow?.linkedItem?.cost || 0,
  );
  const totalEstimatedMenuCost =
    form.type === "prepared"
      ? totalEstimatedInventoryCost
      : form.type === "bundle"
        ? totalEstimatedBundleCost
        : form.type === "resell"
          ? totalEstimatedResellCost
          : 0;

  useEffect(() => {
    if (!showModal || !willCreate || hasManualPrice) return;

    setForm((current) => ({
      ...current,
      price:
        totalEstimatedMenuCost > 0
          ? String(Number(totalEstimatedMenuCost.toFixed(2)))
          : "",
    }));
  }, [hasManualPrice, showModal, totalEstimatedMenuCost, willCreate]);

  const buildInventoryPayload = () => {
    if (!["prepared", "resell"].includes(form.type)) {
      return {
        ingredients: [],
        hasRecipe: false,
        inventory: null,
        qtyPerOrder: null,
        unit: null,
      };
    }

    const normalizedIngredients = form.ingredients.map((entry) => {
      const linkedItem =
        inventoryItems.find((item) => item?._id === entry.inventory) || null;
      const normalizedUnit = resolveUnitValue(
        getUnitOptions(linkedItem?.measurement),
        entry.unit,
        linkedItem?.measurement,
      );

      return {
        inventory: entry.inventory,
        qtyPerOrder: Number(entry.qtyPerOrder),
        unit: normalizedUnit || entry.unit,
      };
    });

    const primaryIngredient = normalizedIngredients[0] || null;

    return {
      ingredients: form.type === "prepared" ? normalizedIngredients : [],
      hasRecipe:
        form.type === "prepared" ? normalizedIngredients.length > 0 : false,
      inventory: primaryIngredient?.inventory || null,
      qtyPerOrder: primaryIngredient?.qtyPerOrder || null,
      unit: primaryIngredient?.unit || null,
    };
  };

  const handleSave = async (payload) => {
    try {
      const { payload: savedPayload } = await dispatch(
        SAVE({ data: payload, token }),
      ).unwrap();
      const buildForm = Cloudinary.buildFileForm(
        form.image,
        "menus",
        savedPayload._id,
        {
          menuId: savedPayload._id,
        },
      );
      const { imgId } = await dispatch(
        UPLOAD({ data: buildForm, token }),
      ).unwrap();

      dispatch(SetNEW_MENU({ ...savedPayload, imgId }));
      toast.success("Successfully saved menu.");
      toggle();
    } catch (error) {
      toast.error(error?.message || error || "Failed to save menu.");
    } finally {
      setSubmitting(false);
      setSubmitIntent(null);
      setShowPriceWarning(false);
      setPendingPayload(null);
      setHasManualPrice(false);
      setForm(initialForm);
      setImagePreview("");
    }
  };
  const handleUpdate = async (payload) => {
    try {
      const { payload: updatedPayload } = await dispatch(
        UPDATE({ data: payload, token }),
      ).unwrap();
      let imgId = selected.imgId;

      if (form.image) {
        const buildForm = Cloudinary.buildFileForm(
          form.image,
          "menus",
          updatedPayload._id,
          {
            menuId: updatedPayload._id,
          },
        );
        const imgPayload = await dispatch(
          UPLOAD({ data: buildForm, token }),
        ).unwrap();
        imgId = imgPayload.imgId;
      }

      dispatch(SetUPDATED_MENU({ ...updatedPayload, imgId }));
      toast.success("Successfully updated menu.");
      toggle();
    } catch (error) {
      toast.error(error?.message || error || "Failed to update menu.");
    } finally {
      setSubmitting(false);
      setSubmitIntent(null);
      setShowPriceWarning(false);
      setPendingPayload(null);
      setHasManualPrice(false);
      setForm(initialForm);
      setImagePreview("");
    }
  };

  const submitPayload = async (payload) => {
    setSubmitting(true);

    if (willCreate) {
      return await handleSave(payload);
    }

    await handleUpdate(payload);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const submitter = event?.nativeEvent?.submitter || null;
    const rawAvailabilityIntent =
      submitter?.getAttribute?.("data-availability") || null;
    const availabilityIntent =
      shouldShowAvailabilitySaveOptions && !rawAvailabilityIntent
        ? "unavailable"
        : rawAvailabilityIntent;
    setSubmitIntent(availabilityIntent || "default");
    const isSavingUnavailable =
      shouldShowAvailabilitySaveOptions && availabilityIntent === "unavailable";
    const wantsAvailable =
      shouldShowAvailabilitySaveOptions && availabilityIntent === "available";

    if (hasDuplicateName) {
      toast.error("This menu name already exists.");
      return;
    }

    if (!isAddOnsOnly && !form.image && !form.imgId) {
      toast.error("Please upload a menu image.");
      return;
    }

    if (form.type === "prepared" && !form.ingredients.length) {
      if (wantsAvailable && (willCreate || isSetupOnly)) {
        toast.error("Please add at least one recipe ingredient.");
        return;
      }
    }

    if (form.type === "resell" && !selectedResellRow) {
      if (wantsAvailable && (willCreate || isSetupOnly)) {
        toast.error("Please select one resell inventory item.");
        return;
      }
    }

    if (form.type === "bundle" && form.bundleItems?.length < 2) {
      if (wantsAvailable && (willCreate || isSetupOnly)) {
        toast.error("Please select at least 2 menu items for this bundle.");
        return;
      }
    }

    const normalizedRecommendedAddOns = form.enableAddOns
      ? Array.from(
          new Set(
            (Array.isArray(form.recommendedAddOns)
              ? form.recommendedAddOns
              : []
            )
              .map((entry) => entry?._id || entry)
              .filter(Boolean),
          ),
        )
      : [];

    const payload = {
      ...form,
      recommendedAddOns: normalizedRecommendedAddOns,
      ...buildInventoryPayload(),
      ...(shouldShowAvailabilitySaveOptions
        ? { isAvailable: wantsAvailable }
        : {}),
    };

    const isRemovingSetup =
      !willCreate &&
      Boolean(selected?.isAvailable) &&
      (form.type === "prepared"
        ? payload.ingredients.length === 0
        : form.type === "bundle"
          ? payload.bundleItems.length === 0
          : form.type === "resell"
            ? !payload.inventory
            : false);

    if (isRemovingSetup) {
      setPendingRemoveSetupPayload({ ...payload, isAvailable: false });
      setShowRemoveSetupWarning(true);
      return;
    }

    const hasSetupContent =
      form.type === "bundle"
        ? payload.bundleItems.length > 0
        : form.type === "resell"
          ? Boolean(payload.inventory)
          : payload.ingredients.length > 0;

    if (willCreate && isSavingUnavailable && !hasSetupContent) {
      setPendingSetupLaterPayload({ ...payload, isAvailable: false });
      setShowSetupLaterWarning(true);
      return;
    }

    const declaredPrice = Number(payload.price || 0);
    const shouldWarnAboutPrice =
      totalEstimatedMenuCost > 0 && declaredPrice <= totalEstimatedMenuCost;

    if (shouldWarnAboutPrice) {
      setPendingPayload(payload);
      setShowPriceWarning(true);
      return;
    }

    await submitPayload(payload);
  };

  const hasDuplicateName = isExistingMenuName(
    collections,
    form.name,
    selected?._id,
  );

  return (
    <Dialog open={showModal} onOpenChange={toggle}>
      <DialogContent
        className={`border border-border bg-white shadow-[0_28px_80px_rgba(15,23,42,0.22)] ${
          isAddOnsOnly
            ? "max-w-5xl"
            : isSetupOnly
              ? form.type === "resell"
                ? "max-w-xl"
                : "max-w-5xl"
              : form.type === "bundle" || form.type === "prepared"
                ? "max-w-5xl"
                : form.type === "resell"
                  ? "max-w-3xl"
                  : "max-w-2xl"
        }`}
      >
        <DialogHeader>
          <DialogTitle className="text-xl">
            {willCreate
              ? "Create Menu Item"
              : isAddOnsOnly
                ? "Manage Add-Ons"
                : isSetupOnly
                  ? getSetupOnlyDialogMeta(form.type || "prepared").title
                  : "Update Menu Item"}
          </DialogTitle>
          <DialogDescription>
            {isAddOnsOnly
              ? "Choose the add-ons that will be suggested for this menu item."
              : isSetupOnly
                ? getSetupOnlyDialogMeta(form.type || "prepared").description
                : "Fill in the core details for a new kitchen or resale item."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 ">
            {isFullEdit && (
              <section className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="item-category">Category</Label>
                  <Select
                    value={form.category || ""}
                    required
                    onValueChange={(value) => handleChange("category", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Categories</SelectLabel>
                        {categories?.map((category, index) => (
                          <SelectItem key={index} value={category?._id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="item-type">Type</Label>
                  <Select value={form.type} onValueChange={handleTypeChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Type</SelectLabel>
                        {Type.collections.map((type) => (
                          <SelectItem key={type} value={type}>
                            {capitalize(
                              type === "prepared" ? "Recipe-Based" : type,
                            )}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </section>
            )}

            {!isAddOnsOnly && form.type === "bundle" && (
              <Bundles form={form} setForm={setForm} isFullEdit={isFullEdit} />
            )}

            {!isAddOnsOnly && form.type === "prepared" && (
              <Recipe form={form} setForm={setForm} isFullEdit={isFullEdit} />
            )}

            {!isAddOnsOnly && form.type === "resell" && (
              <Resell form={form} setForm={setForm} isFullEdit={isFullEdit} />
            )}

            {isAddOnsOnly ? (
              <section className="rounded-[15px] border border-border bg-white shadow-sm">
                <div className="px-5 py-4">
                  <p className="no-underline text-lg font-bold leading-tight text-foreground">
                    {form.name || "Menu Item"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    SRP {Formatter.amount(Number(form.price || 0))}
                  </p>
                </div>
              </section>
            ) : (
              <section className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="item-name">Item Name</Label>
                  <Input
                    id="item-name"
                    value={form.name}
                    onChange={(event) =>
                      handleChange("name", event.target.value)
                    }
                    placeholder="e.g. Pork Sisig"
                    readOnly={isSetupOnly}
                    aria-readonly={isSetupOnly}
                    className={
                      isSetupOnly
                        ? "bg-muted/40 text-foreground/90 shadow-none focus-visible:ring-0"
                        : ""
                    }
                    required
                  />
                  {!isSetupOnly && (
                    <Name name={form.name} selectedId={selected?._id} />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="item-price">Price</Label>
                  <div className="relative">
                    <PhilippinePeso className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="item-price"
                      type="number"
                      min="1"
                      step="0.01"
                      value={form.price}
                      onChange={(event) => {
                        setHasManualPrice(true);
                        handleChange("price", event.target.value);
                      }}
                      placeholder="0.00"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
              </section>
            )}

            {isFullEdit && (
              <>
                <section className="grid gap-6">
                  <MenuImage
                    fileInputRef={fileInputRef}
                    form={form}
                    imagePreview={imagePreview}
                    setForm={setForm}
                    setImagePreview={setImagePreview}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="item-description">Description</Label>
                    <Textarea
                      id="item-description"
                      value={form.description}
                      onChange={(event) =>
                        handleChange("description", event.target.value)
                      }
                      placeholder="Add a short product description for staff and menu display."
                      className="min-h-28 resize-none"
                    />
                  </div>
                </section>

                {["prepared", "bundle"].includes(form.type) && (
                  <RecommendedAddOns
                    collections={addOns}
                    enabled={form.enableAddOns}
                    hideToggle={
                      !willCreate && (form.recommendedAddOns?.length || 0) > 0
                    }
                    onEnabledChange={(value) => {
                      handleChange("enableAddOns", value);
                      if (!value) {
                        handleChange("recommendedAddOns", []);
                      }
                    }}
                    selectedIds={form.recommendedAddOns}
                    onSelectedIdsChange={(ids) =>
                      handleChange("recommendedAddOns", ids)
                    }
                  />
                )}
              </>
            )}

            {isAddOnsOnly && (
              <RecommendedAddOns
                collections={addOns}
                enabled
                hideToggle
                onEnabledChange={() => {}}
                selectedIds={form.recommendedAddOns}
                onSelectedIdsChange={(ids) =>
                  handleChange("recommendedAddOns", ids)
                }
              />
            )}

            <FooterActions
              submitting={submitting}
              hasDuplicateName={hasDuplicateName}
              showAvailabilityOptions={shouldShowAvailabilitySaveOptions}
              submitIntent={submitIntent}
              setSubmitIntent={setSubmitIntent}
              onClose={toggle}
              defaultSubmitLabel={
                willCreate ? "Save" : isSetupOnly ? "Update Setup" : "Update"
              }
            />
          </div>
        </form>
      </DialogContent>

      <SaveUnavailableNoticeDialog
        open={showSetupLaterWarning}
        onOpenChange={(open) => {
          if (!open) {
            setShowSetupLaterWarning(false);
            setPendingSetupLaterPayload(null);
          }
        }}
        submitting={submitting}
        requirementLabel={getSetupRequirementLabel(form.type)}
        pendingPayload={pendingSetupLaterPayload}
        onSubmit={submitPayload}
        onClear={() => {
          setShowSetupLaterWarning(false);
          setPendingSetupLaterPayload(null);
        }}
      />

      <RemoveSetupConfirmDialog
        open={showRemoveSetupWarning}
        onOpenChange={(open) => {
          if (!open) {
            setShowRemoveSetupWarning(false);
            setPendingRemoveSetupPayload(null);
          }
        }}
        submitting={submitting}
        copy={getRemoveSetupCopy(form.type)}
        pendingPayload={pendingRemoveSetupPayload}
        onSubmit={submitPayload}
        onClear={() => {
          setShowRemoveSetupWarning(false);
          setPendingRemoveSetupPayload(null);
        }}
      />

      <PriceWarningDialog
        open={showPriceWarning}
        onOpenChange={setShowPriceWarning}
        declaredPrice={Number(form.price || 0)}
        estimatedCost={totalEstimatedMenuCost}
        pendingPayload={pendingPayload}
        onCancel={() => {
          setShowPriceWarning(false);
          setPendingPayload(null);
        }}
        onContinue={async (payload) => {
          setShowPriceWarning(false);
          await submitPayload(payload);
        }}
      />
    </Dialog>
  );
};

export default Modal;
