const targets = [
  "https://studypilot-seven.vercel.app/api/debug-json",
  "https://www.studypilot.cn/api/debug-json",
];

const body = {
  hello: "world",
  source: "debug",
};

for (const target of targets) {
  try {
    const response = await fetch(target, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const text = await response.text();

    console.log(JSON.stringify({
      url: target,
      status: response.status,
      contentType: response.headers.get("content-type"),
      responsePrefix: text.slice(0, 500),
    }, null, 2));
  } catch (error) {
    console.log(JSON.stringify({
      url: target,
      error: error instanceof Error ? error.message : "Unknown request error",
    }, null, 2));
  }
}
