import { z } from 'zod';
import { defineTool } from '../utils/func-tool.js';

async function calculate({ expression }) {
  try {
    const result = new Function(`return ${expression}`)();
    if (typeof result !== 'number' || isNaN(result)) {
      return { error: '無效的數學運算' };
    }
    
    return { result };
  } catch (error) {
    return { error: '無法解析或計算該數學運算式' };
  }
}


export const calculateTool = defineTool({
  name: 'calculate',
  description: '當使用者要求進行數學運算（如加、減、乘、除或複雜四則運算算式）時使用此工具。',
  fn: calculate,
  parameters: z.object({
    expression: z.string().describe('要計算的數學表達式字串，例如 "25 * 4" 或 "100 / (5 + 5)"'),
  }),
});