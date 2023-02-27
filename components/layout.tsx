import Header from "components/nav/header";
import Footer from "components/nav/footer";
import Loader from "components/feedback/loader";
import Alert from "components/feedback/alert";
import { ReactNode } from "react";
import { useRouter } from "next/router";

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <div className={"min-h-screen"}>
      {router.pathname !== "/login" && <Header />}
      <Loader />
      <Alert />
      <main className={"p-6"}>{children}</main>
      <Footer />
    </div>
  );
}
