import { requirePage } from "../../_lib/guards";
import { ResourceManager } from "../../_components/ResourceManager";

export const metadata = { title: "team" };

export default async function Page() {
  const user = await requirePage();
  return <ResourceManager configKey="team" role={user.role} />;
}
