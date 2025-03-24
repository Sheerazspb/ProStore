"use server";

import { signInFormSchema,signUpFormSchema } from "@/lib/validators";
import { signIn,signOut} from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { hashSync } from "bcrypt-ts-edge";
import {prisma} from "@/db/prisma";
import { formatError } from "@/lib/utils";

// Sign in the user
export async function signInWithCredentials(prevState:unknown,formData: FormData) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    await signIn("credentials", user);
    return { success: true,message:"Successfully signed in!" };

   } catch (error) {
    if(isRedirectError(error)){
      throw error
    }
    return {success:false,message:"Invalid email or password"};
  }
}
// Sign out the user
export async function signOutUser() {
  await signOut();
}

// Sign up the user
export async function signUpUser(prevState:unknown,formData: FormData) {
  try {
    const user = signUpFormSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });
    const plainPassword = user.password;
    const hashedPassword = hashSync(user.password, 10);
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
      },
    });
    await signIn("credentials", {email:user.email,password:plainPassword});
    return { success: true,message:"Successfully signed up!" };
  } catch (error) {
    if(isRedirectError(error)){
      throw error
    }
    return {success:false,message:formatError(error)};
  }
}
