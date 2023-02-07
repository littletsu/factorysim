import { ContextActionService, Players, Workspace } from "@rbxts/services";
import Roact from "@rbxts/roact";
import { SidebarButton } from "shared/ui/SidebarUI";
import { Remotes } from "shared/net/remotes";
import inspect from "@rbxts/inspect";
import { InventoryItemMenuAction, InventoryUI } from "shared/ui/InventoryUI";
import { findUntilParentIs, getModel, getPlacedItemsFolder } from "shared/utils";
import { PlayerInventory } from "shared/net/datastore";
import { PlacedItemMenu, PlacedItemMenuAction } from "shared/ui/PlacedItemMenu";

const LocalPlayer = Players.LocalPlayer;
const PlayerGui = LocalPlayer.FindFirstChild("PlayerGui");
const PlayerMouse = LocalPlayer.GetMouse();
const PlayerHumanoid = LocalPlayer.Character?.FindFirstChild("Humanoid") as Humanoid;

const checkAction = (actionName: string, action: string, state: Enum.UserInputState) =>
	action === actionName && state === Enum.UserInputState.Begin;

interface MainUIState {
	inventory: PlayerInventory | false;
	placingItem: string | number | false;
	editingItem: Model | false;
}

class MainUI extends Roact.PureComponent<{}, MainUIState> {
	constructor(props: {}) {
		super(props);
		this.state = {
			inventory: false,
			placingItem: false,
			editingItem: false,
		};
	}

	private placeItemModel(itemModelClone: Model, item: string | number) {
		this.setState({ placingItem: item, editingItem: false, inventory: false });
		PlayerMouse.TargetFilter = itemModelClone;
		const editingKey = itemModelClone.Name !== "Placing" ? itemModelClone.Name : undefined;
		const itemModelPivot = itemModelClone.GetPivot();
		let itemModelRotation = itemModelPivot.Rotation;

		let placingY = itemModelPivot.Position.Y;

		const unbindActions = () => {
			ContextActionService.UnbindAction("PlaceItem");
			ContextActionService.UnbindAction("ItemY+");
			ContextActionService.UnbindAction("ItemY-");
			PlayerMouse.TargetFilter = undefined;
			this.bindShowPlacedItemMenu();
		};
		ContextActionService.UnbindAction("ShowPlacedItemMenu");
		ContextActionService.BindAction(
			"PlaceItem",
			(actionName, state, inputObject) => {
				if (checkAction("PlaceItem", actionName, state)) {
					this.setState({
						placingItem: false,
					});
				}
			},
			true,
			Enum.UserInputType.MouseButton1,
		);

		ContextActionService.BindAction(
			"ItemY+",
			(actionName, state) => {
				if (checkAction("ItemY+", actionName, state)) {
					placingY += 1;
				}
			},
			true,
			Enum.KeyCode.E,
		);

		ContextActionService.BindAction(
			"ItemY-",
			(actionName, state) => {
				if (checkAction("ItemY-", actionName, state)) {
					placingY -= 1;
				}
			},
			true,
			Enum.KeyCode.Q,
		);

		ContextActionService.BindAction(
			"ItemRotate",
			(actionName, state) => {
				if (checkAction("ItemRotate", actionName, state)) {
					itemModelRotation = itemModelRotation.ToWorldSpace(CFrame.Angles(0, math.rad(10), 0));
				}
			},
			true,
			Enum.KeyCode.R,
		);

		spawn(async () => {
			let i = DateTime.now().UnixTimestamp;
			while (this.state.placingItem === item && PlayerHumanoid.Health !== 0) {
				const newCFrame = new CFrame(
					math.round(PlayerMouse.Hit.Position.X),
					placingY,
					math.round(PlayerMouse.Hit.Position.Z),
				).mul(itemModelRotation);

				if (editingKey !== undefined) {
					// datastore io is cached so this is okay..
					Remotes.Client.Get("EditPlacedItem").SendToServer(editingKey, newCFrame, i);
				} else itemModelClone.PivotTo(newCFrame);
				wait(0.1);
				i++;
			}
			const pivot = itemModelClone.GetPivot();
			const placingCancelled =
				PlayerHumanoid.Health === 0 || this.state.placingItem !== false || editingKey !== undefined;
			if (editingKey !== undefined) {
				await Remotes.Client.Get("StopEditingPlacedItem").SendToServer();
				this.setState({ editingItem: itemModelClone });
			}
			if (!placingCancelled) {
				await Remotes.Client.Get("PlaceInventoryItem").CallServerAsync(tostring(item), pivot);
				itemModelClone.Destroy();
			}
			unbindActions();
		});
	}

