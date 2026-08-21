export function isRouteActive(pathname: string, href: string) {
  if (!pathname || !href.startsWith("/")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
