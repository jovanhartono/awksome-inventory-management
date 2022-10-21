import Header from "./header";
import Footer from "./footer";
import { ReactNode } from "react";
import Loader from "./loader";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className={"min-h-screen"}>
      <Loader />
      <Header />
      <main className={"p-6"}>{children}</main>
      <Footer />
    </div>
  );
}
