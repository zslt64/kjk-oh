var CONCONT;
var CONSOLE;
var NEXTBUTTON;
var PAGES = new Object();

var ACTPAGE;
var NACB;

function Link(page, destNum, cond){
	this.page = page;
	this.destNum = destNum;
	this.id = "link"+page.num+"to"+destNum;
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
	if (this.cond()){
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
	this.actAction = 0;
}
Page.prototype.addLink = function(destNum, cond){
	this.links.push(new Link(this, destNum, cond));
}
Page.prototype.addAction = function(action){
	this.actions.push(action);
}
Page.prototype.activateLinks = function(){
	NEXTBUTTON.disabled = true;
	if (this.actAction == this.actions.length){
		for (i=0;i<this.links.length;++i){
			this.links[i].activate();
		}
	}
}
Page.prototype.nextAction = function(){
	if (this.actions.length <= this.actAction){
		this.activateLinks();
		return;
	}
	NACB = function() { 
		ACTPAGE.nextAction(); 
	};
	this.actions[this.actAction]();
	++this.actAction;
}
Page.prototype.render = function(){
	pageid = "p" + this.num;
    CONCONT.innerHTML = document.getElementById(pageid).innerHTML;
	
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
}
Page.prototype.start = function() {
	ACTPAGE = this;
	this.render();
	this.actAction = 0;
	NEXTBUTTON.disabled = false;
	ClrConsole();
	this.nextAction();
}

function dice()
{
	return Math.floor((Math.random() * 6) + 1);
}

function CharacterPage(){
	this.mdp = 0; //maximum dexterity
	this.dp = //dexterity
	this.mhp = 0; //maximum health point
	this.hp = 0; //health point
	this.mlp = 0; //maximum luck
	this.lp = 0; //luck
	this.eq = new Array(); //equipment
	this.cr = 0; //credit
	this.mk = 0; //medkits
}
CharacterPage.prototype.Render = function(add){
	document.getElementById("mdp").value = this.mdp;
	document.getElementById("dp").value = this.dp;
	document.getElementById("mhp").value = this.mhp;
	document.getElementById("hp").value = this.hp;
	document.getElementById("mlp").value = this.mlp;
	document.getElementById("lp").value = this.lp;
	//document.getElementById("mk").value = this.mk;
	//document.getElementById("cr").value = this.cr;
}
CharacterPage.prototype.AddDP = function(add){
	this.dp += add;
	if (this.mdp < this.dp) {
		this.dp = this.mdp;
	}
	this.dp = ndp;
	WrConsole("Ügyesség: "+add);
	this.Render();
}
CharacterPage.prototype.AddHP = function(add){
	this.hp += add;
	if (this.mhp < this.hp) {
		his.hp = this.mhp;
	}
	WrConsole("Életerő: "+add);
	this.Render();
}
CharacterPage.prototype.AddLP = function(add){
	this.lp += add;
	if (this.mlp < this.lp) {
		this.lp = this.mlp;
	}
	WrConsole("Szerencse: "+add);
	this.Render();
}
CharacterPage.prototype.AddCR = function(add){
	this.cr += add;
	WrConsole("Kredit: "+add);
	this.Render();
}
CharacterPage.prototype.UseMedkit = function(){
	if (this.mk <= 0){
		return
	}
	this.mk--;
	WrConsole("EU csomag használat");
	this.AddHP(4);
	this.Render();
}
CharacterPage.prototype.HasStuff = function(stuff){
	return this.eq.indexOf(stuff) != -1
}
CharacterPage.prototype.AddStuff = function(stuff){
	this.eq.push(stuff);
	this.Render();
}
CharacterPage.prototype.RemoveStuff = function(stuff){
	var i = this.eq.indexOf(stuff);
	if (i > -1){
		this.eq.splice(i,1)
	}
	this.Render()
}
CharacterPage.prototype.Generate = function(){
	this.mdp = this.dp = dice() + 6;
	this.mhp = this.hp = dice() + dice() + 24;
	this.mlp = this.lp = dice() + 6;
	this.cr = 200;
	this.mk = 10;
	this.Render();
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
	document.getElementById("mfp").value = this.mfp;
	document.getElementById("fp").value = this.fp;
	document.getElementById("map").value = this.map;
	document.getElementById("ap").value = this.ap;
	//document.getElementById("ro").value = this.ro;
	//document.getElementById("in").value = this.in;
	//document.getElementById("sw").value = this.sw;
	//document.getElementById("ga").value = this.ga;
}
VehiclePage.prototype.AddFP = function(add){
	this.fp += add;
	if (this.mfp < this.fp) {
		this.fp = this.mfp;
	}
	this.Render();
}
VehiclePage.prototype.AddAP = function(add){
	this.ap += add;
	if (this.map < this.ap) {
		this.ap = this.map;
	}
	this.Render();
}
VehiclePage.prototype.Generate = function(){
	this.mfp = this.fp = dice() + 6;
	this.map = this.ap = dice() + dice() + 24;
	this.cr = 200;
	this.mk = 10;
	this.ro = 4; 
	this.in = 3;
	this.oi = 2; 
	this.sw = 2; 
	this.ga = 0;
	this.Render();
}
var vp = new VehiclePage();

function ClrConsole(){
	CONSOLE.innerHTML = '';
}

function WrConsole(message){
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
	this.roundsLimit = 0;
	this.hurt = 0;
	this.hurtLimit = 0;
	this.attackmod = 0;
	this.powermod = 0;
	this.hurtmod = 0;
	this.win = false;
}

var actFight;

function Fight(){
	
	var fobj = actFight;
	
	fobj.rounds++;
	if (fobj.rounds == 0){
		WrConsole("harc kezdődik");
		//todo: disable medkits, enadble rockets
		NACB = Fight;
		return;
	}
	
	var myp = 0;
	
	if (fobj.type == 'hand' || fobj.type == 'gun'){
		myp = cp.dp;
	} else if (fobj.type == 'car'){
		myp = vc.fp;
	}
	
	var end = false;
	
	for (var i=0;i<fobj.enemies.length;++i){
	
		var en = fobj.enemies[i];
		if (!en.active){
			continue;
		}		
		WrConsole("támad: " + en.n);
		var enp = en.p;
		var endice = dice() + dice();
		var enps = enp+endice;
		WrConsole("ellenfél támadóereje : " + enp + " + " + endice + " = " + enps)
		var mydice = dice() + dice();
		var myps = myp+mydice;
		WrConsole("saját támadóerő : " + myp + " + " + mydice + " = " + myps)
		
		if (enps == myps){
			WrConsole("egál, senki se sérül");
		}
		else
		{
			var hurt = 0;
			if (fobj.type == 'hand'){
				hurt = 1;
			} else if (fobj.type == 'gun' || fobj.type == 'car'){
				hurt = dice();
			}
			
			if (enps < myps){
				//my succes
				if (i != fobj.target){
					WrConsole("nem talál el");
				} else {
					hurt += fobj.hurtmod;
					en.hurt += hurt;
					en.h -= hurt;
					WrConsole("eltaláltad, sebzés: " + hurt + " maradt : " + en.h);
				}
				if (en.h <= 0){
					WrConsole("végeztél vele");
					en.active = false;				
				}
				if (en.hurtLimit && en.hurtlimit <= en.hurt){
					WrConsole("kiütötted");
					en.active = false;
				}			
			} else {
				//enemy succes
				hurt += en.hurtmod;
				fobj.hurt += hurt; 
				WrConsole("eltaláltak, sérülés: " + hurt);
				if (fobj.type == 'hand' || fobj.type == 'gun'){
					cp.AddHP(-hurt);
					if (cp.hp <= 0){
						WrConsole("véged");
						end = true;
						break;
					}
				} else if (fobj.type == 'car') {
					vp.AddAP(-hurt);
					if (vp.ap <= 0){
						WrConsole("kilőttek");
						end = true;
						break;
					}
				}
				if (fobj.hurtlimit && fobj.hurtlimit < fobj.hurt){
					WrConsole("kidőltél");
					end = true;
					break;
				}
			}
		}
	}
	
	if (fobj.roundLimit <= fobj.rounds){
		WrConsole("harc vége");
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
		WrConsole("győztél");
		fobj.win = true;
		end = true;
	}
	
	if (end){
		//todo: enable medkits, disable rockets
		//todo: assing next action to NACB
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

function LuckTest(){
	d = dice() + dice();
	WrConsole("szerencseteszt: "+d);
	if (d <= cp.lp){
		WrConsole("szerencséd van");
	} else {
		WrConsole("nincs szerencséd");
	}
	cp.AddLP(-1);
	return (d <= cp.lp);
}

function DexTest(){
	d = dice() + dice();
	WrConsole("ügyesség teszt: "+d);
	if (d <= cp.dp){
		WrConsole("sikerült");
	} else {
		WrConsole("nem sikerült");
	}
	return (d <= cp.dp);
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
	NEXTBUTTON = document.getElementById("nextbutton");
	
	PAGES[0].start();
}
