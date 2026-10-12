import { requirePage } from "../../_lib/guards";
import { AuditViewer } from "../../_components/AuditViewer";

export const metadata = { title: "Audit log" };

export default async function Page() {
  await requirePage("admin");
  return <AuditViewer />;
}
