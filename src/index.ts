import { createYoga, createSchema } from 'graphql-yoga';
import { typeDefs } from './schema';
import { deepseekChat } from './resolvers/deepseek';
import { openaiResponse } from './resolvers/openai';
import { testGraphQL } from './resolvers/test';

// 定义环境变量接口
interface Env {
  DEEPSEEK_API_KEY: string;
  OPENAI_API_KEY: string;
  ENVIRONMENT?: string;
}

// GraphQL resolvers
const resolvers = {
  Query: {
    testGraphQL: async (
      _: any,
      args: any,
      context: { env: Env }
    ) => {
      return await testGraphQL(args, context.env);
    },
    
    deepseekChat: async (
      _: any,
      args: any,
      context: { env: Env }
    ) => {
      return await deepseekChat(args, context.env);
    },
    
    openaiResponse: async (
      _: any,
      args: any,
      context: { env: Env }
    ) => {
      return await openaiResponse(args, context.env);
    },
  },
};

// 创建 GraphQL Schema
const schema = createSchema({
  typeDefs,
  resolvers,
});

// 创建 GraphQL Yoga 实例
const yoga = createYoga({
  schema,
  // 启用 GraphQL Playground (开发环境)
  graphiql: true,
  // CORS 配置
  cors: {
    origin: '*',
    credentials: true,
  },
  // 自定义上下文
  context: ({ request, env }: { request: Request; env: Env }) => {
    return {
      request,
      env,
    };
  },
});

// Cloudflare Worker 导出
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      // 健康检查端点
      const url = new URL(request.url);
      if (url.pathname === '/health') {
        return new Response(JSON.stringify({ 
          status: 'ok', 
          timestamp: new Date().toISOString(),
          environment: env.ENVIRONMENT || 'unknown'
        }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // 处理 GraphQL 请求
      return await yoga.handleRequest(request, { request, env });
    } catch (error) {
      console.error('Worker Error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Unknown error'
        }), 
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  },
};

// 类型导出
export type { Env };