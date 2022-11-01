import Image from "next/image";
import Logo from "../../public/logo.webp";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Header() {
  const router = useRouter();

  const menu: { label: string; path: string }[] = [
    {
      label: "Dashboard",
      path: "/",
    },
    {
      label: "Order",
      path: "/order",
    },
    {
      label: "Products",
      path: "/product",
    },
  ];

  return (
    <header className={"lg:p-6 border-b border-b-gray-100 space-y-4"}>
      <div className="flex justify-between items-center px-6 pt-6">
        <h1>Awksome</h1>
        <div className="relative w-10 h-10 rounded-full">
          <Image
            src={Logo}
            layout={"fill"}
            objectFit={"cover"}
            objectPosition={"top"}
            alt={"logo"}
          />
        </div>
      </div>
      <div className="flex space-x-4 px-6">
        {menu.map((route: { label: string; path: string }, idx: number) => {
          return (
            <Link href={route.path} key={idx}>
              <a
                className={`${
                  router.pathname === route.path
                    ? "font-normal border-b border-b-amber-700"
                    : "font-light hover:border-b hover:border-b-gray-500"
                } 
                                text-sm tracking-normal pb-3 basic-transition`}
              >
                {route.label}
              </a>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
