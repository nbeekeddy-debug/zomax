import { AuthScreen } from "@/components/auth-screen";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return <AuthScreen mode="login" />;
}
