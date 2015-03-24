var CONCONT;
var CONSOLE = false;
var PAGES = new Object();
var ACTPAGE;
var NACB;
var MEDKITB;
var ROCKETB;
var HIST = new Array();
var ACTHIST = 0;
var HISTACT = "";


function WrChange(cat, add){
	var ps = "";
	if (0 < add){
		ps = "+"
	}
	WrConsole(cat+": "+ps+add)
}

function Link(page, destNum, cond){
	this.page = page;
	this.destNum = destNum;
	this.cond = cond
	if (!cond){
		this.cond = function() {return true;};
	}
}
Link.prototype.render = function(){
}
Link.prototype.activate = function(){
	if (!this.tag){
		return;
	}
	if (IamAlive() && this.cond()){
		this.tag.className = "enabledlink";
		this.tag.addEventListener("click", function(){
			PAGES[this.innerHTML].start()
		});
	} else {
		this.tag.className = "forbiddenlink";
	}
}

function Page(num){
	this.num = num;
	PAGES[num] =  this;
	
	this.links = new Array();
	this.actions = new Array();
	this.actAction = -1;
}
Page.prototype.addLink = function(destNum, cond){
	this.links.push(new Link(this, destNum, cond));
}
Page.prototype.addAction = function(action, type){
	
	className="defaultAction";
	autoNext = true;
	if (type == 'fight'){
		autoNext = false;
	}
	act = {
		funct: action,
		cls: className,
		typ: type, 
		an: autoNext
	}
	this.actions.push(act);
}
Page.prototype.activateLinks = function(){
	for (i=0;i<this.links.length;++i){
		this.links[i].activate();
	}
}
Page.prototype.nextAction = function(){
	if (-1 < this.actAction){
		act = this.actions[this.actAction];
		act.marker.removeEventListener("click", next);
		act.marker.className += " doneAction";
	}
	++this.actAction;
	act = this.actions[this.actAction];
	if (this.actAction == this.actions.length){
		this.activateLinks();
		return;
	}
	NACB = function() {
		var act = ACTPAGE.actions[ACTPAGE.actAction];
		act.funct();
		if (act.an){
			ACTPAGE.nextAction();
		}
	};
	act = this.actions[this.actAction];
	act.marker.addEventListener("click", next);
	act.marker.className += " activeAction";
}
Page.prototype.render = function(){
	pageid = "p" + this.num;
    CONCONT.innerHTML = document.getElementById(pageid).innerHTML;
	CONCONT.scrollTop = 0;
	
	bs = CONCONT.getElementsByTagName("b");
	
	for (var i=0;i<this.links.length;++i){
		alink = this.links[i];
		for (var j=0;j<bs.length;++j){
			if (alink.destNum == bs[j].innerHTML){
				alink.tag = bs[j];
			}
		}		
		alink.render();
	}
	
	if (!this.actions.length){
		this.activateLinks();
		return;
	}
	
	as = CONCONT.getElementsByTagName("tag");
	
	for (var i=0;i<as.length;++i){
		actionmarker = as[i]
		actionmarker.innerHTML = "&nbsp;";
		actionmarker.className = this.actions[i].cls;
		this.actions[i].marker = actionmarker;
	}
	
	this.hms = CONCONT.getElementsByTagName("hp");
	this.hmind = 0;
	
	this.nextAction();
}
Page.prototype.start = function() {
	ACTPAGE = this;
	if (HISTACT == ""){
		histObj = {
			pagenum: ACTPAGE.num,
			cp: cp.Clone(),
			vp: vp.Clone()
		}
		if (ACTHIST != HIST.length){
			HIST = HIST.slice(0,ACTHIST+1)
		}
		HIST.push(histObj);
		ACTHIST = HIST.length-1;
	}
	HISTACT = "";
	this.actAction = -1;
	this.render();
	ClrConsole();
}
function loadHist(){
	histObj = HIST[ACTHIST];
	cp = histObj.cp.Clone();
	cp.Render();
	vp = histObj.vp.Clone();
	vp.Render();
	PAGES[histObj.pagenum].start();
}

