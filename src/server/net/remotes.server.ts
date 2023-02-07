import inspect from "@rbxts/inspect";

import { PlacedItemsStore, PlayerInventory, PlayerInventoryStore } from "shared/net/datastore";
import { Remotes, SerializeCFrame } from "shared/net/remotes";
import { createItemClone, getModel, getPlacedItemsFolder } from "shared/utils";

Remotes.Server.Get("GetPlayerInventory").SetCallback((player): PlayerInventory | undefined => {
	const data = PlayerInventoryStore.getPlayer(player);
	return data;
});

Remotes.Server.Get("PlaceInventoryItem").SetCallback((player, item, pivot): boolean => {
	const inventory = PlayerInventoryStore.getPlayer(player);
	print(inspect(inventory), item);
	if (inventory === undefined || inventory[item] === undefined || inventory[item] <= 0) return false;
	inventory[item] = inventory[item] - 1;
	PlayerInventoryStore.setPlayer(player, inventory);
	const itemKey = tostring(DateTime.now().UnixTimestamp);

	createItemClone(item, itemKey, pivot);

	const placedItems = PlacedItemsStore.getSave();
	if (placedItems === undefined) {
		return false;
	}
	placedItems[itemKey] = [item, SerializeCFrame(pivot)];
	PlacedItemsStore.setSave(placedItems);

	return true;
});
const latestEdit: { [key: string | number]: [playerId: number, timestamp: number] } = {};
const findPlayerEdit = (playerId: number) => {
	const results = [];
	for (const tuple of pairs(latestEdit)) {
		const [key, [id]] = tuple;
		if (playerId === id) results.push(key);
	}
	return results;
};
Remotes.Server.Get("EditPlacedItem").Connect((player, key, newPivot, timestamp) => {
	const editKey = key;
	if (
		(latestEdit[editKey] !== undefined && latestEdit[editKey][1] > timestamp) ||
		(latestEdit[editKey] !== undefined && latestEdit[editKey][0] !== player.UserId)
	)
		return;

	const itemModel = getPlacedItemsFolder().FindFirstChild(key) as Model | undefined;
	if (!itemModel) return;
	latestEdit[editKey] = [player.UserId, timestamp];
	itemModel.SetAttribute("editing", true);
	const itemId = itemModel.GetAttribute("id") as string | undefined;
	if (itemId === undefined) return;
	itemModel.PivotTo(newPivot);

	const placedItems = PlacedItemsStore.getSave();
	if (placedItems === undefined) return;

	placedItems[key] = [itemId, SerializeCFrame(newPivot)];
	PlacedItemsStore.setSave(placedItems);
});

Remotes.Server.Get("StopEditingPlacedItem").Connect((player) => {
	findPlayerEdit(player.UserId).forEach((key) => {
		const itemModel = getPlacedItemsFolder().FindFirstChild(key) as Model | undefined;
		if (!itemModel) return;
		delete latestEdit[key];
		itemModel.SetAttribute("editing", false);
	});
});

Remotes.Server.Get("PickupPlacedItem").Connect((player, key) => {
	const inventory = PlayerInventoryStore.getPlayer(player);
	if (inventory === undefined) return;

	const itemModel = getPlacedItemsFolder().FindFirstChild(key) as Model | undefined;
	if (!itemModel) return;
	const itemId = itemModel.GetAttribute("id") as string | undefined;
	if (itemId === undefined) return;
	const placedItems = PlacedItemsStore.getSave();
	if (placedItems === undefined) return;
	if (!placedItems[key]) return;
	delete placedItems[key];
	PlacedItemsStore.setSave(placedItems);

	inventory[itemId] = (inventory[itemId] ?? 0) + 1;
	PlayerInventoryStore.setPlayer(player, inventory);

	itemModel.Destroy();
});
