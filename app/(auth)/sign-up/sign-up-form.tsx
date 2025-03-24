"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpDefaultValues } from "@/lib/constants";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signUpUser } from "@/lib/actions/user.actions";
import { useSearchParams } from "next/navigation";

const SignUpForm = () => {
  const [data, action] = useActionState(signUpUser, {
    success: false,
    message: "",
  });
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const SignUpButton = () => {
    const { pending } = useFormStatus();
    return (
      <Button className="w-full" variant="default" disabled={pending}>
        {pending ? "Submitting..." : "Sign Up"}
      </Button>
    );
  };

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="mb-1">
            Name
          </Label>
          <Input
            id="name"
            type="text"
            name="name"
            required
            autoComplete="email"
            defaultValue={signUpDefaultValues.name}
          />
        </div>
        <div>
          <Label htmlFor="email" className="mb-1">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            name="email"
            required
            autoComplete="email"
            defaultValue={signUpDefaultValues.email}
          />
        </div>
        <div>
          <Label htmlFor="password" className="mb-1">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            name="password"
            required
            autoComplete="current-password"
            defaultValue={signUpDefaultValues.password}
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword" className="mb-1">
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            required
            autoComplete="current-password"
            defaultValue={signUpDefaultValues.confirmPassword}
          />
        </div>
        <div>
          <SignUpButton />
        </div>

        {data && !data.success && (
          <div className="text-destructive text-center">{data.message}</div>
        )}

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" target="_self" className="link text-blue-400">
            Sign In
          </Link>
        </div>
      </div>
    </form>
  );
};

export default SignUpForm;
