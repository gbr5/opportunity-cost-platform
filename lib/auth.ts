import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { compare } from 'bcryptjs';
import { prisma } from './prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwordHash) return null;

        const passwordMatch = await compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!passwordMatch) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
    signIn: async ({ user, account }) => {
      if (account?.provider === 'google' && user.id) {
        // Mark email as verified for Google OAuth
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        });

        let product = await prisma.product.findUnique({
          where: { slug: 'custo-de-oportunidade' },
        });

        if (!product) {
          product = await prisma.product.create({
            data: {
              slug: 'custo-de-oportunidade',
              title: 'Custo de Oportunidade',
              type: 'BOOK',
              description:
                'Uma exploração profunda sobre o custo invisível de nossas escolhas. Entenda por que a maioria das pessoas toma decisões ruins e como enxergar o verdadeiro preço das suas decisões.',
              status: 'PUBLISHED',
            },
          });
        }

        if (product) {
          await prisma.access.upsert({
            where: {
              userId_productId: {
                userId: user.id,
                productId: product.id,
              },
            },
            update: {},
            create: {
              userId: user.id,
              productId: product.id,
              note: 'google-oauth-auto-grant',
            },
          });
        }
      }
      return true;
    },
  },
});
