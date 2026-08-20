import { AuthScreen } from "@/components/auth-screen";

export const metadata = { title: "Create account" };

export default function SignupPage() {
  return <AuthScreen mode="signup" />;
}
