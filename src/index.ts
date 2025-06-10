type WatermarkCanvas = {
  watermarkText: string;
  watermarkCanvasHeight?: number;
  watermarkCanvasWidth?: number;
  watermarkFont?: string;
  watermarkColor?: string;
  watermarkOpacity?: number;
  watermarkRotate?: number;
}

type WatermarkOptions = {
  container?: string |  HTMLElement;
  image?: string | WatermarkCanvas;
  text?: string;
  style?: string | Record<string, string>;
}

const DEFAULT_OPTIONS: WatermarkOptions = {
  image: {
    watermarkText: new Date().toLocaleString(),
  },
}

export const  defaultStyle: Record<string, string> = {
  'pointer-events': 'none',
  'width': '100%',
  'height': '100%',
  'top': '0px',
  'left': '0px',
  'position': 'absolute',
  'background-position': 'right top',
  'background-size': 'initial',
  'background-repeat': 'initial',
  'background-attachment': 'initial',
  'background-origin': 'initial',
  'background-clip': 'initial',
  'background-color': 'transparent !important',
  'display': 'block',
  'z-index': '100000',
}

export class Watermark {
  options = {} as WatermarkOptions;
  container: HTMLElement | null;
  watermark: HTMLElement | null;
  watermarkObserver: MutationObserver | null;
  containerObserver: MutationObserver | null;
  constructor(options?: WatermarkOptions) {
    this.options = JSON.parse(JSON.stringify(DEFAULT_OPTIONS));
    this.container = null;
    this.watermark = null;
    this.watermarkObserver = null;
    this.containerObserver = null;
    this.init(options)
  }

  init (options: WatermarkOptions = {}) {
    this.options = this._mergeOptions(options);

    if (this.watermark && this.container) {
      this.container.removeChild(this.watermark);
    }
    this.container = options.container
      ? typeof options.container === 'string'
        ? document.querySelector(options.container) || document.body
        : options.container
      : document.body;

    this.watermark = document.createElement('div');
    this.watermark.style.cssText = this._mergedStyleText;
    this.watermarkObserver = this._styleObserve();
    this.containerObserver = this._removeObserve();
  }

  mount () {
    if (!this.container || !this.watermark) {
      console.warn('容器元素或挂载元素不存在，挂在失败');
      return;
    }
    this.container.appendChild(this.watermark)
  }

  static mount(options?: WatermarkOptions) {
    const instance = new Watermark(options);
    instance.mount();
    return instance;
  }

  get _mergedStyle () {
    const { style, image } = this.options;
    if (!style && !image) {
      return defaultStyle;
    }
    const imageStyle = image
      ? typeof image === 'string'
        ? { 'background-image': `url(${image})` }
        : this._renderImageStyle(image)
      : {};
    if (!style) {
      return Object.assign({}, defaultStyle, imageStyle);
    }
    if (typeof style === 'string') {
      const userStyles = style?.split(';').reduce((acc, styleItem) => {
        const [key, value] = styleItem.split(':').map(s => s.trim());
        if (key && value) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string>);

      return Object.assign({}, defaultStyle, userStyles, imageStyle);
    } else {
      return Object.assign({}, defaultStyle, style, imageStyle);
    }
  }

  get _mergedStyleText () {
    const style = this._mergedStyle;
    return Object.keys(style).map(key => `${key}: ${style[key]}`).join(';');
  }

  _mergeOptions (userOptions: WatermarkOptions = {}) {
    const isObject = (obj: any) => obj && typeof obj === 'object' && !Array.isArray(obj);

    const deepMerge = (target: any, source: any): any => {
      if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
          if (isObject(source[key])) {
            if (!target[key]) {
              target[key] = source[key];
            }
            deepMerge(target[key], source[key]);
          } else {
            target[key] = source[key];
          }
        });
      }
      return target;
    };

    return deepMerge(this.options, userOptions);
  }

  _renderImageStyle (image: WatermarkCanvas) {
    const { watermarkText, watermarkFont, watermarkColor, watermarkOpacity, watermarkRotate, watermarkCanvasHeight, watermarkCanvasWidth } =image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const width = watermarkCanvasWidth || 200;
      const height = watermarkCanvasHeight || 200;
      canvas.width = width;
      canvas.height = height;

      ctx.fillStyle = watermarkColor || 'rgba(0, 0, 0, 0.3)';
      ctx.font = watermarkFont || '16px sans-serif';
      ctx.globalAlpha = watermarkOpacity || 0.5;
      ctx.rotate((watermarkRotate || -30) * Math.PI / 180);
      ctx.fillText(watermarkText, 0, height / 2);

      const dataURI = canvas.toDataURL();
      canvas.remove();
      return { 'background-image': `url(${dataURI})` };
    } else {
      canvas.remove();
      return {};
    }
  }

  _styleObserve () {
    if (!this.watermark) return null;
    const self = this;
    const observer = new MutationObserver(function(mutations) {
      observer.disconnect();
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          self.watermark!.style.cssText = self._mergedStyleText;
        }
        if (mutation.attributeName === 'class') {
          self.watermark!.className = '';
        }
        if (mutation.attributeName === 'id') {
          self.watermark!.id = '';
        }
      });
      observer.observe(self.watermark!, config);
    });
    // 配置观察选项
    const config = {
      attributes: true,
      attributeFilter: ['style', 'class', 'id'],
    };
    // 开始观察目标节点
    observer.observe(this.watermark, config);
    return observer;
  }

  _removeObserve() {
    if (!this.container) return null;
    const self = this;
    const observer = new MutationObserver(function(mutations) {
      observer.disconnect();
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && !self.container!.contains(self.watermark)) {
          self.mount();
        }
      });
      observer.observe(self.container!, config);
    });
    // 配置观察选项
    const config = {
      childList: true, // 监听子节点变化
      subtree: false
    };
    // 开始观察目标节点
    observer.observe(this.container, config);
    return observer;
  }

  unmount() {
    if (this.watermark && this.watermark.parentNode) {
      this.watermark.parentNode.removeChild(this.watermark);
    }
    if (this.watermarkObserver) {
      this.watermarkObserver.disconnect();
      this.watermarkObserver = null;
    }
    if (this.containerObserver) {
      this.containerObserver.disconnect();
      this.containerObserver = null;
    }
    this.watermark = null;
  }
}
