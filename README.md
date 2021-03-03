## Cesium 自适应加载影像图层

自适应网络状况加载影像 （顺序： 谷歌 -> 必应 -> 高德 -> null)

## how to use:  

```javascript
import AdjustCesiumImgLayer from 'adjust-cesium-img-layer';

async () => {
	const layer = await new AdjustCesiumImgLayer(Cesium).init();
	if(layer) {
		// ...
		// viewer.imageryLayers.addImageryProvider(layer);

	}
}

```