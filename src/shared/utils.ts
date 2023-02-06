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

// export function getModelData(model: Model) {

// }
