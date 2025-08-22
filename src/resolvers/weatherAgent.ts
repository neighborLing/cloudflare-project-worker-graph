// Weather Agent API resolver
export async function weatherAgent(
  args: {
    messages: Array<{ role: string; content: string }>;
    runId?: string;
    runtimeContext?: any;
  },
  env: any
) {
  try {
    const { messages, runId = "weatherAgent", runtimeContext = {} } = args;

    // 构建请求体
    const requestBody = {
      messages,
      runId,
      runtimeContext
    };

    // 发送请求到天气代理服务
    const response = await fetch('https://meadery.win/api/agents/weatherAgent/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Weather Agent API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    
    // 返回完整的响应数据
    return {
      success: true,
      response: data.response || data,
      error: null
    };
  } catch (error) {
    console.error('Weather Agent API error:', error);
    return {
      success: false,
      response: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}