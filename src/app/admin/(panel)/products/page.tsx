import { requirePage } from "../../_lib/guards";
import { ResourceManager } from "../../_components/ResourceManager";

export const metadata = { title: "products" };

export default async function Page() {
  const user = await requirePage();
  return <ResourceManager configKey="products" role={user.role} />;
}
