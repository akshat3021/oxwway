import { requirePage } from "../../_lib/guards";
import { UsersManager } from "../../_components/UsersManager";

export const metadata = { title: "Users" };

export default async function Page() {
  const user = await requirePage("admin");
  return <UsersManager currentUserId={user.id} />;
}
