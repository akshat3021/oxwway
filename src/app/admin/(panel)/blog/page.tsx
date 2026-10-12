import { requirePage } from "../../_lib/guards";
import { ResourceManager } from "../../_components/ResourceManager";

export const metadata = { title: "blog" };

export default async function Page() {
  const user = await requirePage();
  return <ResourceManager configKey="blog" role={user.role} />;
}