function undo(){
	if (0 == ACTHIST){
		return;
	}
	HISTACT = "undo";
	ACTHIST--;
	loadHist();
}

function redo(){
	if (HIST.length-1 <= ACTHIST){
		return;
	}
	HISTACT = "redo";
	ACTHIST++;
	loadHist();
}

function dicehtml(d){
	return '<img src="imgs/d'+d+'.png" width="20" height="20"/>';
}

function dice()
{
	d = Math.floor((Math.random() * 6) + 1);
	WrConsole(dicehtml(d));
	return d;
}

function doubledice(){
	d1 = Math.floor((Math.random() * 6) + 1);
	d2 = Math.floor((Math.random() * 6) + 1);
	WrConsole(dicehtml(d1) + " " + dicehtml(d2));
	return d1 + d2;
}

function CharacterPage(){
	this.mdp = 0; //maximum dexterity
	this.dp = 0;//dexterity
	this.mhp = 0; //maximum health point
	this.hp = 0; //health point
	this.mlp = 0; //maximum luck
	this.lp = 0; //luck
	this.eq = new Array(); //equipment
	this.cr = 0; //credit
	this.mk = 0; //medkits
	this.memo = new Array(); //secret memories
}
CharacterPage.prototype.Render = function(add){
	document.getElementById("mdp").innerHTML = this.mdp;
	document.getElementById("dp").innerHTML = this.dp;
	document.getElementById("mhp").innerHTML = this.mhp;
	document.getElementById("hp").innerHTML = this.hp;
	document.getElementById("mlp").innerHTML = this.mlp;
	document.getElementById("lp").innerHTML = this.lp;
	document.getElementById("mk").innerHTML = this.mk;
	document.getElementById("cr").innerHTML = this.cr;
	
	if (this.eq.length){
		slist = this.eq[0];
		for (var i=1;i<this.eq.length;++i){
			slist += ", " + this.eq[i];
		}
	} else {
		slist = ""
	}
	document.getElementById("eq").innerHTML = slist;
	
}
CharacterPage.prototype.AddDP = function(add){
	this.dp += add;
	if (this.mdp < this.dp) {
		this.dp = this.mdp;
	}

	WrChange("Ügyesség", add);
	this.Render();
}
CharacterPage.prototype.AddHP = function(add){
	this.hp += add;
	if (this.mhp < this.hp) {
		this.hp = this.mhp;
	}
	WrChange("Életerő", add);
	this.Render();
}
CharacterPage.prototype.AddLP = function(add){
	this.lp += add;
	if (this.mlp < this.lp) {
		this.lp = this.mlp;
	}
	WrChange("Szerencse", add);
	this.Render();
}
CharacterPage.prototype.AddCR = function(add){
	this.cr += add;
	WrChange("Kredit", add);
	this.Render();
}
CharacterPage.prototype.AddMK = function(add){
	this.mk += add;
	WrChange("EÜ csomag: ", add);
	this.Render();
}
CharacterPage.prototype.UseMedkit = function(){
	if (this.mk <= 0){
		return
	}
	if (this.mhp <= this.hp){
		return;
	}	
	this.AddMK(-1);
	this.AddHP(4);
	this.Render();
}
CharacterPage.prototype.HasStuff = function(stuff){
	return this.eq.indexOf(stuff) != -1
}
CharacterPage.prototype.AddStuff = function(stuff){
	var i = this.eq.indexOf(stuff);
	if (i != -1){
		return;
	}
	this.eq.push(stuff);
	WrConsole("új cucc: "+stuff);
	this.Render();
}
CharacterPage.prototype.RemoveStuff = function(stuff){
	var i = this.eq.indexOf(stuff);
	if (i > -1){
		this.eq.splice(i,1)
	}
	this.Render()
}
CharacterPage.prototype.HasMemo = function(memo){
	return this.memo.indexOf(memo) != -1
}
CharacterPage.prototype.AddMemo = function(memo){
	var i = this.memo.indexOf(memo);
	if (i != -1){
		return;
	}
	this.memo.push(memo);
}
CharacterPage.prototype.Generate = function(){
	this.mdp = this.dp = dice() + 6;
	this.mhp = this.hp = doubledice() + 24;
	this.mlp = this.lp = dice() + 6;
	this.cr = 200;
	this.mk = 10;
	this.Render();
}
CharacterPage.prototype.Clone = function(){
	//this clone method is a shitty fuck ... pls help !
	ret = new CharacterPage();
	ret.mdp = this.mdp;
	ret.dp = this.dp;
	ret.mhp = this.mhp;
	ret.hp = this.hp;
	ret.mlp = this.mlp;
	ret.lp = this.lp;
	ret.eq = this.eq.slice();
	ret.cr = this.cr;
	ret.mk = this.mk;
	ret.memo = this.memo.slice();
	return ret;
}
var cp = new CharacterPage();

