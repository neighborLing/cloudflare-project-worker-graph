// Custom Route API resolver
export async function customRoute(
  args: {},
  env: any
) {
  try {
    // 发送GET请求到指定的API接口
    const response = await fetch('https://mastra.meadery.win/my-custom-route', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        data: null,
        error: `Custom Route API error: ${response.status} ${response.statusText}. Response: ${errorText}`
      };
    }

    const data = await response.json() as any;
    
    return {
      success: true,
      data: data,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
