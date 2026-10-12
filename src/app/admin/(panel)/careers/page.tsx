import { requirePage } from "../../_lib/guards";
import { ResourceManager } from "../../_components/ResourceManager";

export const metadata = { title: "careers" };

export default async function Page() {
  const user = await requirePage();
  return <ResourceManager configKey="careers" role={user.role} />;
}
