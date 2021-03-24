/**
 * Cesium 自适应加载影像图层
 * @params Cesium  
 * @params [optional]
 * google -> bing -> gaode -> null
 * how to use:  layer = await new AdjustCesiumImgLayer(Cesium).init()
 */

let CesiumToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjY2JmMDBkNy1lMmU2LTRmYTEtYjEwYS03NDliMTdlYzkzZTIiLCJpZCI6NDUwMTYsImlhdCI6MTYxNDY2NzE2MH0.KdNWA62Ll4IKWcZt5C0eQUg_7Z35Dc9SnilnIoGimKI';
let CesiumTokenUrl =
  `https://api.cesium.com/v1/assets/2/endpoint?access_token=${CesiumToken}`;
let BingKey =
  'AmXdbd8UeUJtaRSn7yVwyXgQlBBUqliLbHpgn2c76DfuHwAXfRrgS5qwfHU6Rhm8';
let BingJsonpUrl =
  `https://dev.virtualearth.net/REST/v1/Imagery/Metadata/Aerial?jsonp=loadJsonp859530&incl=ImageryProviders&key=${BingKey}`;


export default class AdjustCesiumImgLayer {
  constructor(Cesium) {
    this._layer = null;
    this.Cesium = Cesium;
  }

  get layer() {
    try {
      if (this._layer) {
        return this._layer;
      }
      throw 'layer is invalid';
    } catch (error) {
      console.error(error);
      return false
    }
  }
  set layer(val) {
    this._layer = val;
    return true;
  }
  async fetchGoogle() {
    try {
      const urls = [0, 1, 2, 3].map(v =>
        `https://mt${v}.google.cn/maps/vt?lyrs=s%40189&gl=cn&x=1&y=0&z=1`);
      const fetchs = urls.map(v => fetch(v));
      const promise = await Promise.race([
        new Promise(res => {
          setTimeout(res, 4000)
        }),
        ...fetchs
      ]);
      return (promise === undefined || (promise && promise.status !== 200)) ?
        false : true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  async fetchBing() {
    try {
      const urls = [0, 1, 2, 3].map(v =>
        `https://ecn.t${v}.tiles.virtualearth.net/tiles/a0.jpeg?g=980`);
      const fetchs = urls.map(v => fetch(v));
      const promise = await Promise.race([
        new Promise(res => {
          setTimeout(res, 4000)
        }),
        ...fetchs
      ]);

      const makes = [
        await fetch(BingJsonpUrl),
        await fetch(CesiumTokenUrl)
      ];
      const cancel = makes.some(v => v.status !== 200);

      return (promise === undefined || (promise && promise.status !==
          200) || cancel) ?
        false : true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  async fetchGaode() {
    try {
      const urls = [1, 2, 3, 4].map(v =>
        `https://webst0${v}.is.autonavi.com/appmaptile?style=6&x=0&y=0&z=1`);
      const fetchs = urls.map(v => fetch(v));
      const promise = await Promise.race([
        new Promise(res => {
          setTimeout(res, 4000)
        }),
        ...fetchs
      ]);
      return (promise === undefined || (promise && promise.status !== 200)) ?
        false : true;
    } catch (error) {
      console.error(error)
      return false;
    }
  }
  async fetchToken() {
    let res = await fetch('https://map.airlook.com/open/auth/api/service/token/bing');
    res = await res.json();
    if (res.code === 200) {
      CesiumToken = res.data.token;
      CesiumTokenUrl = `https://api.cesium.com/v1/assets/2/endpoint?access_token=${CesiumToken}`;
    }
    res = await fetch(CesiumTokenUrl);
    res = await res.json();
    res.options && res.options.key && (BingKey = res.options.key);
  }
  async init() {
    const Cesium = this.Cesium;
    try {
      await this.fetchToken();
    } catch (error) {}
    
    // if (await this.fetchGoogle()) {
    //   const url =
    //     'https://{s}.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}';
    //   this._layer = new Cesium.UrlTemplateImageryProvider({
    //     id: 'google_image',
    //     name: '谷歌影像',
    //     url: url,
    //     tilingScheme: new Cesium.WebMercatorTilingScheme(),
    //     maximumLevel: 20,
    //     subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    //   });
    //   console.log('fetchGoogle');
    //   return this._layer;
    // } else 
    
    if (await this.fetchBing()) {
      Cesium.Ion.defaultAccessToken = CesiumToken;
      this._layer = Cesium.createWorldImagery({
        style: Cesium.IonWorldImageryStyle.AERIAL,
      });
      console.log('fetchBing');
      return this._layer;
    } else if (await this.fetchGaode()) {
      const url =
        "https://{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}";
      this._layer = new Cesium.UrlTemplateImageryProvider({
        url: url,
        layer: "tdtVecBasicLayer",
        style: "default",
        format: "image/png",
        tileMatrixSetID: "GoogleMapsCompatible",
        maximumLevel: 15, // > 15 多处显示无影像
        subdomains: ['webst01', 'webst02', 'webst03', 'webst04']
      });
      console.log('fetchGaode');
      return this._layer;
    }
    return undefined;
  }
}