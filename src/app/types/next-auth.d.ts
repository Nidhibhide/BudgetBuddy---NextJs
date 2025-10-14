import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface User {
    id: string;
    email?: string;
    name?: string;
    authProvider?: "google" | "local";
    currency?: string;
  }
  interface Session {
    user: {
      id: string;
      name?: string;
      email?: string;
      authProvider?: "google" | "local";
      currency?: string;
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
    currency?: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    refreshTokenExpires?: number;
  }
}
