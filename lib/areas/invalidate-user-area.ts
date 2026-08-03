import { revalidatePath, revalidateTag } from "next/cache";

export function invalidateUserAreaCache() {
  revalidateTag("user-area");
  revalidatePath("/minha-area");
  revalidatePath("/biblioteca/leitor");
}
