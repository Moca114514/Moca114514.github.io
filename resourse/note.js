		var maho=document.getElementById('chara');
		var assist=document.getElementById('assist');
		var timer;//保存最新的贴图延时器
		var timer2;//保存assist的贴图延时器
		var timer3;//保存maho的贴图延时器
		var timer4;//避免maho的延时效果清空正常的计时器,最长的那个
		var timer5;//定时器,用来定时减小宽度
		var timer6;//记录hold音效
		var timer8;
		var timer7;//记录判定效果
		var key;//保存keycode值
		var next1;//上面本次按键的时间
		var next2;//下面本次按键的时间
		var before1=Date.now();//上面上一次按键的时间
		var before2=Date.now();//下面上一次按键的时间
		var keyType;//记录按键状态,一共五种:tap,hold,双押,hold+tap,双hold,后三个只有在有对应键型时触发
		var holdAddress;//记录hold路径,匹配时必须匹配完整路径,而不同电脑上的完整路径不可能相同(比如用户名不同)
		var body=document.querySelector("body");//querySelector原因:调用appendChild的元素只能是一个,用tagname选择将会得到一个长度为一的数组,而querySelector会返回满足条件的第一个元素
		var enemyUp=null;//记录最近的up敌人
		var enemyDown=null;//记录最近的down敌人
		var tUp;
		var tDown;//计算判定时间
		var m;
		var n;//帮助定位
		var tmpUp;
		var tmpDown;//暂存before时间
		var hei=body.clientHeight;
		var wid=body.clientWidth;//保存浏览器宽高,style方式只能读取到内联样式
		var dam=document.getElementById("dam");
		var at=document.getElementById('at');
		var homo=document.getElementById('homo');
		var reward=document.getElementById('reward');
		var holdon=document.getElementById('holdon');
		var decideUp=document.getElementById('decideUp');
		var decideDown=document.getElementById('decideDown');
		var perfect=0;
		var great=0;
		var miss=0;
		var maxCombo=0;
		var life=250;//生命值
		var sing=0;//记录时间

		function ifperfect(ho)
		{
			if(ho==0) {
				clearTimeout(timer7);
				decideDown.src="picture\\perfect.png";
				decideDown.style.display="inline";
				timer7=setTimeout(function(){decideDown.style.display="none"},300);
			}
			else
			{
				clearTimeout(timer8);
				decideUp.src="picture\\perfect.png";
				decideUp.style.display="inline";
				timer8=setTimeout(function(){decideUp.style.display="none"},300);
			}
		}

		function ifgreat(mo)
		{
			if(mo==0) {
				clearTimeout(timer7);
				decideDown.src="picture\\great.png";
				decideDown.style.display="inline";
				timer7=setTimeout(function(){decideDown.style.display="none"},300);
			}
			else
			{
				clearTimeout(timer8);
				decideUp.src="picture\\great.png";
				decideUp.style.display="inline";
				timer8=setTimeout(function(){decideUp.style.display="none"},300);
			}
		}
		//构造下敌人函数(并不是真正的构造函数),每次调用将在页面上出现一个下敌人,参数表示出现时间
		function DownEnemy( ){
			var a=document.createElement("img");
			a.src="..\\gif\\run.gif";
			a.className="witch1";
			a.createTime=Date.now();//保存开始时间,目的是为了判定
			body.appendChild(a);
			if(enemyDown==null) enemyDown=a;//如果场上没有其它元素,它作为第一个下元素
			a.addEventListener('animationend',function(){
			a.parentNode.removeChild(a);//如果不这么做,再次引用enemyup时仍保存上次的obj
			maho.src="..\\gif\\damage.gif";//同时,如果让动画成功结束,就说明用户没有做任何操作,受到伤害
			dam.src="audio\\damage.mp3";
			maxCombo=0;
			life-=30;
			enemyDown=document.querySelector(".witch1,.pink,.hold1");//更新enemyDown,防止下次动作必定受伤
			timer=setTimeout(function(){maho.src="..\\gif\\wait.gif"},300);
			},false);//删除元素,防止元素过多,用完即删			
		}
		
		//构造上敌人函数
		function UpEnemy( ){
			var a=document.createElement("img");
			a.src="..\\gif\\run.gif";
			a.className="witch2";
			a.createTime=Date.now();
			body.appendChild(a);
			if(enemyUp==null) enemyUp=a;
			a.addEventListener('animationend',function(){
			a.parentNode.removeChild(a);
			maho.src="..\\gif\\damage.gif";
			maxCombo=0;
			life-=30;
			dam.src="audio\\damage.mp3";
			enemyUp=document.querySelector(".witch2,.blue,.hold2");
			timer=setTimeout(function(){maho.src="..\\gif\\wait.gif"},300);
			},false);
		}

		//构造下hold函数,s是用百分比来定义长度的参数
		function DownHold(s){
			var a=document.createElement("img");
			a.src="picture\\holdDown.png";
			a.className="hold1";
			a.style.width=s/100*wid;
			a.createTime=Date.now();//保存开始时间,目的是为了判定
			var b=document.createElement("img");
			b.src="picture\\pinkStar.png";
			b.className="pink";
			b.createTime=a.createTime;
			body.appendChild(a);
			body.appendChild(b);
			if(enemyDown==null) enemyDown=b;//如果场上没有其它元素,它作为第一个下元素
			b.addEventListener('animationend',function(){
			b.parentNode.removeChild(b);//如果不这么做,再次引用enemyup时仍保存上次的obj
			//hold不会对用户造成伤害
			maxCombo=0;
			enemyDown=document.querySelector(".witch1,.pink,.hold1");//更新enemyDown,防止下次动作必定受伤
			},false);
			a.addEventListener('animationend',function(){
				a.style.opacity=0.6;
				setTimeout(function(){a.parentNode.removeChild(a)},300);
				enemyDown=document.querySelector(".witch1,.pink");//hold的下一个不可能是hold,如果写hold会选择在300ms后才被删除的该元素
				maxCombo=0;
			},false);
		}

		//构造上hold函数,s是用百分比来定义长度的参数
		function UpHold(s){
			var a=document.createElement("img");
			a.src="picture\\holdUp.png";
			a.className="hold2";
			a.style.width=s/100*wid;
			a.createTime=Date.now();//保存开始时间,目的是为了判定
			var b=document.createElement("img");
			b.src="picture\\blueStar.png";
			b.className="blue";
			b.createTime=a.createTime;
			body.appendChild(a);
			body.appendChild(b);
			if(enemyUp==null) enemyUp=b;//如果场上没有其它元素,它作为第一个下元素
			b.addEventListener('animationend',function(){
			b.parentNode.removeChild(b);//如果不这么做,再次引用enemyup时仍保存上次的obj
			//hold不会对用户造成伤害
			maxCombo=0;
			enemyUp=document.querySelector(".witch2,.blue,.hold2");//更新enemyDown,防止下次动作必定受伤
			},false);
			a.addEventListener('animationend',function(){
				a.style.opacity=0.6;
				setTimeout(function(){a.parentNode.removeChild(a);},300);
				enemyUp=document.querySelector(".witch2,.blue");
				maxCombo=0;
			},false);
		}		
		
		function up()
		{
			if(maho.className=="sky") return 1;
			else return 0;
		}
		// 创造上奶酪
		function UpChess()
		{
			var a=document.createElement("img");
			a.src="picture\\chess.png";
			a.className="chessUp";
			body.appendChild(a);
			var tem=0;//记录a是否被删除
			setTimeout(function(){if(up()==1) {a.remove(); tem=1; reward.src="audio\\reward.mp3";life+=10;}},912);
			setTimeout(function(){if((up()==1) && (tem==0)){a.remove();tem=1;reward.src="audio\\reward.mp3";life+=10;}},948);
			setTimeout(function(){if((up()==1) && (tem==0)){a.remove();tem=1;reward.src="audio\\reward.mp3";life+=10;}},984);
			setTimeout(function(){if((up()==1) && (tem==0)){a.remove();tem=1;reward.src="audio\\reward.mp3";life+=10;}},1020);
			setTimeout(function(){if((up()==1) && (tem==0)){a.remove();tem=1;reward.src="audio\\reward.mp3";life+=10;}},1056);
			a.addEventListener('animationend',function(){
			a.remove();
			},false);//删除元素,防止元素过多,用完即删	
		}

		function DownChess()
		{
			var a=document.createElement("img");
			a.src="picture\\chess.png";
			a.className="chessDown";
			body.appendChild(a);
			var tem=0;//记录a是否被删除
			setTimeout(function(){if(up()==0) {a.remove(); tem=1;reward.src="audio\\reward.mp3";life+=10;}},912);
			setTimeout(function(){if((up()==0) && (tem==0)){a.remove();tem=1;reward.src="audio\\reward.mp3";life+=10;}},948);
			setTimeout(function(){if((up()==0) && (tem==0)){a.remove();tem=1;reward.src="audio\\reward.mp3";life+=10;}},984);
			setTimeout(function(){if((up()==0) && (tem==0)){a.remove();tem=1;reward.src="audio\\reward.mp3";life+=10;}},1020);
			setTimeout(function(){if((up()==0) && (tem==0)){a.remove();tem=1;reward.src="audio\\reward.mp3";life+=10;}},1056);
			a.addEventListener('animationend',function(){
			a.remove();
			},false);//删除元素,防止元素过多,用完即删	
		}

		// 创造上齿轮
		function UpGear()
		{
			var a=document.createElement("img");
			a.src="picture\\gear.png";
			a.className="gearUp";
			body.appendChild(a);
			var tem=0;//记录a是否被删除
			setTimeout(function(){if((up()==1) && (tem==0)){a.remove();maho.src="..\\gif\\damage.gif";
				maxCombo=0;life-=30;dam.src="audio\\damage.mp3";timer=setTimeout(function(){maho.src="..\\gif\\wait.gif";},200);tem=1;}},948);
			a.addEventListener('animationend',function(){
			a.remove();
			},false);//删除元素,防止元素过多,用完即删	
		}

		function DownGear()
		{
			var a=document.createElement("img");
			a.src="picture\\gear.png";
			a.className="gearDown";
			body.appendChild(a);
			var tem=0;//记录a是否被删除
			setTimeout(function(){if((up()==0) && (tem==0)){a.remove();maho.src="..\\gif\\damage.gif";maxCombo=0;life-=30;dam.src="audio\\damage.mp3";timer=setTimeout(function(){maho.src="..\\gif\\wait.gif";},200);tem=1;}},948);
			a.addEventListener('animationend',function(){
			a.remove();
			},false);//删除元素,防止元素过多,用完即删
		}

		//判断玩家的操作类型,一共只有四种(原计划五种): tap , hold , tap + hold ,双押(没有双hold原因如下)
		function hold(event){
			// 由于键盘事件没有办法判断出双hold和hold+tap(长按两个键时只显示一个,hold时如果再按tap hold事件就没有办法继续监听),我们只能舍弃双hold事件,同时严格限制hold+tap事件(只在hold的结尾可能出现tap),也就是说,tap一定出现在hold之后
			if(event.keyCode==74){
				before1=next1;
				next1=Date.now();
				if((next1-before1)<=60) {keyType="hold";}
				else
				{
					if((next1-next2)<=80)
					{
						if((next2-before2)<=60) {keyType="tapHoldUp";}//上hold下tap
						else {keyType="doubleTap";}//双押
					}
					else {keyType="tap";}//tap
				}
			}
			else if(event.keyCode==70){
				before2=next2;
				next2=Date.now();
				if((next2-before2)<=60) {keyType="hold";}
				else
				{
					if((next2-next1)<=80)
					{
						if((next1-before1)<=60) {keyType="tapHoldDown";}//下hold上tap
						else {keyType="doubleTap";}//双押
					}
					else {keyType="tap";}//tap
				}
			}
		}

		function judge(event)//判定函数
		{
			key=event.keyCode;
			if((key!=74) && (key!=70)) return;//这么做的目的是为了防止下面这个bug：如果用户进行完上攻击或者下攻击,紧接着马上按其它键,这样会进入到这个函数,但不会进入到任何if,这么做只清空了计时器,也就是让魔法少女一直处于attack的状态		
			if((enemyDown!=null)&&(enemyDown.className=="hold1") && (keyType=="hold") && (key==74))
			{
				clearTimeout(timer);
				clearTimeout(timer4);
				holdon.play();
				if(maho.src!=holdAddress) maho.src="..\\gif\\hold.gif";
				timer=setTimeout(function(){maho.src="..\\gif\\wait.gif";holdon.pause();},100);
				return ;
			}
			if((enemyUp!=null) && (enemyUp.className=="hold2") && (keyType=="hold") && (key==70))//一次只能出现一种情况
			{
				clearTimeout(timer);
				clearTimeout(timer4);
				holdon.play();
				if(maho.src!=holdAddress) maho.src="..\\gif\\hold.gif";
				timer=setTimeout(function(){maho.src="..\\gif\\wait.gif";holdon.pause();},100);
				return ;
			}
			
			if((keyType=="hold") && ((enemyUp!=null) || (enemyDown!=null)))
			{
				if((enemyUp!=null) && (enemyDown!=null))
				{
					if((enemyUp.className!="hold2") && (enemyDown.className!="hold1")) return;
				}
				else if(enemyUp!=null)
				{
					if(enemyUp.className!="hold2") return ;
				}
				else if(enemyDowm!=null)
				{
					if(enemyDown.className!="hold1") return ;
				}
			}
			// if((key==70) && (keyType=="hold") && (enemyUp!=null) && (enemyUp!=hold2)) {return ;}
			// if((key==74) && (keyType=="hold") && (enemyDown!=null) && (enemyDown!=hold1)) {return ;}
			
			{
			// clearTimeout(timer);//清空延时器,如果不清空,将造成严重后果:hold断掉,或者多次tap效果只显示一次
			if(keyType=="tap")//tap类型的攻击(包括hold的前两次,经常被视为tap)
			{
			clearTimeout(timer);//清空延时器,如果不清空,将造成严重后果:hold断掉,或者多次tap效果只显示一次
			if(key==74)
			{	
				if((enemyDown!=null) && (enemyDown.className=="pink"))
				{
					tDown=Date.now();
					tDown-=enemyDown.createTime;
					// 这里又是一个改了好久的大bug,刚开始没有清除timer,结果在js的最后一行有一个绑定在maho身上的动画完成事件,每次都会造成一次卡顿,第二次清除了timer,但是由于js的最后一行是监视动画完成后(150ms)后才开的延时器,所以根本达不到效果.解决的方法是延迟150ms以上删除延时器
					if(maho.className=="sky") {maho.className="groud"; setTimeout(function(){clearTimeout(timer3)},160);};
					if(tDown<680)
					{
						maho.src="..\\gif\\attack.gif";
						at.src="audio\\attack.mp3";
						timer=setTimeout(function(){maho.src="..\\gif\\wait.gif";},350);
						return ;
					}//攻击太早了
					else if(tDown>1168)
					{
						maxCombo=0;
						maho.src="..\\gif\\attack.gif";
						at.src="audio\\attack.mp3";
						timer=setTimeout(function(){maho.src="..\\gif\\wait.gif";},350);
						m=enemyDown.getBoundingClientRect().top;
						n=enemyDown.getBoundingClientRect().left;
						enemyDown.className="wit1";
						var x=enemyDown;
						x.style.top=m;
						x.style.left=n;
						setTimeout(function(){x.remove();},200);
						enemyDown=document.querySelector(".witch1,.pink,.hold1");
						var y=enemyDown;
						var z=enemyDown.getBoundingClientRect().top;
						var q=enemyDown.getBoundingClientRect().left;
						y.style.opacity="0.6";
						y.style.top=z;
						y.style.left=q;
						y.style.height="8%";
						setTimeout(function(){x.remove();},200);
						setTimeout(function(){y.remove();},200);
						enemyUp=document.querySelector(".witch2,.blue,.hold2");
						return ;
					}//攻击太晚了
					else
					{
						if((tDown>800) && (tDown<1000)){perfect+=1;maxCombo+=1;clearTimeout(timer);ifperfect(0);}
						else {great+=1;maxCombo+=1;ifgreat(0);}
						maho.src="..\\gif\\hold.gif";
						var x=enemyDown;
						x.remove();
						enemyDown=document.querySelector(".witch1,.pink,.hold1");//因为pink的性质,下一个元素一定是hold1
						enemyDown.style.animationPlayState="paused";
						var z=enemyDown;
						z.style.animationDuration="0";
						z.style.height="8%";
						timer5=setInterval(function(){ 
							if(parseFloat(z.style.width)>0){
							z.style.width=parseFloat(z.style.width)-0.1*wid/12;holdon.play();}
							else{perfect+=1;maxCombo+=1;ifperfect(0);//hold结束,必然判定为perfect
								if(z!=null) z.remove(); 
								holdon.pause();
								clearInterval(timer5); 
							enemyDown=document.querySelector(".witch1,.pink,.hold1");}},10)//定时器来缩短hold
						timer4=setTimeout(function(){maho.src="..\\gif\\wait.gif";},600);//这里的时间设置的这么长是有原因的,长按某个键时,一般判定前两次为tap,而且相隔时间在550ms左右
						return ;
					}
				}//maho接星星

				if(maho.className=="groud")//maho在地上按tap
				{	
					if(maho.src==holdAddress)
					{
						setTimeout(timer4);
						timer=setTimeout(function(){maho.src="..\\gif\\wait.gif";},100);//这里如果时间设置的太长,用户可以用在吟唱后通过快速敲击tap的方式继续吟唱
						return ;
					}
					maho.src="..\\gif\\attack.gif";
					timer=setTimeout(function(){maho.src="..\\gif\\wait.gif";},350);
				}
				else if(maho.className=="sky")//maho在空中下降
				{
					maho.src="..\\gif\\down.png";
					maho.className="groud";
				}
			}

			else if(key==70)
			{	
				if((enemyUp!=null) && (enemyUp.className=="blue"))
				{
					tUp=Date.now();
					tUp-=enemyUp.createTime;
					if(maho.className=="groud") {maho.className="sky";setTimeout(function(){clearTimeout(timer3)},160);};
					if(tUp<680)
					{
						maho.src="..\\gif\\attack.gif";
						at.src="audio\\attack.mp3";
						timer=setTimeout(function(){maho.src="..\\gif\\wait.gif";},350);
						return ;
					}//攻击太早了
					else if(tUp>1168)
					{
						maxCombo=0;
						maho.src="..\\gif\\attack.gif";
						at.src="audio\\attack.mp3";
						timer=setTimeout(function(){maho.src="..\\gif\\wait.gif";},350);
						m=enemyUp.getBoundingClientRect().top;
						n=enemyUp.getBoundingClientRect().left;
						enemyUp.className="wit1";
						var x=enemyUp;
						x.style.top=m;
						x.style.left=n;					
						enemyUp=document.querySelector(".witch2,.blue,.hold2");
						var y=enemyUp;
						var z=enemyUp.getBoundingClientRect().top;
						var q=enemyUp.getBoundingClientRect().left;
						y.style.opacity="0.6";
						y.style.top=z;
						y.style.left=q;
						y.style.height="8%";
						setTimeout(function(){x.remove()},200);
						setTimeout(function(){y.remove();},200);
						enemyUp=document.querySelector(".witch2,.blue,.hold2");
						return ;
					}//攻击太晚了
					else
					{
						if((tUp>800) && (tUp<1000)){perfect+=1;maxCombo+=1;ifperfect(1); clearTimeout(timer);}
						else {great+=1;maxCombo+=1;ifgreat(1);}
						maho.src="..\\gif\\hold.gif";
						var x=enemyUp;
						x.remove();
						console.log(x);
						enemyUp=document.querySelector(".witch2,.blue,.hold2");
						console.log(enemyUp);
						enemyUp.style.animationPlayState="paused";
						var z=enemyUp;
						z.style.animationDuration="0";
						z.style.height="8%";
						timer5=setInterval(function(){if(parseFloat(z.style.width)>0){z.style.width=parseFloat(z.style.width)-0.1*wid/12;holdon.play();}else{perfect+=1;maxCombo+=1;ifperfect(1);//hold结束,必然判定为perfect
							if(z!=null) z.remove(); 
							holdon.pause();
							clearInterval(timer5); 
							enemyUp=document.querySelector(".witch2,.blue,.hold2");}},10)//定时器来缩短hold
						timer4=setTimeout(function(){maho.src="..\\gif\\wait.gif";},600);//这里的时间设置的这么长是有原因的,长按某个键时,一般判定前两次为tap,而且相隔时间在550ms左右
						return ;
					}
				}
				if(maho.className=="sky")//maho在天上按tap
				{	
					if(maho.src==holdAddress)
					{
						setTimeout(timer4);
						timer=setTimeout(function(){maho.src="..\\gif\\wait.gif";},100);//这里如果时间设置的太长,用户可以用在吟唱后通过快速敲击tap的方式继续吟唱
						return ;
					}
					maho.src="..\\gif\\attack.gif";
					timer=setTimeout(function(){maho.src="..\\gif\\wait.gif";},350);
				}
				else if(maho.className=="groud")//maho升空
				{
					maho.src="..\\gif\\jump.png";
					maho.className="sky";
				}
			}
			}

			else if(keyType=="doubleTap")//双押
			{
				clearTimeout(timer2);
				if(maho.className=="groud")
				{
					assist.className="sky2";
					assist.style.display="inline";
					assist.src="..\\gif\\attack.gif";
					var timer2=setTimeout(function(){assist.style.display="none";},350);
				}
				if(maho.className=="sky")
				{
					assist.className="groud2";
					assist.style.display="inline";
					assist.src="..\\gif\\attack.gif";
					var timer2=setTimeout(function(){assist.style.display="none";},350);
				}
			}

			else if(keyType=="tapHoldUp")
			{
				clearTimeout(timer2);
				assist.className="groud2";
				assist.style.display="inline";
				assist.src="..\\gif\\attack.gif";
				var timer2=setTimeout(function(){assist.style.display="none";},350);
			}

			else if(keyType=="tapHoldDown")
			{
				clearTimeout(timer2);
				assist.className="sky2";
				assist.style.display="inline";
				assist.src="..\\gif\\attack.gif";
				var timer2=setTimeout(function(){assist.style.display="none";},350);
			}
				if((enemyDown==null) && (key==74)) {at.src="audio\\attack.mp3";return;}//没有敌人
				if((key==74)  && (enemyDown.className!="hold1"))
				{
				tDown=Date.now();
					tDown-=enemyDown.createTime;
					if(tDown<600) { at.src="audio\\attack.mp3";return ;}//攻击太早了,什么也没有发生(小于61%)
					else if(tDown>1120)//攻击太晚了,玩家受到攻击,同时,在页面里删除第一个敌人,否则将导致接下来的判定都为miss(大于85%)
					{
						maxCombo=0;
						setTimeout(timer);
						maho.src="..\\gif\\damage.gif";
						dam.src="audio\\damage.mp3";
						m=enemyDown.getBoundingClientRect().top;
						n=enemyDown.getBoundingClientRect().left;
						enemyDown.className="wit1";
						var x=enemyDown;
						x.style.top=m;
						x.style.left=n;
						setTimeout(function(){x.remove();},200);
						enemyDown=document.querySelector(".witch1,.pink,.hold1");
					}
					else
					{
					if((tDown>800) && (tDown<1000)) {perfect+=1;maxCombo+=1;ifperfect(0);}//(69% 到 77%)
					else{great+=1;maxCombo+=1;ifgreat(0);}
					//perfect和great的响应事件基本相同
					if(keyType!="doubleTap") {homo.src="audio\\homo.mp3";}
					enemyDown.src="..\\gif\\dead2.gif";
					enemyDown.style.animationPlayState="paused";
					m=enemyDown.getBoundingClientRect().top;
					n=enemyDown.getBoundingClientRect().left;
					enemyDown.className="wit1";
					// 在这里遇到了一个bug卡了好久,是因为如果用全局变量x装要删除的变量,结果没到200ms时再次点击,x更新了,不再是上一个x,所以一直会留下一个图层
					var x=enemyDown;
					x.style.top=m;
					x.style.left=n;
					setTimeout(function(){x.remove();},200);
					enemyDown=document.querySelector(".witch1,.pink,.hold1");}
			}
				if((enemyUp==null) && (key==70)){at.src="audio\\attack.mp3";return;}
				if((key==70) && (enemyUp.className!="hold2"))
				{
				tUp=Date.now();
					tUp-=enemyUp.createTime;
					if(tUp<600) {at.src="audio\\attack.mp3";return ;}//攻击太早了,什么也没有发生
					else if(tUp>1120)//攻击太晚了,玩家受到攻击,同时,在页面里删除第一个敌人,否则将导致接下来的判定都为miss
					{
						maxCombo=0;
						setTimeout(timer);
						maho.src="..\\gif\\damage.gif";
						dam.src="audio\\damage.mp3";
						m=enemyUp.getBoundingClientRect().top;
						n=enemyUp.getBoundingClientRect().left;
						enemyUp.className="wit1";
						var x=enemyUp;
						x.style.top=m;
						x.style.left=n;
						setTimeout(function(){x.remove();},100);
						enemyUp=document.querySelector(".witch2,.blue,.hold2");
					}
					else
					{
					if((tUp>800) && (tUp<1000)) {perfect+=1;maxCombo+=1;ifperfect(1);}
					else{great+=1;maxCombo+=1;ifgreat(1);}
					//perfect和great的响应事件基本相同
					if(keyType!="doubleTap") {homo.src="audio\\homo.mp3";}
					enemyUp.src="..\\gif\\dead2.gif";
					enemyUp.style.animationPlayState="paused";
					m=enemyUp.getBoundingClientRect().top;
					n=enemyUp.getBoundingClientRect().left;
					enemyUp.className="wit1";
					// 在这里遇到了一个bug卡了好久,是因为如果用全局变量x装要删除的变量,结果没到200ms时再次点击,x更新了,不再是上一个x,所以一直会留下一个图层
					var x=enemyUp;
					x.style.top=m;
					x.style.left=n;
					setTimeout(function(){x.remove();},200);
					enemyUp=document.querySelector(".witch2,.blue,.hold2");}
			}
		}
	}//function judge

	function release()//注意,每次进入页面都会调用一次
	{
		holdon.pause();
		if((enemyDown!=null) && (enemyDown.className=="hold1"))//用户松手了
		{
			maxCombo=0;
			clearInterval(timer5);
			clearInterval(timer6);
			enemyDown.style.opacity="0.6";
			var x=enemyDown;
			setTimeout(function(){x.remove()},200);//谁也无法阻止,所以不用变量储存
			enemyDown=document.querySelector(".witch1,.pink");
		}
		else if((enemyUp!=null) && (enemyUp.className=="hold2"))//用户松手了
		{
			maxCombo=0;
			clearInterval(timer5);
			clearInterval(timer6);
			enemyUp.style.opacity="0.6";
			var x=enemyUp;
			setTimeout(function(){x.remove()},200);
			enemyUp=document.querySelector(".witch2,.blue");
		}
	}

		document.addEventListener("keydown",hold,false);
		document.addEventListener("keydown",judge,false);
		maho.addEventListener('animationend',function(){
			clearTimeout(timer);
			timer3=setTimeout(function(){maho.src="..\\gif\\wait.gif";},200);
		},false);//跳跃动画后自动回到静止状态
		document.addEventListener("keyup",release,false);

		function create(j,k,l)//创造函数,创造音符,j是种类,k是时间差,l是hold长度
		{
			sing+=k;
			if(j==1){setTimeout("DownEnemy()",sing);return ;}
			else if(j==2){setTimeout("UpEnemy()",sing);return ;}
			else if(j==3){setTimeout(function(){DownHold(l);},sing);return ;}
			else if(j==4){setTimeout(function(){UpHold(l);},sing);return ;}
			else if(j==5){setTimeout("DownChess()",sing);return;}
			else if(j==6){setTimeout("UpChess()",sing);return;}
			else if(j==7){setTimeout("DownGear()",sing);return;}
			else if(j==8){setTimeout("UpGear()",sing);return;}
		}