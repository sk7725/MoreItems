require("props");

const root = [
  {
    name:"pieces",
    type:"resource",
    colorGlow:-0.04,
    statScale:0
  },
  {
    name:"rod",
    type:"material",
    colorGlow:0.08,
    statScale:0.9,
    whitelistType:"material"
  },
  {
    name:"plate",
    type:"material",
    colorGlow:0.12,
    statScale:0.5,
    whitelistType:"material"
  },
  {
    name:"wire",
    type:"material",
    colorGlow:0.2,
    statScale:0,
    whitelistType:"material"
  },
  {
    name:"dust",
    type:"resource",
    colorGlow:0.14,
    statScale:1.5,
    whitelistType:"resource"
  }
];


if(typeof(PixmapTextureData1) == "undefined"){
  const PixmapTextureData1 = Packages.arc.graphics.gl.PixmapTextureData;
}

const tolerance = 0.01;

const res={};

//Credits to DeltaNedas, modified to make it load after all mods&&not mask colored pixels.
res.masks = {};
res.Item = {
	setTexture(pixmap) {
		this.pixmap = pixmap;
		const texture = new Texture(new PixmapTextureData1(pixmap, null, true, false, true));
		const item = this;
		Core.app.post(run(() => {
			item.region = Core.atlas.addRegion(this.name, new TextureRegion(texture))
		}));
	},
	getTexture() {
		return this.pixmap;
	},
	load(){
		// Colorize the mask with this.color.
		const color = this.color;
		var mask = res.masks[this.mask];
		if(mask === undefined){ // Cache mask textures to save cpu
			mask = Core.atlas.getPixmap(this.mask);
			res.masks[this.mask] = mask;
		}

		// Actually colour the mask, pixel by pixel
		var newTexture = new Pixmap(32, 32);
		var pixel = new Color(), x, y;
		for(x = 0; x < 32; x++){
			for(y = 0; y < 32; y++){
				pixel.set(mask.getPixel(x, y));
				if(pixel.a > 0){
          if(Mathf.equal(pixel.r, pixel.g, tolerance)&&Mathf.equal(pixel.b, pixel.g, tolerance)&&Mathf.equal(pixel.r, pixel.b, tolerance)){
            pixel.mul(color);
  					pixel.a *= color.a; // For ghost items :o
          }
					newTexture.draw(x, y, pixel);
				}
			}
		}

		if (this.layers) {
			var layers = [];
			for (var i in this.layers) {
				layers[i] = Core.atlas.getPixmap(this.layers[i]);
			}

			var lPix = new Color();
			for (x = 0; x < 32; x++) {
				for (y = 0; y < 32; y++) {
					pixel.set(newTexture.getPixel(x, y));
					for (i in layers) {
						if (pixel.a < 1) {
							lPix.set(layers[i].getPixel(x, y));
							pixel.add(lPix);
							pixel.a += lPix.a;
						}
					}
					newTexture.draw(x, y, pixel);
				}
			}
		}
		// Store it as the items icon
		this.setTexture(newTexture);
	},

	icon(icon){
		return this.region;
	},
  _trait:[],
  setTrait(t){
    this._trait = t;
  },
  getTrait(){
    return this._trait;
  },
  _pomd:"",
  _pmodcore:"",
  setMod(a){
    this._pmod = a;
  },
  setModCore(a){
    this._pmodcore = a;
  },
  getMod(){
    return this._pmodcore;
  },
  displayDescription(){
    return (this._pmod == ""||this.pmod === undefined||this.pmod === null)?this.description:(this.description +"\n"+ Core.bundle.format("mod.display", this._pmod));
  }
};
res.Item.type = ItemType.material;

function addItemForm(pitem, type, form, brightOffset, statScale){
  if(Vars.content.getByName(ContentType.item, pitem.name+"-itemform-"+form)){
    print("Already:"+pitem.name+"-itemform-"+form);
    var item = Vars.content.getByName(ContentType.item, pitem.name+"-itemform-"+form);
    print("Item Debug:\n"+"ID: "+item.id+"\nName: "+item.name);
    return;
  }
  try{
    var itemDef = Object.create(res.Item);

    if(!type) type = "resource";
    type = ItemType[type];

    itemDef.type = type;
    itemDef.mask = "moreitems-"+form;

    var item = extendContent(Item, pitem.name+"-itemform-"+form, itemDef);
    item.color = pitem.color.cpy().add(brightOffset, brightOffset, brightOffset);
  	item.type = itemDef.type;

    item.localizedName = pitem.localizedName +" "+ Core.bundle.get("itemform." + form + ".name");
    item.explosiveness = pitem.explosiveness*statScale;
    item.flammability = pitem.flammability*statScale;
    item.radioactivity = pitem.radioactivity*statScale;
    item.hardness = pitem.hardness;
    item.description = Core.bundle.format("itemform." + form + ".description", pitem.localizedName);
    if(pitem.minfo.mod != null){
      item.setMod(pitem.minfo.mod.meta.displayName());
      item.setModCore(pitem.minfo.mod.meta.name);
    }
    item.load();
    item.minfo.mod = Vars.mods.locateMod("moreitems");
    print("Add item:"+item.name);
    print("Item Debug:\n"+"ID: "+item.id+"\nName: "+item.name);
  }
  catch(err){
    print(err);
  }
}

function addItemForms(it, i){
  if(!it.name.includes("-itemform-")){
    if(root[i].hasOwnProperty("whitelistType")&&ItemType[root[i].whitelistType]!=it.type) return;
    addItemForm(it, root[i].type, root[i].name, root[i].colorGlow, root[i].statScale);
  }
}

var t = this;

function addItemRoot(){
  for(var i=0;i<root.length;i++){
    Vars.content.items().each(cons(it=>{
      addItemForms(it, i);
    }));
  }
  Vars.content.items().each(cons(it=>{
    t.global.MoreItems.addItemProps(it);
  }));
  Vars.content.init();
  Vars.content.load();
  Vars.data.load();
}

Events.on(EventType.ContentReloadEvent, run(() => {
  print("Init ContentReload!");
  addItemRoot();
}));

Events.on(EventType.ClientLoadEvent, run(() => {
  print("Init Load!");
  addItemRoot();
}));
