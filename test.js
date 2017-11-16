window.onload = newgame; //页面载入的时候就开始一个新的游戏
window.onpopstate = popState; //处理历史记录相关事件
var state, ui; //全局变量，在newgame()方法中会对其初始化
function newgame(playagain) { //开始一个新的猜数字游戏
    //初始化一个包含需要的文档元素的对象
    ui = {
        heading: null, //文档最上面的＜h1＞元素
        prompt: null, //要求用户输入一个猜测数字
        input: null, //用户输入猜测数字的地方
        low: null, //可视化的三个表格单元格
        mid: null, //猜测的数字范围
        high: null
    }; //查询这些元素中每个元素的id
    for (var id in ui) ui[id] = document.getElementById(id); //给input字段定义一个事件处理程序函数
    ui.input.onchange = handleGuess; //生成一个随机的数字并初始化游戏状态
    state = {
        n: Math.floor(99 * Math.random()) + 1, //整数：0＜n＜100
        low: 0, //可猜测数字范围的下限
        high: 100, //可猜测数字范围的上限
        guessnum: 0, //猜测的次数
        guess: undefined //最后一次猜测
    }; //修改文档内容来显示该初始状态
    display(state); //此函数会作为onload事件处理程序调用，
    //同时当单击显示在游戏最后的"再玩一次"按钮时候，也会调用它
    //在第二种调用情况下，playagain参数值为true
    //如果playagain为true，则保存新的游戏状态
    //但是如果是作为onload事件处理程序调用的情况下，则不保存状态
    //这是因为，当通过浏览器历史记录从其他文档状态回退到当前的游戏状态时，
    //也会触发load事件。如果这种情况下，也保存状态的话，
    //会将真正的游戏历史状态记录覆盖掉
    //在支持pushState()方法的浏览器中，load事件之后总是有一个popstate事件
    //因此，这里的处理方式是，等待popstate事件而不是直接进行状态保存
    //如果该事件提供一个状态对象，则直接使用该对象即可
    //如果该事件没有状态对象，就表示这实际上是一个新的游戏，
    //则使用replaceState来保存最新的游戏状态
    if (playagain === true) save(state);
}
//如果支持的话，就使用pushState()方法将游戏状态保存到浏览器历史记录中
function save(state) {
    if (!history.pushState) return; //如果pushState()方法没有定义的话，则什么也不做
    //这里会将一个保存的状态和URL关联起来
    //该URL显示猜测的数字，但是不对游戏状态进行编码，
    //因此，这对于书签是没有用的
    //不能简单地将游戏状态写到URL中，因为这会将游戏一些机密数字暴露在地址栏中
    var url = "#guess" + state.guessnum; //保存状态对象和URL
    history.pushState(state, //要保存的状态对象
        "", //状态标题：当前浏览器会忽略它
        url); //状态URL：对书签是没有用的
}
//这是onpopstate的事件处理程序，用于恢复历史状态
function popState(event) {
    if (event.state) { //如果事件有一个状态对象，则恢复该状态
        //要注意的是，event.state是对已保存状态对象的一个深拷贝
        //因此无须改变保存的值就可以修改该对象
        state = event.state; //恢复历史状态
        display(state); //显示恢复的状态
    } else { //当第一次载入页面时，会触发一个没有状态的popstate事件
        //用真实的状态将null状态替换掉：参见newgame()方法中的注释
        //这里不需要调用display()方法
        history.replaceState(state, "", "#guess" + state.guessnum);
    }
}; //每次用户猜测一个数字的时候，都会调用此事件处理程序
//此处理程序用于更新游戏的状态、保存游戏状态并显示游戏状态
function handleGuess() { //从input字段中获取用户猜测的数字
    var g = parseInt(this.value); //如果该值是限定范围中的一个数字
    if ((g > state.low)&&(g < state.high)) { //对应地更新状态对象
        if (g < state.n) state.low = g;
        else if (g > state.n) state.high = g;
        state.guess = g;
        state.guessnum++; //在浏览器历史记录中保存新的状态
        save(state); //根据用户猜测情况来修改文档
        display(state);
    } else { //无效的猜测：不保存状态
        alert("整数必须大于" + state.low +
            "小于" + state.high);
    }
}
//修改文档来显示游戏当前状态
function display(state) { //显示文档的导航和标题
    ui.heading.innerHTML = document.title =
        "猜一个整数吧！" +
        state.low + "到" + state.high + "之间"; //使用一个表格来显示数字的取值范围
    ui.low.style.width = state.low + "%";
    ui.mid.style.width = (state.high - state.low) + "%";
    ui.high.style.width = (100 - state.high) + "%"; //确保input字段是可见的、空的并且是聚焦的
    ui.input.style.visibility = "visible";
    ui.input.value = "";
    ui.input.focus(); //根据用户最近的猜测，设置提示
    if (state.guess === undefined)
        ui.prompt.innerHTML = "输入数字按回车键结束:";
    else if (state.guess < state.n)
        ui.prompt.innerHTML = state.guess + "数字太小，请重新输入:";
    else if (state.guess > state.n)
        ui.prompt.innerHTML = state.guess + "数字太大，请重新输入:";
    else { //当猜对了的时候，就隐藏input字段并显示"再玩一次"按钮
        ui.input.style.visibility = "hidden"; //不需要再猜了
        ui.heading.innerHTML = document.title = state.guess + "正确!";
        ui.prompt.innerHTML =
            "你赢了!<button onclick='newgame(true)'>重完</button>";
    }
}