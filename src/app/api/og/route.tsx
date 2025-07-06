import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title") ?? "moo";
    const subtitle =
      searchParams.get("subtitle") ?? "a cozy cottage-core deduction game";
    const gameCode = searchParams.get("code");

    return new ImageResponse(
      (
        <div
          tw="h-full w-full flex flex-col items-center justify-center text-center p-16 relative"
          style={{
            backgroundColor: "#f1dfbe",
          }}
        >
          <h1
            tw="text-9xl font-bold mb-8"
            style={{
              fontFamily: "serif",
              color: "#a3a85e",
            }}
          >
            {title}
          </h1>

          <div tw="text-7xl mb-8 flex" style={{ gap: "24px" }}>
            🐮 🥛 🍄 🌸 🌿 🧺
          </div>

          <p
            tw="text-4xl mb-8 italic max-w-4xl leading-relaxed"
            style={{
              color: "#6b4423",
            }}
          >
            {subtitle}
          </p>

          {gameCode && (
            <div
              tw="text-white px-8 py-4 rounded-xl text-4xl font-bold tracking-widest"
              style={{
                backgroundColor: "#8b4513",
                letterSpacing: "6px",
              }}
            >
              {gameCode}
            </div>
          )}

          <div
            tw="absolute inset-0"
            style={{
              backgroundImage:
                "url(https://matsu-theme.vercel.app/texture.jpg)",
              backgroundSize: "100% 100%",
              backgroundRepeat: "repeat",
              opacity: 0.12,
              mixBlendMode: "multiply",
              zIndex: 100,
              isolation: "isolate",
              pointerEvents: "none",
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
        emoji: "fluent",
      },
    );
  } catch (e: unknown) {
    console.log(`${e instanceof Error ? e.message : "Unknown error"}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
