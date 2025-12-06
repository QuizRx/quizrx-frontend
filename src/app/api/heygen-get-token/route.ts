const HEYGEN_API_KEY = process.env.NEXT_PUBLIC_HEYGEN_API_KEY;
const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || "*";

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-api-key",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function POST() {
  try {
    if (!HEYGEN_API_KEY) {
      throw new Error("API key is missing from .env");
    }
    const baseApiUrl = (process.env.NEXT_PUBLIC_BASE_API_URL || "https://api.heygen.com").replace(/\/$/, "");

    const res = await fetch(`${baseApiUrl}/v1/streaming.create_token`, {
      method: "POST",
      headers: {
        "x-api-key": HEYGEN_API_KEY,
        "accept": "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("HeyGen token response not OK:", res.status, text);
      return new Response("Failed to retrieve access token", { status: 500, headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN } });
    }

    const data = await res.json();

    return new Response(data?.data?.token || "", { status: 200, headers: { "content-type": "text/plain", "Access-Control-Allow-Origin": ALLOWED_ORIGIN } });
  } catch (error) {
    console.error("Error retrieving access token:", error);

    return new Response("Failed to retrieve access token", { status: 500, headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN } });
  }
}
