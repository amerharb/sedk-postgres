import { BooleanColumn, NumberColumn, TextColumn, DateColumn } from '../columns'
import { AggregateFunction } from '../AggregateFunction'
import { Expression } from './Expression'

export type NonNullPrimitiveType = boolean|number|string|Date
export type PrimitiveType = null|NonNullPrimitiveType

const booleanArray: readonly string[] = ['t', 'tr', 'tru', 'true', 'f', 'fa', 'fal', 'fals', 'false']
type TextBooleanSmallLetter = typeof booleanArray[number]
export type TextBoolean = TextBooleanSmallLetter|Capitalize<TextBooleanSmallLetter>|Uppercase<TextBooleanSmallLetter>

export type BooleanLike = boolean|TextBoolean|BooleanColumn
export type NumberLike = number|NumberColumn
export type TextLike = string|TextColumn
export type DateLike = Date|DateColumn
export type ValueLike = BooleanLike|NumberLike|TextLike|DateLike
export type ValueType = null|ValueLike
export type OperandType = ValueType|AggregateFunction|Expression

export function isTextBoolean(text: unknown): text is TextBoolean {
	if (typeof text === 'string')
		return booleanArray.includes(text.toLowerCase())
	return false
}

export function isTextNumber(text: unknown): text is number {
	if (typeof text === 'string') {
		const numberRegex = /^-?[0-9]+(\.[0-9]+)?$/
		return numberRegex.test(text)
	}
	return false
}
