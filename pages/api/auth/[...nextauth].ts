import NextAuth, { NextAuthOptions } from "next-auth";
import { prisma } from "prisma/config";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {},
      async authorize(credentials, req) {
        const { username, password } = credentials as {
          username: string;
          password: string;
        };

        const user = await prisma.user.findFirst({
          where: {
            username,
            password,
          },
        });
        if (user) {
            return {
            id: user.id,
            name: user.username,
          };
        } else return null;
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token }) {
      return token;
    },
  },
};

export default NextAuth(authOptions);
