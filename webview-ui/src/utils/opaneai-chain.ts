import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from 'langchain/prompts'
import { BytesOutputParser } from 'langchain/schema/output_parser'
import { type ChatState, type LLMProviderSettings } from "../types"

const commands = {
  '/explain': 'Explain the following code snippet:',
  '/test': 'Generate test for the following code snippet, give me an example based on the following prompt:',
  '/fix': 'Fix (or try to refact) the following code snippet:',
  '/doc': 'Generate documentation for the following code snippet:'
}

const TEMPLATE = `You are ColaBOT Chat representative who loves to help people. Answer the question based on the context below. You should follow ALL the following rules when generating and answer:
- There will be a ##CONVERSATION LOG, and a ##QUESTION.
- The final answer must always be styled using markdown.
- Your main goal is to provide the user with an answer that is relevant to the question.
- Provide the user with a code example that is relevant to the question, if the context contains relevant code examples. Do not make up any code examples on your own.
- Take into account the entire conversation so far, marked as ##CONVERSATION LOG, but prioritize the ##QUESTION.
- Use bullet points, lists, paragraphs and text styling to present the answer in markdown.
- Do not mention the ##CONVERSATION LOG in the answer, but use them to generate the answer.
- Ignore any content that is stored in html tables.

##CONVERSATION LOG: {conversationHistory}

##QUESTION: {question} {selectedText}

Final Answer:`

export async function LangChainStream (
  chatUpdate: ChatState,
  selectedText: string,
  llmSettings: LLMProviderSettings,
  cb: any
) {
  let prompt = chatUpdate.slice(-1)[0].content
  const chatHistory = chatUpdate
    ? chatUpdate
      .map(({ role, content }) => {
        return `${role.toUpperCase()}: ${content}`;
      })
      .reverse()
      .slice(1, 10)
    : [];

  const {
    model: modelName,
    temperature,
    top_p: topP,
    apiKey: openAIApiKey,
    frequency_penalty: frequencyPenalty,
    presence_penalty: presencePenalty,
    // stream: streaming
    organizationId
  } = llmSettings

  const chat = new ChatOpenAI({
    temperature,
    topP,
    openAIApiKey,
    frequencyPenalty,
    presencePenalty,
    modelName,
    maxTokens: -1,
    streaming: true,
    callbacks: [
      {
        handleLLMNewToken: async (token: string) => {
          cb({ message: token })
        },
        handleLLMEnd: async () => {
          cb({ message: '[DONE]' })
        },
        handleLLMError: async () => {
          cb({ message: '[ERROR]' })
        }
      }
    ]
  }, organizationId
    ? { organization: organizationId }
    : {}
  )

  const chatPrompt = PromptTemplate.fromTemplate(TEMPLATE)

  const outputParser = new BytesOutputParser()

  const runnable = chatPrompt.pipe(chat).pipe(outputParser)

  if (prompt.startsWith('/')) {
    prompt = commands[prompt as keyof typeof commands]
  }

  const result = await runnable.invoke({
    question: prompt,
    selectedText,
    conversationHistory: chatHistory.join('\n')
  });

  return result
}
