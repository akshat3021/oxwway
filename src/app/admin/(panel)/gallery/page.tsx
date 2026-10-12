import { requirePage } from "../../_lib/guards";
import { ResourceManager } from "../../_components/ResourceManager";

export const metadata = { title: "gallery" };

export default async function Page() {
  const user = await requirePage();
  return <ResourceManager configKey="gallery" role={user.role} />;
}
