import * as CohereAIApi from 'cohere-ai';
CohereAIApi.init('YOUR_API_KEY');

const formatType = {
  paragraph: 'paragraph',
  bullet: 'bullet',
};

const modelType = {
  xlarge: 'summarize-xlarge',
  medium: 'summarize-medium',
};

const lengthOptions = {
  short: 'short',
  medium: 'medium',
  long: 'long',
};

export async function cohereApi(selectedText: string) {
  const response = await CohereAIApi.summarize({
    text: `${selectedText} Explain how this code works:`,
    length: lengthOptions.long,
    format: formatType.paragraph,
    model: modelType.xlarge,
    // additional_command: '',
    temperature: 0.3,
  });
  console.log('Summary:', response.body.summary);
  return response.body.summary;
}
