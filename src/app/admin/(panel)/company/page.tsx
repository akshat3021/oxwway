import { requirePage } from "../../_lib/guards";
import { SingletonForm } from "../../_components/SingletonForm";

export const metadata = { title: "company" };

export default async function Page() {
  await requirePage();
  return <SingletonForm configKey="company" />;
}
