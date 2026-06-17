import React, { useEffect, useState } from "react";

import { NavMain } from "@/components/shared/sidebar/nav-main";
import { NavUser } from "@/components/shared/sidebar/nav-user";
import { TeamSwitcher } from "@/components/shared/sidebar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import access from "@/pages/platforms/access";
import { useSelector } from "react-redux";

export function AppSidebar({ ...props }) {
  const { auth } = useSelector(({ auth }) => auth),
    [links, setLinks] = useState([]);

  useEffect(() => {
    setLinks(access[auth?.role] || []);
  }, [auth]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain links={links} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
