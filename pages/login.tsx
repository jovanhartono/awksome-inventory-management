import Head from "next/head";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import { signIn } from "next-auth/react";
import { ButtonSubmit } from "@components";
import { useState } from "react";
import { useRouter } from "next/router";
import { useAlertStore, AlertStatus } from "@store";

const schema = z.object({
  username: z.string(),
  password: z.string(),
});

export default function Login() {
  const { register, handleSubmit } = useForm<{
    username: string;
    password: string;
  }>({
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onChange",
    resolver: zodResolver(schema),
  });

  const { show: showAlert } = useAlertStore();
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  async function onSubmit(data: { username: string; password: string }) {
    setLoading(true);

    const res = await signIn("credentials", {
      email: data.username,
      password: data.password,
      redirect: false,
    });

    setLoading(false);
    console.log(res);

    if (!res?.ok) {
      showAlert("Username or password is incorrect", AlertStatus.ERROR);
    }

    if (res?.ok) {
      showAlert("Login Success");
      await router.push("/");
    }
  }

  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <section className="flex justify-center">
        <div className="border border-transparent rounded-md p-6 bg-white shadow-lg">
          <div className="mb-4 border-b pb-4">
            <div className="flex mb-1 items-center">
              <div className="rounded-full w-8 p-1 bg-amber-100 aspect-square flex justify-center items-center">
                <LockClosedIcon className={"w-4 h-4 text-amber-700"} />
              </div>
              <h1 className="text-xl text-gray-700 capitalize ml-3">
                Admin Login
              </h1>
            </div>
            <p className={"text-gray-500 text-sm xl:text-base tracking-tight"}>
              Silahkan login menggunakan username dan password terlebih dahulu.
            </p>
          </div>
          <form className={"space-y-3"} onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col space-y-6">
              <div className={"flex flex-col"}>
                <label
                  htmlFor={"username-admin-form"}
                  className={"mb-1.5 font-light text-gray-500"}
                >
                  Username
                </label>
                <input
                  {...register("username")}
                  id={"username-admin-form"}
                  placeholder={"Enter admin username"}
                />
              </div>
              <div className={"flex flex-col"}>
                <label
                  htmlFor={"password-admin-form"}
                  className={"mb-1.5 font-light text-gray-500"}
                >
                  Password
                </label>
                <input
                  {...register("password")}
                  id={"password-admin-form"}
                  placeholder={"Enter admin password"}
                  type="password"
                />
              </div>
              <ButtonSubmit text={"Log In"} loading={loading} />
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
