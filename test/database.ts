// database schema
import {
	Database,
	Schema,
	Table,
	BooleanColumn,
	NumberColumn,
	TextColumn,
	DateColumn,
} from '../src'

export const database = new Database({
	version: 1,
	schemas: {
		public: new Schema({
			name: 'public',
			tables: {
				table1: new Table({
					name: 'table1',
					columns: {
						col1: new TextColumn({ name: 'col1' }),
						col2: new TextColumn({ name: 'col2' }),
						col3: new TextColumn({ name: 'col3' }),
						col4: new NumberColumn({ name: 'col4' }),
						col5: new NumberColumn({ name: 'col5' }),
						col6: new NumberColumn({ name: 'col6' }),
						col7: new BooleanColumn({ name: 'col7' }),
						col8: new BooleanColumn({ name: 'col8' }),
						col9: new DateColumn({ name: 'col9' }),
						col10: new DateColumn({ name: 'col10' }),
					},
				}),
				table2: new Table({
					name: 'table2',
					columns: {
						col1: new TextColumn({ name: 'col1' }),
						col2: new TextColumn({ name: 'col2' }),
					},
				}),
				table3: new Table({
					name: 'table3',
					columns: {
						col1: new TextColumn({ name: 'col1' }),
						col2: new TextColumn({ name: 'col2' }),
					},
				}),
			},
		}),
		schema1: new Schema({
			name: 'schema1',
			tables: {
				table1: new Table({
					name: 'table1',
					columns: {
						col1: new TextColumn({ name: 'col1' }),
					},
				}),
				table2: new Table({
					name: 'table2',
					columns: {
						col1: new TextColumn({ name: 'col1' }),
					},
				}),
			},
		}),
	},
})
