import { requirePage } from "../../_lib/guards";
import { AccountForm } from "../../_components/AccountForm";

export const metadata = { title: "Account" };

export default async function Page() {
  const user = await requirePage();
  return <AccountForm email={user.email} role={user.role} />;
}
