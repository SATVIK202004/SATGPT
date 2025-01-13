import { DEVELOPER_INFO } from '../../../config/constants';

let introducedAsSatGpt = false;

const systemPrompt = `You are SAT GPT, an AI assistant created by ${DEVELOPER_INFO.name}.`;

export function getSystemPrompt(forceIntroduce = false) {
  if (forceIntroduce || !introducedAsSatGpt) {
    introducedAsSatGpt = true;
    return systemPrompt;
  }
  return '';
}