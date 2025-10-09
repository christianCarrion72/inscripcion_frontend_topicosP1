import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        registro: { label: "Registro", type: "number", placeholder: "219062851" },
        contraseña: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login/estudiante-docente`,
          {
            method: "POST",
            body: JSON.stringify({
              registro: Number(credentials.registro),
              contraseña: credentials.contraseña,
            }),
            headers: { "Content-Type": "application/json" },
          }
        );

        const user = await res.json();

        if (!res.ok || user.error) return null; // importante manejar errores
        return user; // debe contener access_token y datos del usuario
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) return { ...token, ...user };
      return token;
    },
    async session({ session, token }) {
      session.user = token as any;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
