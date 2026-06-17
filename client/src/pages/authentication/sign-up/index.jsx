import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";
import { LOGIN } from "@/services/redux/slices/persons/auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";

export default function LoginForm({ setIsLogin = () => {} }) {
  const { isLoading } = useSelector(({ auth }) => auth),
    dispatch = useDispatch(),
    navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const { email, password, lname, fname, confirmPassword } = e.target;
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
          <Input id="email" type="email" placeholder="Email" required />
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
            <Input
              id="password"
              type="password"
              placeholder="Password"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              required
            />
          </Field>
        </div>
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
