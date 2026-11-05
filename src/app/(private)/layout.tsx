import { requirePrivatePage } from "@/lib/auth/guards";

/**
 * Private Layout
 * 
 * @param {{
 *   children: React.ReactNode;
 * }} {
 *   children,
 * }
 * @return {*} 
 */
export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // every page under (private) passes through here first
  await requirePrivatePage();
  return <>{children}</>;
}