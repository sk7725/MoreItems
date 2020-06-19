this.global.MoreItems={};
this.global.MoreItems.itemprops={};
this.global.ItemObj={};

this.global.MoreItems.itemprops.alloys = ["metal","alloy","brass","electrum","rosegold","ferro","cast","steel","soldered","terne","amalgam"];
this.global.MoreItems.itemprops.metals = ["aluminium","beryllium","bismuth","chromium","cobalt","copper","gallium","gold","indium","iron","lead","magnesium","mercury","nickel","plutonium","potassium","platinum","rhodium","samarium","scandium","silver","sodium","titanium","tin","uranium","zinc"];
this.global.MoreItems.itemprops.hard = ["stone","mineral","ore","metaglass","dense"];
this.global.MoreItems.itemprops.nonmetals = ["oxide"];
this.global.MoreItems.itemprops.soft = ["spore","silicon"];
this.global.MoreItems.itemprops.sharp = ["glass","steel"];
this.global.MoreItems.itemprops.carbon = ["carbon","coal","thane","propane","butane","diamond","graphite","carbide","plastic","plastanium","oil","phenol","graphene","fullerene"];
this.global.MoreItems.itemprops.wood = ["log","wood","tree","book"];
this.global.MoreItems.itemprops.fabric = ["fabric","nylon","string","cloth"];
this.global.MoreItems.itemprops.electric = ["silicon","surge","computer","circuit","conductor"];
this.global.MoreItems.itemprops.radioactive = ["cesium","cobalt","iodine","plutonium","radium","radon","strontium","thorium","uranium","radioactive"];
this.global.MoreItems.itemprops.data = ["surge","quantum","scalar","vector","tensor","intelli","byte","bittrium","source","code","terminal","hash","heap","binary","variable","constant","advance","pixellium","zeta"];
this.global.MoreItems.itemprops.bullet = ["bullet","shot","shell","explosive","blast","missile","doom"];
this.global.MoreItems.itemprops.processed = ["rod","chiseled","brick","pellet","dust"];
this.global.MoreItems.itemprops.manufactured = ["plate","wire","gear","bolt","nut"];
this.global.MoreItems.itemprops.flammable = [];
this.global.MoreItems.itemprops.explosive = [];

var t = this;

function mergeProp(from, to){
  from = t.global.MoreItems.itemprops[from];
  for(var i=0;i<from.length;i++){
    t.global.MoreItems.itemprops[to].push(from[i]);
  }
}

mergeProp("alloys", "metals");
mergeProp("metals", "hard");
mergeProp("wood", "carbon");
mergeProp("fabric", "processed");

function addProp(it, propname){
  if(t.global.ItemObj[it.name].indexOf(propname)>-1) return;
  t.global.ItemObj[it.name].push(propname);
  it.description+=(t.global.ItemObj[it.name].length==1)?Core.bundle.get("itemprops."+propname)||(", "+Core.bundle.get("itemprops."+propname));
}

function addProps(it){
  t.global.ItemObj[it.name]=[];
  it.description+="\n\n"+Core.bundle.get("itemprops.unit") + " [accent]";
  var props = t.global.MoreItems.itemprops;
  var arr = Object.keys(props);
  for(var i=0;i<arr.length;i++){
    if(arr[i]=="flammable"&&it.flammability>0) addProp(it, arr[i]);
    else if(arr[i]=="explosive"&&it.explosiveness>0) addProp(it, arr[i]);
    else if(arr[i]=="radioactive"&&(it.radioactivity>0||it.name.includes(props[arr[i]]))) addProp(it, arr[i]);
    else if(arr[i]=="nonmetals"&&(!it.name.includes(props["metals"]))) addProp(it, arr[i]);
    else if(it.name.includes(props[arr[i]])) addProp(it, arr[i]);
  }
  it.description += (t.global.ItemObj[it.name].length==0)?"[]None":"[]";
  it.trait = t.global.ItemObj[it.name];
}

this.global.MoreItems.addItemProps = addProps;