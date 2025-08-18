interface MessageInput {
  role: string;
  content: string;
}

interface DeepSeekChatArgs {
  messages: MessageInput[];
  model?: string;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

interface DeepSeekResponse {
  id?: string;
  object?: string;
  created?: number;
  model?: string;
  choices?: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: string;
}

export async function deepseekChat(
  args: DeepSeekChatArgs,
  env: { DEEPSEEK_API_KEY: string }
): Promise<DeepSeekResponse> {
  try {
    const {
      messages,
      model = 'deepseek-chat',
      stream = false,
      temperature,
      max_tokens
    } = args;

    // 构建请求体
    const requestBody: any = {
      model,
      messages,
      stream
    };

    // 添加可选参数
    if (temperature !== undefined) {
      requestBody.temperature = temperature;
    }
    if (max_tokens !== undefined) {
      requestBody.max_tokens = max_tokens;
    }

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        error: `DeepSeek API Error: ${response.status} - ${errorText}`
      };
    }

    const data = await response.json();
    return data as DeepSeekResponse;

  } catch (error) {
    console.error('DeepSeek API Error:', error);
    return {
      error: `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}