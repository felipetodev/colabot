// import {
//   createParser,
//   ParsedEvent,
//   ReconnectInterval,
// } from "eventsource-parser";

import type { ChatState, OpenAIStreamPayload } from "../types";

export async function OpenAIStream (chatState: ChatState, vsCodePayload: OpenAIStreamPayload) {
  // const encoder = new TextEncoder();
  // const decoder = new TextDecoder();

  chatState.unshift({
    role: 'system',
    content: 'You are a very enthusiastic ColaBOT Chat representative who loves to help people!'
  })

  const { apiKey, ...payload } = vsCodePayload;

  if (payload.model === "gpt-3.5-turbo") {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      method: "POST",
      body: JSON.stringify({
        messages: chatState,
        ...payload,
      }),
    });
    const completion = await res.json();
    return completion.choices[0].message?.content
  }

  let prompt = '"[user]:" means that some user is asking you for help\n\n'

  for (const { role, content } of chatState) {
    role === 'system'
      ? prompt += `${content}\n`
      : prompt += `${[role]}: ${content}\n`
  }

  const res = await fetch("https://api.openai.com/v1/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    method: "POST",
    body: JSON.stringify({
      prompt,
      ...payload,
    }),
  });

  const completion = await res.json();

  /*
    const stream = new ReadableStream({
      async start(controller) {
        function onParse(event: ParsedEvent | ReconnectInterval) {
          if (event.type === "event") {
            const data = event.data;
            if (data === "[DONE]") {
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(data);
              const text = json.choices[0].text;
              if (counter < 2 && (text.match(/\n/) || []).length) {
                // this is a prefix character (i.e., "\n\n"), do nothing
                return;
              }
              const queue = encoder.encode(text);
              controller.enqueue(queue);
              counter++;
            } catch (e) {
              // maybe parse error
              controller.error(e);
            }
          }
        }
        const parser = createParser(onParse);
        for await (const chunk of res.body as any) {
          parser.feed(decoder.decode(chunk));
        }
      },
    });
  */

  return completion.choices[0].text;
}
