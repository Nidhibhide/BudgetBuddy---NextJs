import { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface User {
    id: string;
    email?: string;
    name?: string;
    authProvider?: "google" | "local";
  }
  interface Session {
    user: {
      id: string;
      name?: string;
      email?: string;
      authProvider?: "google" | "local";
    } & DefaultSession["user"];
    accessToken?: string;
    refreshToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string;
    authProvider?: "google" | "local";
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    refreshTokenExpires?: number;
  }
}
