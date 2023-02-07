import Roact from "@rbxts/roact";
import { getModel } from "shared/utils";

interface ModelViewportFrameState {
	ref: Roact.Ref<ViewportFrame>;
	lastModel: string | number | undefined;
}

interface ModelViewportFrameProps {
	ViewportModel: string | number;
	BorderSizePixel: number;
	Size: UDim2;
	BackgroundColor3: Color3;
	Position: UDim2;
	onMouseEnter?: (rbx: ViewportFrame, x: number, y: number) => void;
	onMouseLeave?: (rbx: ViewportFrame, x: number, y: number) => void;
}

export class ModelViewportFrame extends Roact.PureComponent<ModelViewportFrameProps, ModelViewportFrameState> {
	private mouseHovering: boolean;
	private itemModelClone: Model | undefined;

	constructor(props: ModelViewportFrameProps) {
		super(props);

		this.state = {
			ref: Roact.createRef<ViewportFrame>(),
			lastModel: undefined,
		};
		this.mouseHovering = false;
	}

	private updateViewportFrame() {
		print(`Updating viewport ${this.props.ViewportModel}`);
		const viewportFrame = this.state.ref.getValue();
		if (viewportFrame === undefined) return;

		viewportFrame.FindFirstChild("ViewportElements")?.Destroy();

		const folder = new Instance("Folder");
		folder.Name = "ViewportElements";
		folder.Parent = viewportFrame;

		const itemModelClone = getModel(this.props.ViewportModel)?.Clone();
		this.itemModelClone = itemModelClone;
		if (itemModelClone === undefined) return;
		itemModelClone.Parent = folder;

		const camera = new Instance("Camera");
		camera.CFrame =
			(itemModelClone.FindFirstChild("Camera") as CFrameValue | undefined)?.Value ||
			(viewportFrame.FindFirstChild("Camera") as Camera | undefined)?.CFrame ||
			new CFrame(new Vector3(0, 0, 20));
		camera.Parent = folder;
		viewportFrame.CurrentCamera = camera;
		this.setState({ lastModel: this.props.ViewportModel });
	}

	public didMount(): void {
		this.updateViewportFrame();
	}

	public didUpdate(): void {
		if (this.props.ViewportModel !== this.state.lastModel) {
			this.updateViewportFrame();
		}
	}

	public willUnmount(): void {
		this.mouseHovering = false;
	}

	private toggleMouseHovering(rbx: ViewportFrame, x: number, y: number) {
		this.mouseHovering = !this.mouseHovering;
		if (this.mouseHovering) {
			spawn(() => {
				while (this.mouseHovering) {
					wait(0.25);
					this.itemModelClone?.PivotTo(
						this.itemModelClone
							.GetPivot()
							.ToWorldSpace(CFrame.Angles(math.rad(10), math.rad(10), math.rad(10))),
					);
				}
			});
			if (this.props.onMouseEnter) this.props.onMouseEnter(rbx, x, y);
		} else if (this.props.onMouseLeave) {
			this.props.onMouseLeave(rbx, x, y);
		}
	}

	public render() {
		return (
			<viewportframe
				Ref={this.state.ref}
				BorderSizePixel={this.props.BorderSizePixel}
				Size={this.props.Size}
				BackgroundColor3={this.props.BackgroundColor3}
				Position={this.props.Position}
				Event={{
					MouseEnter: (...args) => this.toggleMouseHovering(...args),
					MouseLeave: (...args) => this.toggleMouseHovering(...args),
				}}
			>
				{this.props[Roact.Children]}
			</viewportframe>
		);
	}
}
