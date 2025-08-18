interface OpenAIMessage {
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

    let { model = 'gpt-4o', input, messages, reasoning = { effort: 'low' } } = args;
    
    // Handle different input formats
    let formattedInput: OpenAIMessage[];
    if (messages) {
      // Use messages array if provided
      formattedInput = messages;
    } else if (input) {
      // Convert string input to message format
      formattedInput = [{ role: 'user', content: input }];
    } else {
      // No input provided
      return {
        id: undefined,
        object: undefined,
        created: undefined,
        model: undefined,
        choices: undefined,
        usage: undefined,
        error: 'Either input or messages parameter is required'
      };
    }
    
    console.log('OpenAI API Request:', { model, input: formattedInput, reasoning, key: env.OPENAI_API_KEY });

    // 使用OpenAI Responses API
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model,
        // reasoning,
        input: formattedInput
      })
    });

    console.log('OpenAI API Response Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error Response:', errorText);
      return {
        id: undefined,
        object: undefined,
        created: undefined,
        model: undefined,
        choices: undefined,
        usage: undefined,
        error: `OpenAI API Error: ${response.status} - ${errorText}`
      };
    }

    const data = await response.json() as any;
    console.log('OpenAI API Response Data:', JSON.stringify(data, null, 2));
    
    // 检查是否是新版本API响应格式
    if (data.output && Array.isArray(data.output)) {
      // 新版本API格式，转换为标准格式
      const messageOutput = data.output.find((item: any) => item.type === 'message');
      const textContent = messageOutput?.content?.find((item: any) => item.type === 'output_text');
      
      return {
        id: data.id,
        object: data.object || 'chat.completion',
        created: data.created_at || Math.floor(Date.now() / 1000),
        model: data.model,
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: textContent?.text || ''
          },
          finish_reason: data.status === 'completed' ? 'stop' : 'length'
        }],
        usage: {
          prompt_tokens: data.usage?.input_tokens || 0,
          completion_tokens: data.usage?.output_tokens || 0,
          total_tokens: data.usage?.total_tokens || 0
        }
      };
    } else {
      // 标准的OpenAI API响应格式
      return {
        id: data.id,
        object: data.object,
        created: data.created,
        model: data.model,
        choices: data.choices,
        usage: data.usage
      };
    }

  } catch (error) {
    console.error('OpenAI API Error:', error);
    return {
      id: undefined,
      object: undefined,
      created: undefined,
      model: undefined,
      choices: undefined,
      usage: undefined,
      error: `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