function VehiclePage(){
	this.mfp = 0; //maximum firepower
	this.fp = 0; //firepower
	this.map = 0; //maximum armor
	this.ap = 0; //armour
	this.ro = 0; //rockets
	this.in = 0; //iron needles
	this.oi = 0; //oil cans
	this.sw = 0; //spare wheel
	this.ga = 0; //gassoline cans
	this.mo = new Array(); //modifications
}
VehiclePage.prototype.Render = function(add){
	document.getElementById("mfp").innerHTML = this.mfp;
	document.getElementById("fp").innerHTML = this.fp;
	document.getElementById("map").innerHTML = this.map;
	document.getElementById("ap").innerHTML = this.ap;
	document.getElementById("ro").innerHTML = this.ro;
	document.getElementById("in").innerHTML = this.in;
	document.getElementById("oi").innerHTML = this.oi;
	document.getElementById("sw").innerHTML = this.sw;
	document.getElementById("ga").innerHTML = this.ga;
	
	if (this.mo.length){
		slist = this.mo[0];
		for (var i=1;i<this.mo.length;++i){
			slist += ", " + this.mo[i];
		}
	} else {
		slist = ""
	}
	document.getElementById("mo").innerHTML = slist;
}
VehiclePage.prototype.AddFP = function(add){
	this.fp += add;
	if (this.mfp < this.fp) {
		this.fp = this.mfp;
	}
	WrChange("Tűzerő", add);
	this.Render();
}
VehiclePage.prototype.AddAP = function(add){
	this.ap += add;
	if (this.map < this.ap) {
		this.ap = this.map;
	}
	WrChange("Páncélzat", add);
	this.Render();
}
VehiclePage.prototype.AddSW = function(add){
	this.sw += add;
	WrChange("Pótkerék", add);
	this.Render();
}
VehiclePage.prototype.AddGA = function(add){
	this.ga += add;
	WrChange("Kanna benzin", add);
	this.Render();
}
VehiclePage.prototype.AddRO = function(add){
	this.ro += add;
	WrChange("Rakéta", add);
	this.Render();
}
VehiclePage.prototype.HasMod = function(mod){
	return this.mo.indexOf(mod) != -1
}
VehiclePage.prototype.AddMod = function(mod){
	this.mo.push(mod);
	WrConsole("upgrade: "+mod);
	this.Render();
}
VehiclePage.prototype.Generate = function(){
	this.mfp = this.fp = dice() + 6;
	this.map = this.ap = doubledice() + 24;
	this.mk = 10;
	this.ro = 4; 
	this.in = 3;
	this.oi = 2; 
	this.sw = 2; 
	this.ga = 1;
	this.Render();
}
VehiclePage.prototype.Clone = function(){
	ret = new VehiclePage();
	ret.mfp = this.mfp;
	ret.fp = this.fp;
	ret.map = this.map;
	ret.ap = this.ap;
	ret.ro = this.ro;
	ret.in = this.in;
	ret.oi = this.oi; 
	ret.sw = this.sw; 
	ret.ga = this.ga; 
	ret.mo = this.mo.slice();
	
	return ret;
}

