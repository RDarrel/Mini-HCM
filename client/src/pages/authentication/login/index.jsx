import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";
import { LOGIN } from "@/services/redux/slices/auth";
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
      .then(({ payload }) => {
        if (payload?.user?.role === 2) {
          navigate("/cashier");
        } else {
          navigate("/platforms/dashboard");
        }
      })
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
            Enter your email below to login to your account
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
          <Input
            id="password"
            type="password"
            required
            autoComplete="new-password"
          />
        </Field>
        <Field>
          <Button type="submit" disabled={isLoading}>
            Login {isLoading && <Loader className="animate-spin" />}
          </Button>
        </Field>
        <Field>
          <FieldDescription
            className="text-center"
            onClick={() => setIsLogin(false)}
          >
            Don&apos;t have an account?{" "}
            <a href="#" className="underline underline-offset-4">
              Sign up
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
