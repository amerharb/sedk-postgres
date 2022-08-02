import { escapeDoubleQuote } from './util'
import { BooleanColumn, Column, DateColumn, NumberColumn, TextColumn } from './columns'
import { IStatementGiver } from './models/IStatementGiver'
import { BuilderData } from './builder'

type SchemasObj = {
  [schemaName: string]: Schema
}

type DatabaseObj<S extends SchemasObj> = {
  version?: number
  schemas: S
}

export class Database<S extends SchemasObj = SchemasObj> {
	private readonly mSchemas: S
	private readonly schemaArray: readonly Schema[]

	constructor(private readonly data: DatabaseObj<S>) {
		this.mSchemas = data.schemas
		const schemaArray: Schema[] = []
		Object.values(data.schemas).forEach(it => {
			schemaArray.push(it)
			it.database = this
		})
		this.schemaArray = schemaArray
	}

	public get schemas(): S {
		return this.mSchemas
	}

	/** Alias to get schemas() */
	public get s(): S {
		return this.schemas
	}

	public isSchemaExist(schema: Schema): boolean {
		for (const s of this.schemaArray) {
			if (schema === s) {
				return true
			}
		}
		return false
	}

	public hasTable(table: Table): boolean {
		for (const schema of this.schemaArray) {
			if (schema.isTableExist(table)) {
				return true
			}
		}
		return false
	}

	public hasColumn(column: Column): boolean {
		for (const schema of this.schemaArray) {
			if (schema.isColumnExist(column)) {
				return true
			}
		}
		return false
	}
}

type TablesObj = {
  [tableName: string]: Table
}

type SchemaObj<T extends TablesObj> = {
  name?: string
  tables: T
}

export class Schema<T extends TablesObj = TablesObj> {
	private mDatabase?: Database
	private readonly mTables: T
	private readonly tableArray: readonly Table[]

	constructor(private readonly data: SchemaObj<T>) {
		this.mTables = data.tables
		const tableArray: Table[] = []
		Object.values(data.tables).forEach(it => {
			tableArray.push(it)
			it.schema = this
		})
		this.tableArray = tableArray
	}

	public set database(database: Database) {
		if (this.mDatabase === undefined)
			this.mDatabase = database
		else
			throw new Error('Database can only be assigned one time')
	}

	public get database(): Database {
		if (this.mDatabase === undefined)
			throw new Error('Database is undefined')

		return this.mDatabase
	}

	public get name(): string {
		return this.data.name ?? 'public'
	}

	public get tables(): T {
		return this.mTables
	}

	/** Alias to get tables() */
	public get t(): T {
		return this.tables
	}

	public isTableExist(table: Table): boolean {
		for (const t of this.tableArray) {
			if (table === t) {
				return true
			}
		}
		return false
	}

	public isColumnExist(column: Column): boolean {
		for (const table of this.tableArray) {
			if (table.isColumnExist(column)) {
				return true
			}
		}
		return false
	}
}

type ColumnsObj = {
  [columnName: string]: BooleanColumn|NumberColumn|TextColumn|DateColumn
}

type TableObj<C extends ColumnsObj> = {
  name: string
  columns: C
}

export class Table<C extends ColumnsObj = ColumnsObj> implements IStatementGiver {
	private mSchema?: Schema
	private readonly mColumns: C
	private readonly columnArray: readonly Column[]

	constructor(private readonly data: TableObj<C>) {
		this.mColumns = data.columns
		const columnArray: Column[] = []
		Object.values(data.columns).forEach(it => {
			columnArray.push(it)
			it.table = this
		})
		this.columnArray = columnArray
	}

	public set schema(schema: Schema) {
		if (this.mSchema === undefined)
			this.mSchema = schema
		else
			throw new Error('Schema can only be assigned one time')
	}

	public get schema(): Schema {
		if (this.mSchema === undefined)
			throw new Error('Table is undefined')

		return this.mSchema
	}

	public get name(): string {
		return this.data.name
	}

	public as(alias: string): AliasedTable {
		return new AliasedTable(this, alias)
	}

	public get columns(): C {
		return this.mColumns
	}

	/** Alias to get columns() */
	public get c(): C {
		return this.columns
	}

	public getColumn(columnName: string): Column|null {
		for (const col of this.columnArray) {
			if (col.name === columnName) {
				return col
			}
		}
		return null
	}

	public isColumnExist(column: Column): boolean {
		for (const col of this.columnArray) {
			if (col === column) {
				return true
			}
		}
		return false
	}

	public getColumns() {
		return this.data.columns
	}

	public getStmt(data: BuilderData): string {
		if (this.mSchema === undefined)
			throw new Error('Table is undefined')

		const schemaName = (
			this.mSchema.name !== 'public'
      || data.option.addPublicSchemaName === 'always'
      || (data.option.addPublicSchemaName === 'when other schema mentioned'
        && data.fromItemInfos.some(it => it.table.schema.name !== 'public'))
		) ? `"${escapeDoubleQuote(this.mSchema.name)}".` : ''
		return `${schemaName}"${escapeDoubleQuote(this.data.name)}"`
	}
}

export class AliasedTable {
	constructor(public readonly table: Table, public readonly alias: string) {}
}
