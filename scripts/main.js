
if(typeof(PixmapTextureData1) == "undefined"){
  const PixmapTextureData1 = Packages.arc.graphics.gl.PixmapTextureData;
}

const res={};

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
					pixel.mul(color);
					pixel.a *= color.a; // For ghost items :o
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
	}
};
res.Item.type = ItemType.material;

function addItemForm(pitem, type, form, brightOffset){
  var itemDef = Object.create(res.Item);

  if(!type) type = "resource";
  type = ItemType[type];

  itemDef.type = type;
  itemDef.mask = "moreitems-"+form;

  var item = extendContent(Item, pitem.name+"-itemform-"+form, itemDef);
  item.color = pitem.color.cpy().add(brightOffset, brightOffset, brightOffset);
	item.type = itemDef.type;

  item.localizedName = pitem.localizedName +" "+ Core.bundle.get("itemform." + form + ".name");
  item.explosiveness = pitem.explosiveness;
  item.flammability = pitem.flammability;
  item.radioactivity = pitem.radioactivity;
  item.hardness = pitem.hardness;
  item.load();
  print("Add item:"+item.name);
}


Events.on(EventType.ContentReloadEvent, run(() => {
  print("Init!");
  Vars.content.items().each(cons(it=>{
    //print("Iter:"+it.name+"/"+it.minfo.mod+(it.minfo.mod!=null)?("/"+it.minfo.mod.meta.name):"");
    if(!it.name.includes("-itemform-")){
      addItemForm(it, "resource", "pieces", -0.04);
      addItemForm(it, "material", "rod", 0.04);
    }
  }));
}));
