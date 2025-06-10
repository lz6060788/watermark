### 这一款水印插件

能够通过简单的配置完成一些简单水印的覆盖。



### 安装

```bash
npm i @irises/watermark
```



### 使用

该插件导出了对应的参数类型

```typescript
import { Watermark } from '@irises/watermark';

const instance1 = Watermark.mount({ container: '#app' });
// 或者
const instance2 = new Watermark({ container: '#app' });
instance2.mount();

// 销毁
instance1.unmount()
instance2.unmount()
```

