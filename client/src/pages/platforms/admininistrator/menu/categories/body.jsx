import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomAlert } from "@/components/shared/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import { capitalize } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import CustomPagination from "@/components/shared/pagination";
import { handlePagination } from "@/services/utilities";
import { useState } from "react";
import TableLoading from "@/components/shared/loading/table";
import { Set_SELECTED } from "@/services/redux/slices/menu/categories";

const ActionButton = ({ title, icon: Icon, destructive = false, onClick }) => (
  <Button
    type="button"
    size="icon"
    variant="outline"
    onClick={onClick}
    className={
      destructive
        ? "border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
        : "hover:bg-accent/15 hover:text-accent-foreground"
    }
  >
    <Icon className="h-4 w-4" />
    <span className="sr-only">{title}</span>
  </Button>
);

const CategoryBody = ({
  deleteOpen,
  setDeleteOpen,
  selected,
  onRequestDelete,
  onConfirmDelete,
}) => {
  const { filtered, formSubmitted, isLoading } = useSelector(
    ({ menuCategories }) => menuCategories,
  );
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(5);
  const dispatch = useDispatch();

  return (
    <>
      <CardContent className="space-y-4">
        {!isLoading ? (
          <>
            <div className="overflow-hidden rounded-[7px] border border-border bg-card">
              <Table>
                <TableHeader className="bg-muted/70">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length ? (
                    handlePagination(filtered, page, maxPage).map((item) => {
                      return (
                        <TableRow key={item._id} className="bg-card">
                          <TableCell className="whitespace-normal">
                            <div className="space-y-1">
                              <p className="font-semibold text-foreground">
                                {capitalize(item.name)}
                              </p>
                            </div>
                          </TableCell>

                          <TableCell>{capitalize(item.description)}</TableCell>

                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <ActionButton
                                title="Edit"
                                icon={Pencil}
                                onClick={() => dispatch(Set_SELECTED(item))}
                              />
                              <ActionButton
                                title="Delete"
                                icon={Trash2}
                                destructive
                                onClick={() => onRequestDelete(item)}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="py-14 text-center">
                        <div className="space-y-2">
                          <p className="text-base font-semibold text-foreground">
                            No categories found
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Try another keyword to show matching category
                            records.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <CustomPagination
              title="Categories"
              titleExtension=" "
              page={page}
              setPage={setPage}
              maxPage={maxPage}
              setMaxPage={setMaxPage}
              datas={filtered}
            />
          </>
        ) : (
          <TableLoading numberOfColumns={7} />
        )}
      </CardContent>

      <CustomAlert
        isOpen={deleteOpen}
        formSubmitted={formSubmitted}
        capture={onConfirmDelete}
        setIsOpen={setDeleteOpen}
        showCancelButton
        className="border-border bg-card shadow-[0_28px_90px_rgba(59,36,24,0.18)]"
        buttonTitle="Delete Category"
        buttonClassName="bg-red-600 hover:bg-red-700"
        index={0}
        message={
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-red-600">
              {selected?.name || "this category"}
            </span>
            ?
          </>
        }
      />
    </>
  );
};

export default CategoryBody;
