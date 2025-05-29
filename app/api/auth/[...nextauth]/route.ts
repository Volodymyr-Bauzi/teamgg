// /app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import {PrismaAdapter} from '@next-auth/prisma-adapter';
import {prisma} from '@/lib/db';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({session, user}: {session: any; user: any}) {
      // Optional: attach userId
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
} satisfies Parameters<typeof NextAuth>[0];

const handler = NextAuth(authOptions);
export {handler as GET, handler as POST};
