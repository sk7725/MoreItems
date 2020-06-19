this.global.MoreItems={};
this.global.MoreItems.itemprops={};
this.global.ItemObj={};

this.global.MoreItems.itemprops.metals = ["aluminium","beryllium","bismuth","chromium","cobalt","copper","gallium","gold","indium","iron","lanthanum","lead","magnesium","mercury","nickel","plutonium","potassium","platinum","rhodium","samarium","scandium","silver","sodium","titanium","tin","thorium","scrap","uranium","zinc"];
this.global.MoreItems.itemprops.nonmetals = ["oxide"];

this.global.MoreItems.itemprops.hard = ["mineral","-ore","metaglass","dense"];
this.global.MoreItems.itemprops.soft = ["spore","silicon","soft"];
this.global.MoreItems.itemprops.sharp = ["glass","steel","sharp"];
this.global.MoreItems.itemprops.blunt = ["brass","copper","lead","mercury","lithium","oxide","blunt"];
this.global.MoreItems.itemprops.beauty = ["diamond","ruby","gem","emerald","sapphire","rose"];

this.global.MoreItems.itemprops.alloys = ["metal","alloy","brass","electrum","rosegold","ferro","cast","steel","soldered","terne","amalgam"];
this.global.MoreItems.itemprops.carbon = ["carbon","coal","thane","propane","butane","diamond","graphite","carbide","plastic","plastanium","oil","phenol","graphene","fullerene"];
this.global.MoreItems.itemprops.wood = ["log","wood","tree"];
this.global.MoreItems.itemprops.stone = ["stone","rock","brick","site"];
this.global.MoreItems.itemprops.glass = ["glass"];
this.global.MoreItems.itemprops.plastic = ["plastic","plastanium","-pet","foam"];
this.global.MoreItems.itemprops.paper = ["paper","pulp","book"];
this.global.MoreItems.itemprops.fabric = ["fabric","nylon","string","cloth","mass"];
this.global.MoreItems.itemprops.electric = ["silicon","surge","computer","circuit","conductor","lanthanum"];
this.global.MoreItems.itemprops.biological = ["spore","critter","bug","animal","food","alcohol","glucose","fatty","glycer","amino","acid"];

this.global.MoreItems.itemprops.bullet = ["bullet","shot","shell","gun","shoot"];
this.global.MoreItems.itemprops.bomb = ["bomb","boom","grenade","explosive","blast","missile","doom"];

this.global.MoreItems.itemprops.explosive = [];
this.global.MoreItems.itemprops.flammable = [];
this.global.MoreItems.itemprops.radioactive = ["cesium","cobalt","iodine","plutonium","radium","radon","strontium","thorium","uranium","radioactive"];

this.global.MoreItems.itemprops.energy = ["pyratite","cell","power","energy","space"];
this.global.MoreItems.itemprops.matter = ["t-time","dark-matter","light-matter","antimatter","anti-","bittrium","time","pixel"];
this.global.MoreItems.itemprops.data = ["surge","quantum","scalar","vector","tensor","intelli","byte","bittrium","source","code","terminal","hash","heap","binary","variable","constant","advance","pixellium","zeta","redblack","infiar","matrix"];
this.global.MoreItems.itemprops.ohno = ["ohno","anuke","sk7725","test"];
this.global.MoreItems.itemprops.trash = ["scrap","itemform-pieces","gdeft"];

this.global.MoreItems.itemprops.processed = ["rod","chiseled","brick","pellet","itemform-dust"];
this.global.MoreItems.itemprops.manufactured = ["plate","wire","gear","bolt","nut"];


var t = this;

function mergeProp(from, to){
  from = t.global.MoreItems.itemprops[from];
  for(var i=0;i<from.length;i++){
    t.global.MoreItems.itemprops[to].push(from[i]);
  }
}

mergeProp("alloys", "metals");
mergeProp("radioactive", "metals");
mergeProp("metals", "hard");
mergeProp("stone", "hard");
mergeProp("wood", "carbon");
mergeProp("fabric", "processed");
mergeProp("paper", "processed");
mergeProp("paper", "wood");

function hasString(str, a, it){
  var modname = (it.minfo.mod != null)?it.minfo.mod.meta.name:"";
  try{
    if(str.includes("itemform")) modname = it.getMod();
  }
  catch(err){}

  if(modname != ""){
    str = str.substring(modname.length, str.length);
  }
  for(var i=0;i<a.length;i++){
    if(str.includes(a[i])) return true;
  }
  return false;
}

function addProp(it, propname){
  if(t.global.ItemObj[it.name].indexOf(propname)>-1) return;
  t.global.ItemObj[it.name].push(propname);
  it.description+=(t.global.ItemObj[it.name].length==1)?Core.bundle.get("itemprops."+propname+".name"):(", "+Core.bundle.get("itemprops."+propname+".name"));
}

function addProps(it){
  t.global.ItemObj[it.name]=[];
  var index = (it.description)?it.description.indexOf("\n"+Core.bundle.get("itemprops.unit") + " [lightgray]"):-1;
  if(index>-1){
    it.description = it.description.substring(0, index);
  }
  it.description+="\n"+Core.bundle.get("itemprops.unit") + " [lightgray]";
  var props = t.global.MoreItems.itemprops;
  var arr = Object.keys(props);
  for(var i=0;i<arr.length;i++){
    if(arr[i]=="flammable"&&it.flammability>0.05) addProp(it, arr[i]);
    else if(arr[i]=="explosive"&&it.explosiveness>0.05) addProp(it, arr[i]);
    else if(arr[i]=="radioactive"&&(it.radioactivity>0.05||hasString(it.name, props[arr[i]], it))) addProp(it, arr[i]);
    else if(arr[i]=="nonmetals"&&(!hasString(it.name, props["metals"], it))) addProp(it, arr[i]);
    else if(hasString(it.name, props[arr[i]], it)) addProp(it, arr[i]);
  }
  it.description += (t.global.ItemObj[it.name].length==0)?("[]"+Core.bundle.get("itemprops.none")):"[]";
  try{
    it.setTrait(t.global.ItemObj[it.name]);
  }
  catch(err){}
}

this.global.MoreItems.addItemProps = addProps;
