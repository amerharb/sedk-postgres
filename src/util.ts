import { Step } from './steps/Step'

export function escapeDoubleQuote(source:string): string {
  return source.replace(/"/g, '""')
}

export function returnStepOrThrow(step: Step|undefined): Step {
  if (step === undefined) {
    throw new Error('Step property in builder data is not initialized')
  }
  return step
}