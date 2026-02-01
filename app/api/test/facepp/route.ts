import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check environment variables
    const apiKey = process.env.FACEPP_API_KEY;
    const apiSecret = process.env.FACEPP_API_SECRET;
    
    if (!apiKey || !apiSecret) {
      return NextResponse.json({
        success: false,
        message: "Face++ API credentials not configured",
        debug: {
          apiKeyExists: !!apiKey,
          apiSecretExists: !!apiSecret,
          apiKeyLength: apiKey?.length || 0,
          apiSecretLength: apiSecret?.length || 0
        }
      });
    }
    
    // Test API connectivity with a simple detect call
    const formData = new URLSearchParams();
    formData.append("api_key", apiKey);
    formData.append("api_secret", apiSecret);
    formData.append("image_base64", "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A");
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(
      "https://api-us.faceplusplus.com/facepp/v3/detect",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
        signal: controller.signal
      }
    );
    
    clearTimeout(timeoutId);
    
    const responseText = await response.text();
    
    return NextResponse.json({
      success: response.ok,
      message: response.ok ? "Face++ API is working" : "Face++ API error",
      debug: {
        status: response.status,
        statusText: response.statusText,
        responseLength: responseText.length,
        responsePreview: responseText.substring(0, 200),
        apiKeyConfigured: true,
        apiSecretConfigured: true,
        apiKeyLength: apiKey.length,
        apiSecretLength: apiSecret.length
      },
      fullResponse: responseText
    });
    
  } catch (error) {
    console.error("FACE++ TEST ERROR:", error);
    
    return NextResponse.json({
      success: false,
      message: "Face++ API test failed",
      error: error instanceof Error ? error.message : "Unknown error",
      debug: {
        apiKeyConfigured: !!process.env.FACEPP_API_KEY,
        apiSecretConfigured: !!process.env.FACEPP_API_SECRET,
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorStack: error instanceof Error ? error.stack : undefined
      }
    });
  }
}
