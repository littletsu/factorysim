import Roact from "@rbxts/roact";
import { PlayerInventory } from "shared/net/datastore";
import { ModelViewportFrame } from "./ModelViewportFrame";

export type PlacedItemMenuAction = "EDIT" | "PICKUP" | "CANCEL";

const MenuButtonStyle: Partial<WritableInstanceProperties<TextButton>> = {
	AnchorPoint: new Vector2(0.5, 0.5),
	BorderSizePixel: 0,
	Size: new UDim2(0.8, 0, 0.07, 0),
	FontFace: Font.fromName("FredokaOne"),
	TextSize: 21,
	TextScaled: true,
	Position: new UDim2(0, 0, 0, 0),
};

interface PlacedItemMenuProps {
	item: string | number;
	onItemMenu?: (action: PlacedItemMenuAction) => void;
}

export class PlacedItemMenu extends Roact.PureComponent<PlacedItemMenuProps> {
	private onItemMenu(action: PlacedItemMenuAction): void {
		if (this.props.onItemMenu) this.props.onItemMenu(action);
	}

	public render() {
		return (
			<frame
				BackgroundColor3={new Color3(255, 255, 255)}
				Position={new UDim2(0.8, 0, 0.3, 0)}
				Size={new UDim2(0.2, 0, 0.7, 0)}
				BorderSizePixel={0}
			>
				<uilistlayout
					Padding={new UDim(0.05, 0)}
					FillDirection={"Vertical"}
					HorizontalAlignment={"Center"}
					VerticalAlignment={"Top"}
				/>
				<uipadding PaddingTop={new UDim(0.05, 0)} />
				<ModelViewportFrame
					BorderSizePixel={0}
					Size={new UDim2(0.7, 0, 0.25, 0)}
					BackgroundColor3={Color3.fromRGB(199, 199, 199)}
					ViewportModel={this.props.item}
					Position={new UDim2(0, 0, 0, 0)}
				>
					<camera Key={"Camera"} CFrame={new CFrame(new Vector3(0, 0, 20))} />
					<uisizeconstraint MaxSize={new Vector2(150, 150)} />
					<uiaspectratioconstraint AspectType={"ScaleWithParentSize"} />
				</ModelViewportFrame>
				<textlabel
					FontFace={Font.fromName("FredokaOne")}
					TextSize={21}
					Text={tostring(this.props.item)}
					Size={new UDim2(0.5, 0, 0.07, 0)}
					BorderSizePixel={0}
					BackgroundTransparency={1}
				/>
				<textbutton
					{...MenuButtonStyle}
					BackgroundColor3={Color3.fromRGB(13, 239, 243)}
					Text={"Posicionar"}
					Event={{
						MouseButton1Click: () => this.onItemMenu("EDIT"),
					}}
				/>
				<textbutton
					{...MenuButtonStyle}
					BackgroundColor3={Color3.fromRGB(243, 233, 122)}
					Text={"Mover al inventario"}
					Event={{
						MouseButton1Click: () => this.onItemMenu("PICKUP"),
					}}
				/>
				<textbutton
					{...MenuButtonStyle}
					BackgroundColor3={Color3.fromRGB(243, 90, 92)}
					Text={"Cancelar"}
					Event={{
						MouseButton1Click: () => this.onItemMenu("CANCEL"),
					}}
				/>
			</frame>
		);
	}
}
