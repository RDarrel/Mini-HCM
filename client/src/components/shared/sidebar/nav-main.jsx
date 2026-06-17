import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Link, matchPath, useLocation } from "react-router-dom";

const buildPlatformPath = (...segments) =>
  `/platforms${segments.join("")}`.replace(/\/+/g, "/");

const isPathActive = (pathname, targetPath) =>
  Boolean(
    matchPath(
      {
        path: targetPath,
        end: false,
      },
      pathname,
    ),
  );

const LinkWithChild = ({ pathname, ...link }) => {
  const { name, icon: Icon, children, path } = link;
  const childLinks =
    children?.map((subItem) => ({
      ...subItem,
      to: buildPlatformPath(path, subItem.path),
    })) || [];
  const isActive = childLinks.some((subItem) =>
    isPathActive(pathname, subItem.to),
  );
  const [isOpen, setIsOpen] = useState(isActive);

  useEffect(() => {
    if (isActive) {
      setIsOpen(true);
    }
  }, [isActive]);

  return (
    <Collapsible
      key={name}
      asChild
      open={isOpen}
      onOpenChange={setIsOpen}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={name}>
            {Icon && <Icon />}
            <span>{name}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {childLinks.map((subItem) => (
              <SidebarMenuSubItem key={subItem.name}>
                <SidebarMenuSubButton
                  asChild
                  isActive={isPathActive(pathname, subItem.to)}
                >
                  <Link to={subItem.to}>
                    <span>{subItem.name}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

const LinkWithoutChild = ({ pathname, ...link }) => {
  const { name, icon: Icon, path } = link;
  const to = buildPlatformPath(path);

  return (
    <SidebarMenuItem key={name}>
      <SidebarMenuButton
        tooltip={name}
        asChild
        isActive={isPathActive(pathname, to)}
      >
        <Link to={to}>
          {Icon && <Icon />}
          <span>{name}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export function NavMain({ links }) {
  const { pathname } = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platforms</SidebarGroupLabel>
      <SidebarMenu>
        {links?.map((link) =>
          link?.children ? (
            <LinkWithChild key={link.name} {...link} pathname={pathname} />
          ) : (
            <LinkWithoutChild key={link.name} {...link} pathname={pathname} />
          ),
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
