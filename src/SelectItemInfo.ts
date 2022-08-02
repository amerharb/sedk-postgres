import { SelectItem } from './steps/Step'
import { Column } from './columns'
import { Expression } from './models/Expression'
import { escapeDoubleQuote } from './util'
import { BuilderData } from './builder'
import { AggregateFunction } from './AggregateFunction'
import { ItemInfo } from './ItemInfo'

export class SelectItemInfo extends ItemInfo {
	constructor(
    public readonly selectItem: SelectItem,
    public readonly alias?: string,
	) {
		super(alias)
	}

	public getColumns(): Column[] {
		if (this.selectItem instanceof Column) {
			return [this.selectItem]
		} else if (this.selectItem instanceof Expression) {
			return this.selectItem.getColumns()
		} else if (this.selectItem instanceof AggregateFunction) {
			return this.selectItem.getColumns()
		} // after this selectItem is always Asterisk or Binder
		return []
	}

	public getStmt(data: BuilderData): string {
		if (this.alias !== undefined) {
			// escape double quote by repeating it
			const escapedAlias = escapeDoubleQuote(this.alias)
			const asString = (data.option?.addAsBeforeColumnAlias === 'always')
				? ' AS' : ''
			return `${this.selectItem.getStmt(data)}${asString} "${escapedAlias}"`
		}
		return `${this.selectItem.getStmt(data)}`
	}
}
