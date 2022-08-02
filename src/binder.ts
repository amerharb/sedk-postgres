import { PrimitiveType } from './models/types'

export class BinderStore {
	private store: Binder[] = []

	public add(binder: Binder): void {
		if (binder.no !== undefined) {
			throw new Error('This binder already stored')
		}

		binder.no = this.store.length + 1
		this.store.push(binder)
	}

	public getBinder(value: PrimitiveType): Binder {
		const binder = new Binder(value, this.store.length + 1)
		this.store.push(binder)
		return binder
	}

	public getValues(): PrimitiveType[] {
		return this.store.map(it => it.value)
	}

	public cleanUp() {
		this.store.length = 0
	}
}

export class Binder {
	private mNo?: number = undefined

	public constructor(value: PrimitiveType)
	public constructor(value: PrimitiveType, no: number)
	public constructor(
		public readonly value: PrimitiveType,
		no?: number,
	) {
		if (no !== undefined) {
			this.mNo = no
		}
	}

	public set no(no: number|undefined) {
		if (this.mNo !== undefined) {
			throw new Error('This Binder already has a number')
		}
		this.mNo = no
	}

	public get no(): number|undefined {
		return this.mNo
	}

	public toString(): string {
		return this.getStmt()
	}

	public getStmt(): string {
		if (this.mNo === undefined) {
			throw new Error(`You can't getStmt() from this binder, The binder is not stored and has undefined "No"`)
		}
		return `$${this.mNo}`
	}
}
