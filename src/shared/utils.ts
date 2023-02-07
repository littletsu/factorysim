import { ReplicatedStorage, Workspace } from "@rbxts/services";

export function getSaveID() {
	const saveID = (ReplicatedStorage.FindFirstChild("saveID") as StringValue).Value;
	return saveID;
}

export function getModel(model: string | number) {
	return ReplicatedStorage.FindFirstChild("Models")?.FindFirstChild(model) as Model | undefined;
}

export const getPlacedItemsFolder = () => Workspace.WaitForChild("PlacedItems") as Folder;

export function findUntilParentIs(instance: Instance, parentName: string): Instance | undefined {
	if (instance.Parent === undefined) return undefined;
	return instance.Parent.Name === parentName ? instance : findUntilParentIs(instance.Parent, parentName);
}

export function createItemClone(item: string, key: string, pivot: CFrame) {
	const itemModelClone = getModel(item)?.Clone();
	if (!itemModelClone) return warn(`Couldn't find model "${item}"`);
	itemModelClone.PivotTo(pivot);
	itemModelClone.Parent = getPlacedItemsFolder();
	itemModelClone.Name = tostring(key);
	itemModelClone.SetAttribute("id", item);
	return itemModelClone;
}

export function createSelectionBox(parent: Instance, color3: Color3) {
	const selectionBox = new Instance("SelectionBox");
	selectionBox.Name = "SelectionBox";
	selectionBox.Color3 = color3;
	selectionBox.LineThickness = 0.02;
	selectionBox.Adornee = parent;
	selectionBox.Parent = parent;

	return selectionBox;
}

// export function getModelData(model: Model) {

// }