	private onInventoryAction(item: string | number, itemAction: InventoryItemMenuAction): void {
		switch (itemAction) {
			case "PLACE": {
				if (this.state.placingItem === item)
					return this.setState({
						inventory: false,
					});
				const itemModelClone = getModel(item)?.Clone();
				if (!itemModelClone) return;
				itemModelClone.Parent = Workspace;
				itemModelClone.Name = "Placing";
				this.placeItemModel(itemModelClone, item);
				break;
			}
		}
	}

	private async toggleInventory() {
		if (this.state.inventory)
			return this.setState({
				inventory: false,
				editingItem: false,
			});
		const inventory = await Remotes.Client.Get("GetPlayerInventory").CallServerAsync();
		if (!inventory) return warn("Could not GetPlayerInventory from server");
		print(inspect(inventory));
		this.setState({
			inventory,
			editingItem: false,
		});
	}

	private editItem(itemModel: Model) {
		const itemEditing = itemModel.GetAttribute("editing") as boolean | undefined;
		const itemId = itemModel.GetAttribute("id") as string | undefined;
		if (itemEditing) return print("Trying to edit an item being edited by someone else.");
		const itemKey = itemModel.Name;
		print(`Edit ${itemKey} ${itemId}`);
		if (itemId === undefined) return;
		this.placeItemModel(itemModel, itemKey);
	}

	private async onPlacedItemMenuAction(action: PlacedItemMenuAction) {
		if (this.state.editingItem) {
			switch (action) {
				case "EDIT":
					this.editItem(this.state.editingItem);
					break;
				case "PICKUP":
					await Remotes.Client.Get("PickupPlacedItem").SendToServer(this.state.editingItem.Name);
					break;
			}
		}
		this.setState({ editingItem: false });
	}

	private bindShowPlacedItemMenu() {
		ContextActionService.BindAction(
			"ShowPlacedItemMenu",
			(actionName, state) => {
				if (checkAction("ShowPlacedItemMenu", actionName, state)) {
					if (!PlayerMouse.Target) return;
					const itemModel = findUntilParentIs(PlayerMouse.Target, getPlacedItemsFolder().Name) as
						| Model
						| undefined;
					if (!itemModel) return;
					this.setState({ editingItem: itemModel });
				}
			},
			false,
			Enum.UserInputType.MouseButton1,
		);
	}

	public didMount() {
		ContextActionService.BindAction(
			"OpenInventory",
			(actionName, state) => {
				if (checkAction("OpenInventory", actionName, state)) {
					this.toggleInventory();
				}
			},
			false,
			Enum.KeyCode.LeftControl,
		);
		this.bindShowPlacedItemMenu();
	}

	public render() {
		return (
			<screengui>
				<SidebarButton text={"Tienda"} backgroundColor={Color3.fromRGB(255, 87, 87)} position={1} />
				<SidebarButton
					text={this.state.inventory ? "Cerrar" : "Inventario"}
					backgroundColor={Color3.fromRGB(87, 196, 255)}
					position={2}
					onClick={() => this.toggleInventory()}
				/>

				{this.state.editingItem ? (
					<PlacedItemMenu
						onItemMenu={(action) => this.onPlacedItemMenuAction(action)}
						item={(this.state.editingItem.GetAttribute("id") as string | undefined) ?? ""}
					/>
				) : undefined}
				{this.state.inventory ? (
					<InventoryUI
						onItemMenu={(item, action) => this.onInventoryAction(item, action)}
						inventory={this.state.inventory}
					/>
				) : undefined}
			</screengui>
		);
	}
}
Roact.mount(<MainUI />, PlayerGui);
