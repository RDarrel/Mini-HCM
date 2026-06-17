import CustomPagination from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Key, Plus, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import AddStaff from "./add";
import { useDispatch, useSelector } from "react-redux";
import { BROWSE } from "@/services/redux/slices/persons/staffs";
import TableLoading from "@/components/shared/loading/table";
import { fullName, globalSearch, handlePagination } from "@/services/utilities";
import { isEmpty } from "lodash";
import ChangeRole from "./changeRole";
import { Role } from "@/services/fakeDB";

const Staffs = () => {
  const { token } = useSelector(({ auth }) => auth),
    { collections, isLoading } = useSelector(({ staffs }) => staffs),
    [staffs, setStaffs] = useState([]),
    [selected, setSelected] = useState({}),
    [page, setPage] = useState(1),
    [maxPage, setMaxPage] = useState(5),
    [search, setSearch] = useState(""),
    [isOpen, setIsOpen] = useState(false),
    [isChangeRole, setIsChangeRole] = useState(false),
    dispatch = useDispatch();

  useEffect(() => {
    if (token) {
      dispatch(BROWSE({ token }));
    }
  }, [dispatch, token]);

  useEffect(() => {
    setStaffs(collections);
  }, [collections]);

  useEffect(() => {
    if (search) {
      const results = globalSearch(collections, search.toUpperCase());
      setStaffs(results);
      return;
    }

    setStaffs(collections);
  }, [search, collections]);

  return (
    <>
      <div className="bg-background p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <Card className="border-border py-6 shadow-sm">
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <CardTitle className="text-2xl text-foreground">
                    Staffs
                  </CardTitle>
                  <CardDescription>
                    Manage staff accounts and their assigned roles.
                  </CardDescription>
                </div>

                <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-end lg:max-w-xl">
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search staff..."
                      className="pl-9"
                      type="search"
                    />
                  </div>

                  <Button onClick={() => setIsOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Add Staff
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
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {!isEmpty(staffs) ? (
                          handlePagination(staffs, page, maxPage).map(
                            (staff) => {
                              const user = staff?.user ?? {};
                              return (
                                <TableRow key={staff._id}>
                                  <TableCell className="font-medium">
                                    {user?.fullName
                                      ? fullName(user.fullName)
                                      : "—"}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground">
                                    {user?.email ?? "—"}
                                  </TableCell>
                                  <TableCell>
                                    {Role.getLabel(user?.role)}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant="secondary"
                                      className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                    >
                                      Active
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      title="Change Role"
                                      onClick={() => {
                                        setSelected(staff);
                                        setIsChangeRole(true);
                                      }}
                                    >
                                      <Key className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            },
                          )
                        ) : (
                          <TableRow>
                            <TableCell
                              className="text-center text-muted-foreground"
                              colSpan={5}
                            >
                              No record.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <CustomPagination
                    title="staff"
                    titleExtension="s"
                    page={page}
                    setPage={setPage}
                    maxPage={maxPage}
                    setMaxPage={setMaxPage}
                    datas={staffs}
                  />
                </>
              ) : (
                <TableLoading className="mt-4" />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AddStaff isOpen={isOpen} setIsOpen={setIsOpen} />
      <ChangeRole
        isOpen={isChangeRole}
        setIsOpen={setIsChangeRole}
        selected={selected}
      />
    </>
  );
};

export default Staffs;
