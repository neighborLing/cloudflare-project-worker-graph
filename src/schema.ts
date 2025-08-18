import { buildSchema } from 'graphql';

export const typeDefs = `
  type Query {
    # DeepSeek Chat API
    deepseekChat(
      messages: [MessageInput!]!
      model: String = "deepseek-chat"
      stream: Boolean = false
      temperature: Float
      max_tokens: Int
    ): DeepSeekResponse
    
    # OpenAI Chat Completions API
    openaiResponse(
      model: String = "gpt-4o"
      input: String
      messages: [OpenAIMessageInput!]
      reasoning: ReasoningInput
    ): OpenAIResponse
  }
  
  # 消息输入类型
  input MessageInput {
    role: String!
    content: String!
  }
  
  # OpenAI 消息输入类型
  input OpenAIMessageInput {
    role: String!
    content: String!
  }
  
  # OpenAI 推理配置输入类型
  input ReasoningInput {
    effort: String
  }
  
  # DeepSeek API 响应类型
  type DeepSeekResponse {
    id: String
    object: String
    created: Int
    model: String
    choices: [Choice]
    usage: Usage
    error: String
  }
  
  # OpenAI API 响应类型
  type OpenAIResponse {
    id: String
    object: String
    created: Int
    model: String
    choices: [Choice]
    usage: Usage
    error: String
  }
  
  # 选择类型
  type Choice {
    index: Int
    message: Message
    finish_reason: String
  }
  
  # 消息类型
  type Message {
    role: String
    content: String
  }
  
  # 使用情况类型
  type Usage {
    prompt_tokens: Int
    completion_tokens: Int
    total_tokens: Int
  }
`;

export const schema = buildSchema(typeDefs);