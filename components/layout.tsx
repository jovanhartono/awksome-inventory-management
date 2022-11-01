import Header from "components/nav/header";
import Footer from "components/nav/footer";
import Loader from "components/feedback/loader";
import Alert from "components/feedback/alert";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className={"min-h-screen"}>
      <Loader />
      <Header />
      <Alert />
      <main className={"p-6"}>{children}</main>
      <Footer />
    </div>
  );
}
