import { ChatOpenAI } from "langchain/chat_models/openai"
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import { LLMChain } from "langchain/chains";

import { type ChatState, OpenAIStreamPayload } from "../types"

export async function LangChainStream (chatUpdate: ChatState, vsCodePayload: OpenAIStreamPayload, cb: any) {
  const prompt = chatUpdate.slice(-1)[0].content
  const chatHistory = chatUpdate
    ? chatUpdate
      .map((entry) => {
        return `${entry.role.toUpperCase()}: ${entry.content}`;
      })
      .reverse()
      .slice(0, 10)
    : [];

  const {
    model: modelName,
    temperature,
    top_p: topP,
    apiKey: openAIApiKey,
    frequency_penalty: frequencyPenalty,
    presence_penalty: presencePenalty,
    // stream: streaming
  } = vsCodePayload

  const chat = new ChatOpenAI({
    temperature,
    topP,
    openAIApiKey,
    frequencyPenalty,
    presencePenalty,
    modelName,
    streaming: true,
    callbacks: [
      {
        handleLLMNewToken: async (token: string) => {
          cb({ message: token })
        },
        handleLLMEnd: async () => {
          cb({ message: '[DONE]' })
        },
        handleLLMError: async (e) => {
          cb({ message: '[ERROR]' })
        },
      }
    ]
  }, {
    // organization: ''
  })

  const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(
      `You are ColaBOT Chat representative who loves to help people. Answer the question based on the context below. You should follow ALL the following rules when generating and answer:
      - There will be a CONVERSATION LOG, and a QUESTION.
      - The final answer must always be styled using markdown.
      - Your main goal is to provide the user with an answer that is relevant to the question.
      - Provide the user with a code example that is relevant to the question, if the context contains relevant code examples. Do not make up any code examples on your own.
      - Take into account the entire conversation so far, marked as CONVERSATION LOG, but prioritize the QUESTION.
      - Use bullet points, lists, paragraphs and text styling to present the answer in markdown.
      - Do not mention the CONVERSATION LOG in the answer, but use them to generate the answer.
      - ALWAYS prefer the result with the highest "score" value.
      - Ignore any content that is stored in html tables.

      CONVERSATION LOG: {conversationHistory}`
    ),
    HumanMessagePromptTemplate.fromTemplate(
      `QUESTION: {question}

      Final Answer: `
    ),
  ]);

  const chain = new LLMChain({
    prompt: chatPrompt,
    llm: chat,
  });

  const result = await chain.call({
    question: prompt,
    conversationHistory: chatHistory
  });

  console.log({ finalResponse: result })
  return result
}
