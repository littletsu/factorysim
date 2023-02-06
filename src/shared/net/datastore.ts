import inspect from "@rbxts/inspect";
import { DataStoreService } from "@rbxts/services";
import { copy } from "shared/table";
import { getSaveID } from "shared/utils";
import { SerializedCFrame } from "./remotes";

interface DataStoreStorable {
	[index: string]: unknown;
}

class GameDataStore<DataType> {
	public name: string;
	private store?: DataStore;
	private saveID?: string;
	private defaultData: DataType;
	private changedData: DataStoreStorable;
	private cachedData: DataStoreStorable;

	constructor(name: string, defaultData: DataType) {
		this.name = name;
		this.defaultData = defaultData;
		this.changedData = {};
		this.cachedData = {};
	}

	init() {
		this.saveID = getSaveID();
		this.store = DataStoreService.GetDataStore(this.name, this.saveID);
		print(`Initializing datastore ${this.name} saveID ${this.saveID}`);
	}

	saveToDataStoreService() {
		if (!this.store) return warn(`Trying to save ${this.name} before init(). Data was not saved.`);
		for (const tuple of pairs(this.changedData)) {
			const [key, value] = tuple;
			this.store.SetAsync(tostring(key), value);
		}
		this.changedData = {};
		print(`GameDataStore ${this.name} saved.`);
	}

	set(key: number | string, value: DataType) {
		const storeKey = tostring(key);
		print(storeKey, `set ${this.name} - `, value);
		this.changedData[storeKey] = value;
		this.cachedData[storeKey] = value;
		print(this.cachedData, this.changedData);
		return value;
	}

	setPlayer(player: Player, data: DataType) {
		return this.set(player.UserId, data);
	}

	setSave(data: DataType) {
		if (this.saveID === undefined) {
			warn(`Trying to getSave on ${this.name} before init().`);
			return undefined;
		}
		return this.set(this.saveID, data);
	}

	get(key: number | string): DataType | undefined {
		const storeKey = tostring(key);
		print(`${storeKey} get ${this.name}`);
		if (!this.store) {
			warn(`Trying to get ${this.name} before init().`);
			return undefined;
		}
		if (this.cachedData[storeKey] === undefined) {
			let data = this.store.GetAsync(storeKey)[0];
			if (data === undefined) {
				print(`Setting default data for ${storeKey} on ${this.name}/${this.saveID}`);
				data = this.set(storeKey, copy(this.defaultData));
			}

			this.cachedData[storeKey] = data;
		}
		print(this.cachedData, this.changedData);
		return this.cachedData[storeKey] as DataType;
	}

	getPlayer(player: Player): DataType | undefined {
		return this.get(player.UserId);
	}

	getSave(): DataType | undefined {
		if (this.saveID === undefined) {
			warn(`Trying to getSave on ${this.name} before init().`);
			return undefined;
		}
		return this.get(this.saveID);
	}

	delete(key: number | string): void {
		const storeKey = tostring(key);
		if (!this.store) return warn(`Trying to delete ${storeKey} before init().`);

		delete this.cachedData[storeKey];
		delete this.changedData[storeKey];
		this.store.RemoveAsync(storeKey);
	}
}

export interface PlayerInventory {
	[id: string]: number;
}
const defaultPlayerInventory: PlayerInventory = {
	cube: 5,
};
export const PlayerInventoryStore = new GameDataStore<PlayerInventory>("PlayerInventory", defaultPlayerInventory);

export interface PlacedItems {
	[index: string]: [string, SerializedCFrame];
}
export const PlacedItemsStore = new GameDataStore<PlacedItems>("PlacedItems", {});

export const GameDataStoreList = [PlayerInventoryStore, PlacedItemsStore];