var vp = new VehiclePage();

function ClrConsole(){
	CONSOLE.innerHTML = '';
}

function WrConsole(message){
	if (!CONSOLE){
		return;
	}
	CONSOLE.innerHTML += message + '</br>';
	CONSOLE.scrollTop = CONSOLE.scrollHeight;
}

function Enemy(name, power, health){
	this.n = name;
	this.p = power;
	this.h = health;
	this.hurt = 0;
	this.hurtlimit = 0;
	this.hurtmod = 0;
	this.active = true;
}

function FightObj(type, enemies){
	this.type = type;
	this.enemies = enemies;
	this.target = 0;
	this.rounds = -1;
	this.roundLimit = 0;
	this.hurt = 0;
	this.hurtLimit = 0;
	this.powermod = 0;
	this.hurtmod = 0;
	this.hitcount = 0;
	this.win = false;
}

var ACTFIGHT;

function Fight(){
	
	var fobj = ACTFIGHT;
	
	fobj.rounds++;
	if (fobj.rounds == 0){
		WrConsole("harc kezdődik");
		
		if (fobj.type == "car"){
			ROCKETB.disabled = false;
		} else if (fobj.type == "gun" || fobj.type == "hand"){
			MEDKITB.disabled = true;
		}
		
		hm = CONCONT.getElementsByTagName("hp");
		
		for (var i=0;i<fobj.enemies.length;++i){
			var ahm = ACTPAGE.hms[ACTPAGE.hmind];
			en = fobj.enemies[i];
			en.hmark = ahm;
			++ACTPAGE.hmind;
		}
		NACB = Fight;
		return;
	}
	
	var myp = fobj.powermod;
	
	if (fobj.type == 'hand' || fobj.type == 'gun'){
		myp += cp.dp;
		if (fobj.type == 'gun' && cp.HasStuff("magnum")){
			myp += 1;
		}
	} else if (fobj.type == 'car' || fobj.type == 'bumpcar'){
		myp += vp.fp;
	}
	
	var end = false;
	
	for (var i=0;i<fobj.enemies.length;++i){
	
		var en = fobj.enemies[i];
		if (!en.active){
			continue;
		}		
		WrConsole("<br/><i>" + en.n + "</i> támadóereje:");
		var enp = en.p;
		var endice = doubledice();
		var enps = enp+endice;
		WrConsole( endice + " + " + enp + " = " + enps)
		WrConsole("Saját támadóerő:");
		var mydice = doubledice();
		var myps = myp+mydice;
		WrConsole( mydice + " + " + myp + " = " + myps)
		
		if (enps == myps){
			WrConsole("egál, senki se sérül");
		}
		else
		{
			if (enps < myps && i != fobj.target){
				WrConsole("nem talál el");
				continue;
			}
			
			if (enps < myps){
				WrConsole("Sikeres támadás!");
			} else {
				WrConsole("Eltalált!");
			}
			
			var hurt = 0;
			if (fobj.type == 'hand' || fobj.type == 'bumpcar'){
				hurt = 1;
			} else if (fobj.type == 'gun' || fobj.type == 'car'){
				WrConsole("Sebzés dobás:");
				hurt = dice();
			}
			
			if (enps < myps && i == fobj.target){
			
				hurt += fobj.hurtmod;
				en.hurt += hurt;
				en.h -= hurt;
				if (en.h < 0){
					en.h = 0;
				}
				
				en.hmark.innerHTML = en.h;
				WrConsole("Bevitt sérülés: " + hurt);
					
				if (en.h <= 0){
					WrConsole("Végeztél vele!");
					en.active = false;				
				}
				if (en.hurtlimit && en.hurtlimit <= en.hurt){
					WrConsole("Kiütötted!");
					en.active = false;
				}			
			} else {
				//enemy succes
				hurt += en.hurtmod;
				fobj.hurt += hurt;
				fobj.hitcount++;
				if (fobj.type == 'hand' || fobj.type == 'gun'){
					cp.AddHP(-hurt);
					if (cp.hp <= 0){
						WrConsole("Véged!");
						end = true;
						break;
					}
				} else if (fobj.type == 'car') {
					vp.AddAP(-hurt);
					if (vp.ap <= 0){
						WrConsole("Kilőttek!");
						end = true;
						break;
					}
				}
				if (fobj.hurtlimit && fobj.hurtlimit <= fobj.hurt){
					WrConsole("Kiütöttek!");
					end = true;
					break;
				}
			}
		}
	}
	
	if (0 < fobj.roundLimit && fobj.roundLimit <= fobj.rounds){
		WrConsole("Harc vége");
		end = true;
	}
	var actenemy = 0;
	var deadTarget = false;
	for (var i=0;i<fobj.enemies.length;++i){
		if (!fobj.enemies[i].active && fobj.target == i){
			deadTarget = true;
		}
		if (fobj.enemies[i].active){
			++actenemy;
		}
	}
	if (actenemy == 0){		
		WrConsole("Győzelem!");
		fobj.win = true;
		end = true;
	}
	
	if (end){
		if (fobj.type == "car"){
			ROCKETB.disabled = true;
		} else if (fobj.type == "gun" || fobj.type == "hand"){
			MEDKITB.disabled = false;
		}
		ACTPAGE.nextAction();
		return;
	}
	
	if (deadTarget){
		for (var i=0;i<fobj.enemies.length;++i){
			if (fobj.enemies[i].active){
				fobj.target = i;
				break;
			}
		}
	}
}

