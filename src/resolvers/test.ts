// GraphQL 测试 resolver
export async function testGraphQL(
  args: {
    message?: string;
    includeTimestamp?: boolean;
    echoCount?: number;
  },
  env: any
) {
  try {
    const { message = "Hello GraphQL!", includeTimestamp = true, echoCount = 1 } = args;
    
    // 创建echo数组
    const echo = Array(Math.max(1, Math.min(echoCount, 10))).fill(message);
    
    // 获取当前时间戳
    const timestamp = includeTimestamp ? new Date().toISOString() : null;
    
    // 模拟服务器信息
    const serverInfo = {
      environment: env.ENVIRONMENT || 'development',
      version: '1.0.0',
      uptime: formatUptime(Date.now())
    };
    
    return {
      success: true,
      message: `GraphQL测试成功! 收到消息: ${message}`,
      timestamp,
      echo,
      serverInfo
    };
    
  } catch (error) {
    console.error('GraphQL Test Error:', error);
    
    return {
      success: false,
      message: `测试失败: ${error instanceof Error ? error.message : '未知错误'}`,
      timestamp: new Date().toISOString(),
      echo: [],
      serverInfo: {
        environment: env.ENVIRONMENT || 'development',
        version: '1.0.0',
        uptime: formatUptime(Date.now())
      }
    };
  }
}

// 格式化运行时间
function formatUptime(startTime: number): string {
  const uptime = Date.now() - startTime;
  const seconds = Math.floor(uptime / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}