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
    // 尝试使用绝对 URL 和适当的 headers
    const response = await fetch('https://meadery.win/api/agents/weatherAgent/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // 返回更详细的错误信息
      return {
        success: false,
        response: null,
        error: `Weather Agent API error: ${response.status} ${response.statusText}. Response: ${errorText}`
      };
    }

    const data = await response.json() as any;
    
    // 返回完整的响应数据
    return {
      success: true,
      response: data,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      response: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}