function UseRocket(){
	if (vp.ro <= 0){
		return;
	}
	WrConsole("BUMMM, rakéta támadás");
	for (var i = 0; i<ACTFIGHT.enemies.length; ++i){
		en = ACTFIGHT.enemies[i];
		en.hp = 0;
		en.active = false;
		en.hmark.innerHTML = en.hp;
		
		WrConsole(en.n + " kapmec");
	}
	vp.AddRO(-1);
	Fight();
}

function LuckTest(){
	WrConsole("Szerencse teszt:");
	d = doubledice();
	var ret = false;
	if (d <= cp.lp){
		ret = true;
		WrConsole("szerencséd van");
	} else {
		WrConsole("nincs szerencséd");
	}
	cp.AddLP(-1);
	return ret;
}

function DexTest(){
	WrConsole("Ügyesség teszt:");
	d = doubledice();
	if (d <= cp.dp){
		WrConsole("sikerült");
	} else {
		WrConsole("nem sikerült");
	}
	return (d <= cp.dp);
}

function IamAlive(){
	return (0 < vp.ap && 0 < cp.hp); 
}

var RACEMOD = 0;
 
function race(){

	if(typeof ACTPAGE.myloc === 'undefined'){
		ACTPAGE.myloc = 0;
		ACTPAGE.enloc = 0;
		WrConsole("verseny kezdődik");
	}
	ACTPAGE.myloc += dice()+RACEMOD;
	ACTPAGE.enloc += dice();
	
	WrConsole("te: "+ACTPAGE.myloc+" ellenfél: "+ACTPAGE.enloc);
	if (24 <= ACTPAGE.enloc){
		ACTPAGE.winner = false;
		WrConsole("vesztettél");
		ACTPAGE.myloc = 0;
		ACTPAGE.enloc = 0;
		ACTPAGE.nextAction();
		return;
	}
	if (24 <= ACTPAGE.myloc){
		ACTPAGE.winner = true;
		WrConsole("nyertél");
		ACTPAGE.myloc = 0;
		ACTPAGE.enloc = 0;
		ACTPAGE.nextAction();
		return;
	}
	NACB = race;
}

//next action callback
function next(){
	NACB();
}

function startApp(){
	cp.Generate();
	vp.Generate();
	CONCONT = document.getElementById("concont");
	CONSOLE = document.getElementById("console");
	MEDKITB = document.getElementById("medkitb");
	ROCKETB = document.getElementById("rocketb");
	
	PAGES[0].start();
}
