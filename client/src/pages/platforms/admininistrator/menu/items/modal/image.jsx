import { Button } from "@/components/ui/button";
import { ImagePlus, Trash2 } from "lucide-react";

const Image = ({
  fileInputRef,
  form,
  imagePreview,
  setForm = () => {},
  setImagePreview = () => {},
}) => {
  const handleImageChange = (event) => {
    const [file] = event.target.files || [];

    if (!file) {
      return;
    }

    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    const reader = new FileReader();

    reader.onload = () => {
      const image = new window.Image();

      image.onload = () => {
        setForm((current) => ({
          ...current,
          image: reader.result,
        }));
        setImagePreview(previewUrl);
      };

      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setForm((current) => ({
      ...current,
      image: null,
    }));
    setImagePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium leading-none">Menu Image</p>
          <p className="text-xs text-muted-foreground">
            Upload a clear photo for this menu item.
          </p>
        </div>
        {form.image && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemoveImage}
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        id="item-image"
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={handleImageChange}
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex w-full flex-col items-center justify-center rounded-[22px] border border-dashed border-border bg-muted/20 px-5 py-8 text-center transition hover:border-primary hover:bg-primary/5"
      >
        {imagePreview ? (
          <div className="flex h-52 w-full items-center justify-center rounded-2xl bg-background/80 p-3 shadow-sm">
            <img
              src={imagePreview}
              alt="Menu preview"
              className="max-h-full w-full rounded-xl object-contain"
            />
          </div>
        ) : (
          <>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ImagePlus className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">
              Click to upload menu image
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              PNG, JPG, or WEBP. Best for food cards and menu preview.
            </span>
          </>
        )}
      </button>
    </div>
  );
};

export default Image;
