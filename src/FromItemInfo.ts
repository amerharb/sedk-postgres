import { escapeDoubleQuote } from './util'
import { BuilderData } from './builder'
import { IStatementGiver } from './models/IStatementGiver'
import { Table } from './database'
import { Condition } from './models/Condition'
import { LogicalOperator } from './operators'
import { Parenthesis } from './steps/BaseStep'
import { BooleanColumn } from './columns'
import { Expression } from './models/Expression'

export enum FromItemRelation {
  NO_RELATION = '',
  COMMA = ', ',
  JOIN = ' JOIN ',
  LEFT_JOIN = ' LEFT JOIN ',
  RIGHT_JOIN = ' RIGHT JOIN ',
  INNER_JOIN = ' INNER JOIN ',
  FULL_OUTER_JOIN = ' FULL OUTER JOIN ',
  CROSS_JOIN = ' CROSS JOIN ',
}

export class FromItemInfo implements IStatementGiver {
	private readonly onParts: (LogicalOperator|Condition|Parenthesis|BooleanColumn)[] = []

	constructor(
    public readonly fromItem: Table,
    public readonly relation: FromItemRelation = FromItemRelation.COMMA,
    public readonly alias?: string,
	) {}

	public get table(): Table {
		return this.fromItem
	}

	public addOrCondition(condition: Condition) {
		this.onParts.push(LogicalOperator.OR, condition)
	}

	public addAndCondition(condition: Condition) {
		this.onParts.push(LogicalOperator.AND, condition)
	}

	public addFirstCondition(condition: Condition) {
		this.onParts.push(condition)
	}

	public getStmt(data: BuilderData): string {
		if (this.alias !== undefined) {
			// escape double quote by repeating it
			const escapedAlias = escapeDoubleQuote(this.alias)
			const asString = (data.option?.addAsBeforeTableAlias === 'always')
				? ' AS' : ''
			return `${this.relation}${this.fromItem.getStmt(data)}${asString} "${escapedAlias}"${this.getOnPartString(data)}`
		}
		return `${this.relation}${this.fromItem.getStmt(data)}${this.getOnPartString(data)}`
	}

	private getOnPartString(data: BuilderData): string {
		if (this.onParts.length === 0) {
			return ''
		}
		const onPartsString = this.onParts.map(it => {
			if (it instanceof Condition || it instanceof Expression || it instanceof BooleanColumn) {
				return it.getStmt(data)
			}
			return it.toString()
		})
		return ` ON ${onPartsString.join(' ')}`
	}
}
