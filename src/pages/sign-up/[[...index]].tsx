import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex h-[100vh] w-full items-center justify-center">
      <SignUp afterSignUpUrl="/" />
    </div>
  );
}
