export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return new Response("Missing sessionId", { status: 400 });
  }

  const fnUrl =
    "https://us-central1-madelyana-5a652.cloudfunctions.net/enrichSessionGeo";

  try {
    await fetch(`${fnUrl}?sessionId=${sessionId}`);
    return new Response("OK");
  } catch {
    return new Response("Failed", { status: 500 });
  }
}
