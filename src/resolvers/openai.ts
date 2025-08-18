interface OpenAIMessage {
  // developer 角色在 Responses API 中等价于系统指令；也可使用 "system"
  role: 'developer' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponseArgs {
  model?: string;
  input?: string;
  messages?: OpenAIMessage[];
  reasoning?: {
    effort?: 'low' | 'medium' | 'high';
  };
}

interface OpenAIResponse {
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
  // 新版本API的字段
  status?: string;
  output?: Array<{
    id: string;
    type: string;
    content?: Array<{
      type: string;
      text: string;
    }>;
  }>;
}

export async function openaiResponse(
  args: OpenAIResponseArgs,
  env: { OPENAI_API_KEY: string }
): Promise<OpenAIResponse> {
  try {
    // Validate API key
    if (!env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return {
        id: undefined,
        object: undefined,
        created: undefined,
        model: undefined,
        choices: undefined,
        usage: undefined,
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.'
      };
    }

    const {
      model = 'gpt-4o-mini', // ✅ 换用 Responses API 推荐/可用模型
      input,
      messages,
      // reasoning = { effort: 'low' },
    } = args;

    // 统一整理为 Responses API 的 input 数组
    let inputArray:
      | string
      | Array<{
          role: 'developer' | 'user' | 'assistant';
          content: Array<{ type: 'input_text'; text: string }>;
        }>;

    if (messages && messages.length) {
      inputArray = messages.map((m) => ({
        role: m.role,
        content: [{ type: 'input_text', text: m.content }], // ✅ 每条消息必须是"内容块数组"
      }));
    } else if (typeof input === 'string') {
      // 单条字符串也可直接作为 input
      inputArray = input;
    } else {
      return { error: 'Either input or messages parameter is required' };
    }

    const requestBody = {
      model,
      input: inputArray,
      // reasoning,           // ✅ Responses API 支持 reasoning 参数
      // max_output_tokens: 1024, // 可选，避免过长输出
    };
    
    console.log('=== OpenAI API Request Debug Info ===');
    console.log('URL:', 'https://api.openai.com/v1/responses');
    console.log('Method:', 'POST');
    console.log('Headers:', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.OPENAI_API_KEY.substring(0, 10)}...${env.OPENAI_API_KEY.slice(-4)}`
    });
    console.log('Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('Request Body Size:', JSON.stringify(requestBody).length, 'bytes');
    console.log('=====================================');

    // 使用OpenAI Responses API
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('=== OpenAI API Response Debug Info ===');
    console.log('Status Code:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('Response OK:', response.ok);
    console.log('Response URL:', response.url);
    console.log('Response Type:', response.type);
    console.log('======================================');

    // 非 2xx：读取文本并返回结构化错误
    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return {
        error: `OpenAI API Error: ${response.status} ${response.statusText} - ${errText}`,
      };
    }

    const raw = await response.text();
    let data: any;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      return { error: `Failed to parse OpenAI response: ${(e as Error).message}` };
    }

    // 兼容两种返回：优先 output_text（如果存在）
    const outputText =
      typeof data.output_text === 'string' && data.output_text.length
        ? data.output_text
        : (() => {
            const msg = (data.output || []).find((it: any) => it.type === 'message');
            const txt = msg?.content?.find((c: any) => c.type === 'output_text')?.text;
            return txt || '';
          })();

    // 统一回传成"choices"形状，兼容你现有的调用方
    return {
      id: data.id,
      object: data.object || 'chat.completion',
      created: data.created ?? Math.floor(Date.now() / 1000),
      model: data.model || model,
      choices: [
        {
          index: 0,
          message: { role: 'assistant', content: outputText },
          finish_reason: data.status === 'completed' ? 'stop' : 'length',
        },
      ],
      usage: {
        prompt_tokens: data.usage?.input_tokens ?? 0,
        completion_tokens: data.usage?.output_tokens ?? 0,
        total_tokens: data.usage?.total_tokens ?? 0,
      },
      // 也把原始 output 带回去以便调试
      status: data.status,
      output: data.output,
    };

  } catch (error) {
    return {
      error:
        error instanceof Error
          ? `Request failed: ${error.message}`
          : `Request failed: ${String(error)}`,
    };
  }
}

