function LinkPage(pageNum, links, actions){
	var p = new Page(pageNum);
	for (var i=0;i<links.length;++i){
		p.addLink(links[i]);
	}
	if (actions){
		for (var i=0;i<actions.length;++i){
			p.addAction(actions[i]);
		}
	}
}

function DexTestPage(pageNum, succLink, failLink){
	var p = new Page(pageNum);
	p.addAction(function(){
		ACTPAGE.dexTest = DexTest();
	}, "dice");
	p.addLink(succLink, function(){return ACTPAGE.dexTest;});
	p.addLink(failLink, function(){return !ACTPAGE.dexTest;});
}


function LuckTestPage(pageNum, succLink, failLink){
	var p = new Page(pageNum);
	p.addAction(function(){
		ACTPAGE.luckTest = LuckTest();
	}, "dice");
	p.addLink(succLink, function(){return ACTPAGE.luckTest;});
	p.addLink(failLink, function(){return !ACTPAGE.luckTest;});
}