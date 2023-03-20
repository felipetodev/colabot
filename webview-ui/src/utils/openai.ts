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
    try {
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

      if (completion.error) {
        return completion.error.message
      }

      return completion.choices[0].message?.content
    } catch(err) {
      console.error(err)
      return "I'm sorry, I'm having trouble connecting to the OpenAI API. Please try again later."
    }
  }

  let prompt = '"[user]:" means that some user is asking you for help\n\n'

  for (const { role, content } of chatState) {
    role === 'system'
      ? prompt += `${content}\n`
      : prompt += `${[role]}: ${content}\n`
  }

  try {
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
    return completion.choices[0].text;
  } catch (err) {
    console.error(err)
    return "I'm sorry, I'm having trouble connecting to the OpenAI API. Please try again later."
  }
}
