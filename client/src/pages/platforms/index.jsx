import { AppSidebar } from "@/components/shared/sidebar/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { capitalize } from "lodash";
import { useSelector } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";

export default function Platforms() {
  const { auth } = useSelector(({ auth }) => auth);
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean); // ["platforms", "students", "list"]
  const lastSegment = pathSegments[pathSegments.length - 1]; //

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <header className="flex h-13 shrink-0 justify-between items-center border-b  items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-5">
            <SidebarTrigger />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">{auth?.role}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{capitalize(lastSegment)}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          {/* <BellRing className="mr-12 text-[#FF4F00]" /> */}
        </header>
        <div className="flex flex-1 flex-col  ">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
