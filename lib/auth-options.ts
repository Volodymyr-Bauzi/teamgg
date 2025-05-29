import {PrismaAdapter} from '@next-auth/prisma-adapter';
import {PrismaClient} from '@prisma/client';
import {type GetServerSidePropsContext} from 'next';
import DiscordProvider from 'next-auth/providers/discord';
import {getServerSession, type NextAuthOptions} from 'next-auth';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: ({session, token}: {session: any; token: any}) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub, // Assuming the user ID is stored in the token
      },
    }),
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error', // Error page URL
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext['req'];
  res: GetServerSidePropsContext['res'];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
