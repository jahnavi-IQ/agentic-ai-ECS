// src/app/api/graphql/route.ts
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { NextRequest } from 'next/server';
import typeDefs from '@/graphql/schema';
import resolvers from '@/graphql/resolvers';

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const apolloServer = new ApolloServer({
  schema,
  introspection: process.env.NODE_ENV !== 'production',
});

async function context({ req }: { req: NextRequest }) {
  // TODO: Add authentication logic here
  return {
    user: null, // Replace with actual user from JWT
    req,
  };
}

const handler = startServerAndCreateNextHandler(apolloServer, {
  context,
});

export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';