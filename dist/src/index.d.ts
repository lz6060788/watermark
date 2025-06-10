type WatermarkCanvas = {
    watermarkText: string;
    watermarkCanvasHeight?: number;
    watermarkCanvasWidth?: number;
    watermarkFont?: string;
    watermarkColor?: string;
    watermarkOpacity?: number;
    watermarkRotate?: number;
};
type WatermarkOptions = {
    container?: string | HTMLElement;
    image?: string | WatermarkCanvas;
    text?: string;
    style?: string | Record<string, string>;
};
export declare const defaultStyle: Record<string, string>;
export declare class Watermark {
    options: WatermarkOptions;
    container: HTMLElement | null;
    watermark: HTMLElement | null;
    watermarkObserver: MutationObserver | null;
    containerObserver: MutationObserver | null;
    constructor(options?: WatermarkOptions);
    init(options?: WatermarkOptions): void;
    mount(): void;
    static mount(options?: WatermarkOptions): Watermark;
    get _mergedStyle(): Record<string, string>;
    get _mergedStyleText(): string;
    _mergeOptions(userOptions?: WatermarkOptions): any;
    _renderImageStyle(image: WatermarkCanvas): {
        'background-image': string;
    } | {
        'background-image'?: undefined;
    };
    _styleObserve(): MutationObserver | null;
    _removeObserve(): MutationObserver | null;
    unmount(): void;
}
export {};
