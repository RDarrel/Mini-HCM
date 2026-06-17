import CustomPagination from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, Pen, Plus, Search, Trash } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BROWSE } from "@/services/redux/slices/procurement/suppliers";
import TableLoading from "@/components/shared/loading/table";
import { globalSearch, handlePagination, mobile } from "@/services/utilities";
import { capitalize, isEmpty } from "lodash";
import { RESET, DESTROY } from "@/services/redux/slices/procurement/suppliers";
import { toast } from "sonner";
import CustomModal from "./modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { CustomAlert } from "@/components/shared/alert";

const Suppliers = () => {
  const { token } = useSelector(({ auth }) => auth),
    { collections, isLoading, message, isSuccess, formSubmitted } = useSelector(
      ({ suppliers }) => suppliers,
    ),
    [suppliers, setSuppliers] = useState([]),
    [selected, setSelected] = useState({}),
    [deletedIndex, setDeletedIndex] = useState(-1),
    [page, setPage] = useState(1),
    [maxPage, setMaxPage] = useState(5),
    [search, setSearch] = useState(""),
    [isOpen, setIsOpen] = useState(false),
    [showAlert, setShowAlert] = useState(false),
    [willCreate, setWillCreate] = useState(true),
    dispatch = useDispatch();

  useEffect(() => {
    if (token) {
      dispatch(BROWSE({ token }));
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (message && isSuccess) {
      toast.success(message);
      setShowAlert(false);
      dispatch(RESET());
    }
  }, [message, isSuccess, dispatch]);

  useEffect(() => {
    if (search) {
      const results = globalSearch(collections, search.toUpperCase());
      setSuppliers(results);
      return;
    }

    setSuppliers(collections);
  }, [search, collections]);

  const handleCreate = () => {
    setWillCreate(true);
    setSelected({});
    setIsOpen(true);
  };

  const handleDelete = () => {
    dispatch(DESTROY({ token, data: { _id: suppliers[deletedIndex]?._id } }));
  };

  return (
    <>
      <div className="bg-background p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <Card className="border-border py-6 shadow-sm">
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <CardTitle className="text-2xl text-foreground">
                    Suppliers
                  </CardTitle>
                  <CardDescription>
                    Manage supplier companies and their contact details.
                  </CardDescription>
                </div>

                <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-end lg:max-w-xl">
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search supplier..."
                      className="pl-9"
                      type="search"
                    />
                  </div>

                  <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4" />
                    Add Supplier
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {!isLoading ? (
                <>
                  <div className="mt-2 overflow-hidden rounded-md border">
                    <Table>
                      <TableHeader className="bg-muted/70">
                        <TableRow>
                          <TableHead>Company</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {!isEmpty(suppliers) ? (
                          handlePagination(suppliers, page, maxPage).map(
                            (supplier) => {
                              const {
                                name = "",
                                address = "",
                                contact = {},
                              } = supplier;
                              return (
                                <TableRow key={supplier._id}>
                                  <TableCell className="font-medium">
                                    {capitalize(name)}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground">
                                    {contact.person
                                      ? `${contact.person} (${mobile(contact.mobile)})`
                                      : mobile(contact.mobile)}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground">
                                    {capitalize(address)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          size="icon"
                                          variant="outline"
                                          title="Actions"
                                        >
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent
                                        className="w-[9rem]"
                                        align="end"
                                      >
                                        <DropdownMenuLabel>
                                          Actions
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuGroup>
                                          <DropdownMenuItem
                                            onClick={() => {
                                              setIsOpen(true);
                                              setSelected(supplier);
                                              setWillCreate(false);
                                            }}
                                          >
                                            <Pen className="mr-2 h-4 w-4" />
                                            Update
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() => {
                                              setDeletedIndex(
                                                suppliers.findIndex(
                                                  ({ _id }) =>
                                                    _id === supplier._id,
                                                ),
                                              );
                                              setShowAlert(true);
                                            }}
                                          >
                                            <Trash className="mr-2 h-4 w-4" />
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              );
                            },
                          )
                        ) : (
                          <TableRow>
                            <TableCell
                              className="text-center text-muted-foreground"
                              colSpan={4}
                            >
                              No record.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <CustomPagination
                    title="Supplier"
                    titleExtension="s"
                    page={page}
                    setPage={setPage}
                    maxPage={maxPage}
                    setMaxPage={setMaxPage}
                    datas={suppliers}
                  />
                </>
              ) : (
                <TableLoading className="mt-4" />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <CustomModal
        selected={selected}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        willCreate={willCreate}
      />
      <CustomAlert
        isOpen={showAlert}
        capture={handleDelete}
        setIsOpen={setShowAlert}
        formSubmitted={formSubmitted}
        message={
          <>
            Are you sure you want to delete
            <span className="font-[700] mr-1 ml-1">
              {suppliers?.length > 0 ? suppliers[deletedIndex]?.name : ""}
            </span>
            ?
          </>
        }
        showCancelButton
        className="w-[22rem]"
        buttonTitle="Yes, Delete"
        buttonClassName="bg-red-600 hover:bg-red-700"
        index={deletedIndex}
      />
    </>
  );
};

export default Suppliers;
