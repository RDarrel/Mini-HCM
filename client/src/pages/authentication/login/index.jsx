import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/shared/passwordInput";
import { useDispatch, useSelector } from "react-redux";
import { LOGIN } from "@/redux/slices/auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";

export default function LoginForm({ setIsLogin = () => {} }) {
  const { isLoading } = useSelector(({ auth }) => auth),
    dispatch = useDispatch(),
    navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const { email, password } = e.target;
    dispatch(LOGIN({ email: email.value, password: password.value }))
      .unwrap()
      .then(() => navigate("/platforms/dashboard"))
      .catch((error) => {
        toast.error(error, {
          duration: 1000, // 1 second lang bago mawala
        });
      });
  };
  return (
    <form className={cn("flex flex-col gap-6")} onSubmit={handleLogin}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Welcome to Mini HCM</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email below to sign in to your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            autoComplete="email"
            required
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </Field>
        <Field>
          <Button type="submit" disabled={isLoading}>
            Sign in {isLoading && <Loader className="animate-spin" />}
          </Button>
        </Field>
        <Field>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Button
              type="button"
              variant="link"
              className="h-auto p-0"
              onClick={() => setIsLogin(false)}
            >
              Sign up
            </Button>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
