import Roact from "@rbxts/roact";

interface MenuButtonProps {
	text: string;
	position: number;
	backgroundColor: Color3;
	onClick?: ((rbx: TextButton, x: number, y: number) => void) | undefined;
}

export function SidebarButton(props: MenuButtonProps) {
	return (
		<textbutton
			Text={props.text}
			TextSize={21}
			BorderSizePixel={0}
			BackgroundColor3={props.backgroundColor}
			FontFace={Font.fromName("FredokaOne")}
			Size={new UDim2(0.15, 0, 0.1, 0)}
			Position={new UDim2(0, 0, 1 - 0.1 * props.position, 0)}
			Event={{
				MouseButton1Down: props.onClick,
			}}
		/>
	);
}
