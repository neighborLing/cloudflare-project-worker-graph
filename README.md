# Cloudflare GraphQL AI Worker

A GraphQL API worker for DeepSeek and OpenAI integration on Cloudflare Workers.

## 项目结构

```
├── src/
│   ├── index.ts        # Worker 入口文件
│   ├── schema.ts       # GraphQL schema 定义
│   └── resolvers/      # GraphQL resolvers
│       ├── deepseek.ts # DeepSeek API 集成
│       ├── openai.ts   # OpenAI API 集成
│       └── test.ts     # 测试接口
├── wrangler.toml       # Cloudflare Worker 配置
└── package.json        # 项目配置
```

## 环境配置

### 开发环境

1. 创建 `.dev.vars` 文件（本地开发用）：
```bash
DEEPSEEK_API_KEY=your-deepseek-api-key-here
OPENAI_API_KEY=your-openai-api-key-here
ENVIRONMENT=development
```

### 生产环境

使用 wrangler 设置生产环境密钥：
```bash
wrangler secret put OPENAI_API_KEY
wrangler secret put DEEPSEEK_API_KEY
```

## 自定义域名配置

项目已配置自定义域名访问，相关配置和用途：

### 1. wrangler.toml 路由配置
```toml
[[routes]]
pattern = "api.meadery.win/*"
zone_name = "meadery.win"
```
**用途**: 将自定义域名 `api.meadery.win/*` 的所有请求路由到此 Worker

### 2. GraphQL 端点配置
在 `src/index.ts` 中设置：
```typescript
const yoga = createYoga({
  // 设置 GraphQL 端点路径
  graphqlEndpoint: '/graphql',
  // ... 其他配置
});
```
**用途**: 将 GraphQL 服务端点设置为 `/graphql`，配合路由实现 `api.meadery.win/graphql` 访问

### 访问方式
- GraphQL API: `https://api.meadery.win/graphql`
- GraphQL Playground: `https://api.meadery.win/graphql`（浏览器访问）

## 部署步骤

### 构建和部署命令
- **Build command**: `npm run build`
- **Deploy command**: `npm run deploy`

### 完整部署流程

1. **安装依赖**:
   ```bash
   npm install
   ```

2. **构建项目**:
   ```bash
   npm run build
   ```

3. **部署到 Cloudflare Workers**:
   ```bash
   npm run deploy
   ```

4. **设置生产环境密钥**:
   ```bash
   wrangler secret put OPENAI_API_KEY
   wrangler secret put DEEPSEEK_API_KEY
   ```

5. **配置自定义域名** (在 Cloudflare Dashboard 中):
   - 确保域名已添加到 Cloudflare
   - 检查 DNS 记录配置
   - 验证 Worker 路由绑定

## 开发命令

```bash
# 本地开发
npm run dev

# 类型检查
npm run type-check

# 构建
npm run build

# 部署
npm run deploy
```

## API 接口

### GraphQL Queries

1. **testGraphQL** - 测试接口
2. **deepseekChat** - DeepSeek 聊天接口  
3. **openaiResponse** - OpenAI 响应接口

### 健康检查

- 端点: `/health`
- 返回: 服务状态和环境信息

## 技术栈

- **Cloudflare Workers** - 边缘计算平台
- **GraphQL Yoga** - GraphQL 服务器
- **TypeScript** - 类型安全的 JavaScript
- **Wrangler** - Cloudflare Workers CLI 工具