import { DataStoreService, Players, ReplicatedStorage, Workspace } from "@rbxts/services";
import { createItemClone, getModel, getSaveID } from "shared/utils";
import { DeserializeCFrame, SerializedCFrame } from "shared/net/remotes";
import { GameDataStoreList, PlacedItemsStore, PlayerInventoryStore } from "shared/net/datastore";

const part = new Instance("Part");
part.Anchored = true;
part.Size = new Vector3(1000, 1, 1000);
part.Position = new Vector3(0, -3, 0);
part.Transparency = 0.7;
part.Parent = Workspace;

const saveID = new Instance("StringValue");
saveID.Value = "none";
saveID.Name = "saveID";
saveID.Parent = ReplicatedStorage;

const placedItemsFolder = new Instance("Folder");
placedItemsFolder.Name = "PlacedItems";
placedItemsFolder.Parent = Workspace;

Players.PlayerAdded.Connect((player) => {
	if (saveID.Value === "none") {
		const save = tostring(player.UserId) + "kwk";
		saveID.Value = save;
		print(`Loading ${saveID.Value} save`);
		for (const gameDs of GameDataStoreList) {
			gameDs.init();
		}

		const placedItems = PlacedItemsStore.getSave();

		if (placedItems === undefined) return warn("Could not getSave for placedItems");

		for (const tuple of pairs(placedItems)) {
			const [key, [item, pivot]] = tuple;
			print("Placing ", pivot, item, key);
			const pivotCFrame = DeserializeCFrame(pivot);
			createItemClone(item, tostring(key), pivotCFrame);
		}
	}
});

Players.PlayerRemoving.Connect((player) => {
	print(`Saving datastores.`);
	for (const gameDs of GameDataStoreList) {
		gameDs.saveToDataStoreService();
	}
});
