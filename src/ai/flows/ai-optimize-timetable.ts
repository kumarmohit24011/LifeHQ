'use server';

/**
 * @fileOverview A timetable optimization AI agent.
 *
 * - optimizeTimetable - A function that handles the timetable optimization process.
 * - OptimizeTimetableInput - The input type for the optimizeTimetable function.
 * - OptimizeTimetableOutput - The return type for the optimizeTimetable function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeTimetableInputSchema = z.object({
  tasks: z
    .string()
    .describe('A list of tasks with their deadlines and time estimates.'),
  timetable: z.string().describe('The current timetable schedule.'),
});
export type OptimizeTimetableInput = z.infer<typeof OptimizeTimetableInputSchema>;

const OptimizeTimetableOutputSchema = z.object({
  optimizedTimetable: z
    .string()
    .describe('The optimized timetable schedule based on the tasks and deadlines.'),
});
export type OptimizeTimetableOutput = z.infer<typeof OptimizeTimetableOutputSchema>;

export async function optimizeTimetable(input: OptimizeTimetableInput): Promise<OptimizeTimetableOutput> {
  return optimizeTimetableFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeTimetablePrompt',
  input: {schema: OptimizeTimetableInputSchema},
  output: {schema: OptimizeTimetableOutputSchema},
  prompt: `You are a timetable optimization expert. Given a list of tasks with deadlines and time estimates, and the current timetable schedule, suggest the most efficient arrangement of the schedule.

Tasks: {{{tasks}}}
Timetable: {{{timetable}}}

Optimize the timetable considering the deadlines and time estimates of the tasks. Return only the optimized timetable.`,
});

const optimizeTimetableFlow = ai.defineFlow(
  {
    name: 'optimizeTimetableFlow',
    inputSchema: OptimizeTimetableInputSchema,
    outputSchema: OptimizeTimetableOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
