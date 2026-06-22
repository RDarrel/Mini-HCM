import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/shared/passwordInput";
import { useDispatch, useSelector } from "react-redux";
import { REGISTER } from "@/redux/slices/auth";
import { getTimezone } from "@/utilities";
import { toast } from "sonner";
import { Loader } from "lucide-react";
const getPassError = (password, confirmPassword) => {
  if (password !== confirmPassword) return "Passwords do not match.";
  if (password.length < 8)
    return "Password must be at least 8 characters long.";
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(password))
    return "Password must contain at least one lowercase letter.";
  if (!/[0-9]/.test(password))
    return "Password must contain at least one number.";
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password))
    return "Password must contain at least one special character.";
  return "";
};
export default function LoginForm({ setIsLogin = () => {} }) {
  const { isLoading } = useSelector(({ auth }) => auth),
    [passWarning, setPassWarning] = useState(""),
    dispatch = useDispatch();

  const handleLogin = (e) => {
    e.preventDefault();
    const { email, password, lname, fname, confirmPassword } = e.target;

    //password validation
    if (getPassError(password.value, confirmPassword.value))
      return setPassWarning(
        getPassError(password.value, confirmPassword.value),
      );

    const data = {
      email: email.value,
      password: password.value,
      name: {
        fname: fname.value,
        lname: lname.value,
      },
      timezone: getTimezone(),
    };

    dispatch(REGISTER(data))
      .unwrap()
      .then(() => {
        setIsLogin(true);
        toast.success("Account created successfully", {
          duration: 1000,
        });
        //Reset the form
        e.target.reset();
      })
      .catch((error) => {
        toast.error(error, {
          duration: 1000,
        });
      });
  };
  return (
    <form onSubmit={handleLogin}>
      <FieldGroup className="flex flex-col gap-3">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Welcome to Mini HCM</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your information below to create your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            required
          />
        </Field>
        <div className="flex gap-4">
          <Field>
            <FieldLabel htmlFor="fname">First Name</FieldLabel>
            <Input id="fname" type="text" placeholder="First Name" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="lname">Last Name</FieldLabel>
            <Input id="lname" type="text" placeholder="Last Name" required />
          </Field>
        </div>
        <div className="flex gap-4">
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <PasswordInput
              id="password"
              placeholder="Password"
              autoComplete="new-password"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
            <PasswordInput
              id="confirmPassword"
              placeholder="Confirm Password"
              autoComplete="new-password"
              required
            />
          </Field>
        </div>
        <FieldDescription className="font-semibold text-destructive -mt-2 ">
          {passWarning}
        </FieldDescription>
        <small className="text-xs text-muted-foreground">
          A strong password must contain lowercase and UPPERCASE letters,
          numbers and character symbols.
        </small>
        <FieldSeparator />
        <Field>
          <Button type="submit" disabled={isLoading}>
            Sign Up {isLoading && <Loader className="animate-spin" />}
          </Button>
        </Field>
        <Field>
          <FieldDescription
            className="text-center"
            onClick={() => setIsLogin(true)}
          >
            Already have an account?{" "}
            <a href="#" className="underline underline-offset-4">
              Sign in
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
