## Cesium 自适应加载影像图层

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