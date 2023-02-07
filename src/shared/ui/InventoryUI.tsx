import Roact from "@rbxts/roact";
import { PlayerInventory } from "shared/net/datastore";
import { ModelViewportFrame } from "./ModelViewportFrame";

export type InventoryItemMenuAction = "PLACE" | "DELETE";

interface InventoryItemProps {
	i: number;
	item: string | number;
	quantity: string | number;
	// menuOptions?: Array<[string, Color3, () => void]>;
	onItemMenu: (action: InventoryItemMenuAction) => void;
}

interface InventoryItemState {
	showMenu: boolean;
}

const InventoryItemButtonStyle: Partial<WritableInstanceProperties<TextButton>> = {
	AnchorPoint: new Vector2(0.5, 0.5),
	BorderSizePixel: 0,
	Size: new UDim2(0.8, 0, 0.25, 0),
	FontFace: Font.fromName("FredokaOne"),
	TextSize: 21,
	TextScaled: true,
};

class InventoryItem extends Roact.Component<InventoryItemProps, InventoryItemState> {
	constructor(props: InventoryItemProps) {
		super(props);
		this.state = {
			showMenu: false,
		};
	}

	private onClick() {
		this.setState({
			showMenu: !this.state.showMenu,
		});
	}

	public render() {
		return (
			<ModelViewportFrame
				BorderSizePixel={1}
				Size={new UDim2(0.25, 0, 0.25, 0)}
				BackgroundColor3={Color3.fromRGB(255, 255, 255)}
				Position={new UDim2((this.props.i % 4) * 0.25, 0, math.floor(this.props.i / 4) * 0.25, 0)}
				ViewportModel={this.props.item}
			>
				<textlabel
					BackgroundTransparency={1}
					Size={new UDim2(0.3, 0, 0.2, 0)}
					FontFace={Font.fromName("FredokaOne")}
					TextScaled={true}
					TextSize={22}
					Text={`x${this.props.quantity}`}
				/>
				<textbutton
					BackgroundTransparency={1}
					BorderSizePixel={0}
					Size={new UDim2(1, 0, 1, 0)}
					Text={""}
					Event={{ MouseButton1Down: () => this.onClick() }}
				/>
				{this.state.showMenu ? (
					<>
						<textbutton
							{...InventoryItemButtonStyle}
							Position={new UDim2(0.5, 0, 0.4, 0)}
							BackgroundColor3={Color3.fromRGB(13, 239, 243)}
							Text={"Colocar"}
							Event={{
								MouseButton1Click: () => this.props.onItemMenu("PLACE"),
							}}
						/>
						<textbutton
							{...InventoryItemButtonStyle}
							Position={new UDim2(0.5, 0, 0.7, 0)}
							BackgroundColor3={Color3.fromRGB(243, 90, 92)}
							Text={"Eliminar"}
							Event={{
								MouseButton1Click: () => this.props.onItemMenu("DELETE"),
							}}
						/>
					</>
				) : undefined}
			</ModelViewportFrame>
		);
	}
}

interface InventoryUIProps {
	inventory: PlayerInventory;
	onItemMenu?: (item: string | number, action: InventoryItemMenuAction) => void;
}

export class InventoryUI extends Roact.PureComponent<InventoryUIProps, {}> {
	public constructor(props: InventoryUIProps) {
		super(props);
	}

	private onItemMenu(item: string | number, action: InventoryItemMenuAction) {
		if (this.props.onItemMenu) this.props.onItemMenu(item, action);
	}

	public render() {
		const items = new Array<Roact.Element>();
		let i = 0;
		for (const tuple of pairs(this.props.inventory)) {
			const [item, quantity] = tuple;
			if (quantity > 0)
				items.push(
					<InventoryItem
						onItemMenu={(action) => this.onItemMenu(item, action)}
						i={i}
						item={item}
						quantity={quantity}
					/>,
				);
			i++;
		}
		return (
			<scrollingframe
				AnchorPoint={new Vector2(0.5, 0.5)}
				BorderSizePixel={0}
				Position={new UDim2(0.5, 0, 0.5, 0)}
				Size={new UDim2(0.5, 0, 0.8, 0)}
				ScrollBarImageColor3={Color3.fromRGB(255, 255, 255)}
				AutomaticCanvasSize={"XY"}
			>
				{...items}
			</scrollingframe>
		);
	}
}
