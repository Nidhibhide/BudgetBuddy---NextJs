import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import dbConnect from "@/app/backend/config/MongoDB";
import User from "@/app/backend/models/user";
import { Login } from "@/app/backend/validations/user";
import { getTranslations } from "next-intl/server";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const t = await getTranslations('auth.login');

        if (!credentials?.email || !credentials?.password) {
          throw new Error(t('missingEmailOrPassword'));
        }

        const { error } = Login.validate({ email: credentials.email, password: credentials.password });
        if (error) {
          throw new Error(error.details[0].message);
        }

        await dbConnect();
        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error(t('noUserFound'));
        }

        if (user.authProvider !== "local") {
          throw new Error(t('differentLoginMethod'));
        }

        if (!user.password) {
          throw new Error(t('noUserFound'));
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error(t('incorrectPassword'));
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          authProvider: "local",
          currency: user.currency,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      await dbConnect();

      if (!user.email) return false;

      if (account?.provider === "google") {
        let dbUser = await User.findOne({ email: user.email });
        if (!dbUser) {
          dbUser = await User.create({
            name: user.name,
            email: user.email,
            password: null, // no password for Google
            authProvider: "google",
          });
        }
        user.id = dbUser._id.toString();
        user.authProvider = "google";
        user.currency = dbUser.currency;
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google") {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        if (account.expires_at) {
          token.accessTokenExpires = account.expires_at * 1000;
        }
      }

      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.authProvider = user.authProvider;
        token.currency = user.currency;
      }

      // Always fetch fresh user data from database to keep session in sync
      if (token.id) {
        await dbConnect();
        const freshUser = await User.findById(token.id);
        if (freshUser) {
          token.email = freshUser.email;
          token.name = freshUser.name;
          token.currency = freshUser.currency;
        }
      }

      // Check if access token is expired and refresh if needed (Google only) - skip in dev
      if (process.env.NODE_ENV === 'production' && token.authProvider === "google" && token.accessTokenExpires && Date.now() > token.accessTokenExpires && token.refreshToken) {
        const t = await getTranslations('auth.login');

        try {
          const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: process.env.GOOGLE_CLIENT_ID!,
              client_secret: process.env.GOOGLE_CLIENT_SECRET!,
              grant_type: 'refresh_token',
              refresh_token: token.refreshToken as string,
            }),
          });
          const refreshedTokens = await response.json();

          if (!response.ok) {
            throw new Error(t('tokenRefreshFailed'));
          }

          token.accessToken = refreshedTokens.access_token;
          token.accessTokenExpires = Date.now() + refreshedTokens.expires_in * 1000;
          if (refreshedTokens.refresh_token) {
            token.refreshToken = refreshedTokens.refresh_token;
          }
        } catch (error) {
          throw new Error(`${t('tokenRefreshFailed')}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.authProvider = token.authProvider as "google" | "local";
        session.user.currency = token.currency as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 days (in seconds)
  },
  secret: process.env.NEXTAUTH_SECRET,
};
