type GSTransfrom = {
    force3D?: string
    perspective?: number
    rotation?: number
    rotationX?: number
    rotationY?: number
    scaleX?: number
    scaleY?: number
    scaleZ?: number
    skewType?: string
    skewX?: number
    skewY?: number
    svg?: boolean
    x?: number
    xOrigin?: number
    xPercent?: number
    xOffset?: number
    y?: number
    yOrigin?: number
    yPercent?: number
    yOffset?: number
    z?: number
    zOrigin?: number
}
interface HTMLElement {
    _gsTransform?: GSTransfrom
}

interface SVGElement {
    _gsTransform?: GSTransfrom
}

type GetProps<C> = C extends React.ComponentType<infer P> ? P : never;

type Shared<
    InjectedProps,
    DecorationTargetProps
    > = {
        [P in Extract<keyof InjectedProps, keyof DecorationTargetProps>]?: InjectedProps[P] extends DecorationTargetProps[P] ? DecorationTargetProps[P] : never;
    };

type Matching<InjectedProps, DecorationTargetProps> = {
    [P in keyof DecorationTargetProps]: P extends keyof InjectedProps
    ? InjectedProps[P] extends DecorationTargetProps[P]
    ? DecorationTargetProps[P]
    : InjectedProps[P]
    : DecorationTargetProps[P];
};