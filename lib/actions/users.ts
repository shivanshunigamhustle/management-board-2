"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/data";
import { validatePassword } from "@/lib/password-policy";

export async function createUser(formData: FormData) {
  const session = await auth();
  const admin = session?.user as { id: string; role?: string } | undefined;
  if (!admin || admin.role !== "ADMIN") throw new Error("Not authorized");

  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const role = String(formData.get("role") ?? "MEMBER") === "ADMIN" ? "ADMIN" : "MEMBER";
  const password = String(formData.get("password") ?? "demo1234");

  const policyError = validatePassword(password);
  if (policyError) throw new Error(policyError);

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { name, email, role, passwordHash },
  });

  await logActivity(admin.id, "CREATE_USER", "USER");
  revalidatePath("/admin/members");
}
