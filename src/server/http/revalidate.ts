import "server-only";
import { revalidatePath } from "next/cache";

/**
 * Called after every admin write so edits appear on the public site
 * immediately instead of waiting for the periodic revalidation window.
 */
export function revalidatePublicSite(): void {
  try {
    revalidatePath("/", "layout");
  } catch {
    /* never let cache invalidation fail an otherwise-successful write */
  }
}
