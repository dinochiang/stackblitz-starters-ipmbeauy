// utils/func-tool.js
import { zodFunction } from "openai/helpers/zod";
// 統⼀的 tool 物件：{ name, description, fn, parameters }
export function defineTool({ name, description, fn, parameters }) {
return { name, description, fn, parameters };
}
// 把 tool 物件轉成 OpenAI tools 陣列要的格式
export function toOpenAITool(tool) {
return zodFunction({
name: tool.name,
description: tool.description,
parameters: tool.parameters,
 });
}