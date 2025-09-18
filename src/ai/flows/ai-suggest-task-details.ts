// A file for suggesting task details using AI.
// This file exports the SuggestTaskDetailsInput and SuggestTaskDetailsOutput types, and the suggestTaskDetails function.
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTaskDetailsInputSchema = z.object({
  taskDescription: z
    .string()
    .describe('The description of the task for which to suggest details.'),
  currentSchedule: z
    .string()
    .describe('The user current schedule as a text.'),
});

export type SuggestTaskDetailsInput = z.infer<typeof SuggestTaskDetailsInputSchema>;

const SuggestTaskDetailsOutputSchema = z.object({
  suggestedPriority: z
    .string()
    .describe('The suggested priority for the task (e.g., High, Medium, Low).'),
  suggestedDeadline: z
    .string()
    .describe('The suggested deadline for the task in ISO date format (YYYY-MM-DD).'),
});

export type SuggestTaskDetailsOutput = z.infer<typeof SuggestTaskDetailsOutputSchema>;

export async function suggestTaskDetails(input: SuggestTaskDetailsInput): Promise<SuggestTaskDetailsOutput> {
  return suggestTaskDetailsFlow(input);
}

const suggestTaskDetailsPrompt = ai.definePrompt({
  name: 'suggestTaskDetailsPrompt',
  input: {schema: SuggestTaskDetailsInputSchema},
  output: {schema: SuggestTaskDetailsOutputSchema},
  prompt: `Based on the following task description and the user\'s current schedule, suggest an optimal task priority and deadline.

Task Description: {{{taskDescription}}}
Current Schedule: {{{currentSchedule}}}

Consider the task description and current schedule to determine the most appropriate priority (High, Medium, Low) and deadline (YYYY-MM-DD).
Ensure the deadline takes into account the current schedule and the time needed to complete the task.

Output your suggestion in JSON format.`,
});

const suggestTaskDetailsFlow = ai.defineFlow(
  {
    name: 'suggestTaskDetailsFlow',
    inputSchema: SuggestTaskDetailsInputSchema,
    outputSchema: SuggestTaskDetailsOutputSchema,
  },
  async input => {
    const {output} = await suggestTaskDetailsPrompt(input);
    return output!;
  }
);
