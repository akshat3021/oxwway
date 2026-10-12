import { requirePage } from "../../_lib/guards";
import { MessagesManager } from "../../_components/MessagesManager";

export const metadata = { title: "Messages" };

export default async function Page() {
  await requirePage("admin");
  return <MessagesManager />;
}
