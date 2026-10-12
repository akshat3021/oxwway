import { requirePage } from "../../_lib/guards";
import { SettingsForm } from "../../_components/SettingsForm";

export const metadata = { title: "Settings" };

export default async function Page() {
  await requirePage("admin");
  return <SettingsForm />;
}
