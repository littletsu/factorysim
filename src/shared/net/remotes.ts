import Net, { Definitions } from "@rbxts/net";
import { PlayerInventory } from "./datastore";

export type SerializedCFrame = LuaTuple<
	[number, number, number, number, number, number, number, number, number, number, number, number]
>;

export function SerializeCFrame(cframe: CFrame): SerializedCFrame {
	const components = cframe.GetComponents();
	return components;
}

export function DeserializeCFrame(serialized: SerializedCFrame): CFrame {
	// cant unpack array!?!? 💢💢💢💢
	const [x, y, z, r00, r01, r02, r10, r11, r12, r20, r21, r22] = serialized;
	return new CFrame(x, y, z, r00, r01, r02, r10, r11, r12, r20, r21, r22);
}

export const Remotes = Net.CreateDefinitions({
	GetPlayerInventory: Definitions.ServerAsyncFunction<() => PlayerInventory | undefined>(),
	PlaceInventoryItem: Definitions.ServerAsyncFunction<(item: string, pivot: CFrame) => boolean>(),
	EditPlacedItem: Definitions.ClientToServerEvent<[key: string, newPivot: CFrame, timestamp: number]>(),
	StopEditingPlacedItem: Definitions.ClientToServerEvent<[]>(),
	PickupPlacedItem: Definitions.ClientToServerEvent<[key: string]>(),

	// GetPlayerEquipped: Definitions.ServerAsyncFunction<() => SerializedPlayerEquipped>(),

	// PlayerInventoryUpdated: Definitions.ServerToClientEvent<[event: InventoryUpdatedEvent]>(),
	// PlayerEquippedUpdated: Definitions.ServerToClientEvent<[event: EquippedUpdatedEvent]>(),

	// PlayerUnequipItem: Definitions.ClientToServerEvent<[itemId: number]>(),
	// PlayerEquipItem: Definitions.ClientToServerEvent<[itemId: number]>(),
});
