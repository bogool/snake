function SnakeGame(gc, fieldSize){
	const gridSize = gc.canvas.width / fieldSize;
	

	function Food(){
		var created = 0;
		this.x = 0;
		this.y = 0;
		this.type = 0;
		this.expiry = 0;

		this.onExpired = function(){};
		this.reset = function(){
			created = performance.now();
			this.x = Math.floor(fieldSize * Math.random());
			this.y = Math.floor(fieldSize * Math.random());
			this.type = Math.floor(3 * Math.random());
			this.expiry = Math.floor(5000 * Math.random()) + 5000;
		}
		this.isEaten = function(x, y){
			return this.x === x && this.y === y;
		}

		this.draw = function(color){
			gc.fillStyle = color || "#FF0000";
			gc.fillRect(this.x * gridSize, this.y * gridSize, gridSize - Math.ceil(gridSize * .01) , gridSize - Math.ceil(gridSize * .01));
			if(performance.now() - created > this.expiry){
				console.log("Food expired!", this.type);
				this.onExpired();
			}
		}

		this.reset();
	}

	function Snake(length){
		var vx = 1, vy = 0;
		var isDead = false;
		var head = {
			x: Math.floor(fieldSize * Math.random()),
			y: Math.floor(fieldSize * Math.random())
		}
		var tail = [];

		this.onDead = function(){}
		this.onMove = function(x, y){}

		this.grow = function(growBy){
			var last = tail[tail.length - 1] || head;
			for(var i = 0; i < (growBy || 1); i++){
				tail.push({
					x: last.x,
					y: last.y
				});
			}
		}

		this.reset = function(){
			isDead = false;
			while(tail.length > length){
				tail.pop();
			}
		}

		this.draw = function(){
			gc.fillStyle = "#00FF00";
			gc.fillRect(head.x * gridSize, head.y * gridSize,  gridSize - Math.ceil(gridSize * .01) , gridSize - Math.ceil(gridSize * .01));
			
			gc.fillStyle = "#0000ff";
			for(var i = 0; i < tail.length; i++){
				gc.fillRect(tail[i].x * gridSize, tail[i].y * gridSize,  gridSize - Math.ceil(gridSize * .01) , gridSize - Math.ceil(gridSize * .01));
			}
		}

		this.move = function(){
			if(!isDead){
				tail.pop();
				tail.unshift({
					x: head.x, 
					y: head.y
				});
				head.x = (head.x + vx + fieldSize) % fieldSize;
				head.y = (head.y + vy + fieldSize) % fieldSize;
				for(var i = 0; i < tail.length; i++){
					if(tail[i].x == head.x && tail[i].y == head.y){
						isDead = true;
						this.onDead();
					}
				}
				this.onMove(head.x, head.y);
			}
		}
		this.stop = function(){
			vx = vy = 0;
		}
		this.go = function(dir){
			switch(dir){
				case "up":
					vx = 0;
					vy = -1;
					break;
				case "down":
					vx = 0;
					vy = 1;
					break;
				case "left":
					vx = -1;
					vy = 0;
					break;
				case "right":
					vx = 1;
					vy = 0;
					break;
			}
		}
	}
	
	
	
	var food;
	var animSpeed = 100;
	var animSpeedModif = 0;
	var timeStamp = performance.now();
	var animationHandler = null;
	var self = this;
	var score = 0;
	var highScore = 0;

	var foodColor = ["#00ffff", "#ff00ff", "#ffff00"];
	function animate(){
		if(performance.now() - timeStamp > (animSpeed + animSpeedModif)){
			gc.fillStyle="#000000";
			gc.fillRect(0,0, gc.canvas.width, gc.canvas.height);

			self.snake.move();
			self.snake.draw();
			food.draw(foodColor[food.type + 1]);
			timeStamp = performance.now();
		}
		animationHandler = requestAnimationFrame(animate);
	}

	function changeScore(newScore){
		score = newScore;
		self.onScoreChanged(score);
		if(highScore < score){
			highScore = score;
			self.onHighScoreChanged(highScore);
		}
	}

	this.snake = null;
	
	

	this.onScoreChanged = function(score){}
	this.onHighScoreChanged = function(score){}

	this.pause = function(){
		cancelAnimationFrame(animationHandler);
		animationHandler = null;
	}

	
	this.start = function(){
		animationHandler = requestAnimationFrame(animate);
	}

	this.reset = function(){
		food = new Food();
		food.onExpired = function(){
			this.reset();
		}
		this.snake = new Snake(0);
		this.snake.onDead = function(){
			animSpeedModif = 0;
			gc.fillStyle="#FF0000";
			gc.fillRect(0,0, gc.canvas.width, gc.canvas.height);
			changeScore(0);
			this.reset();
		}
		this.snake.onMove = function(x, y){
			if(food.isEaten(x, y)){
				changeScore(score + food.type + 1);
				self.snake.grow(food.type + 1);
				switch(food.type){
					case 0:
						animSpeedModif = 100;
						break;
					case 1:
						animSpeedModif = 0;
						break;
					case 2:
						animSpeedModif = -50;
						break;
					default:
						animSpeedModif = 0;
				}

				food.reset();
			}
		}
	}
	this.reset();
}

function initGame(){
	var cnv = document.getElementById("gc");
	var gc = cnv.getContext("2d");
	var scoreBox = document.getElementById("score");
	var highScoreBox = document.getElementById("highScore");

	gc.canvas.height = gc.canvas.width;
	game = new SnakeGame(gc, 30);
	window.onkeydown = function(evt){
		//console.log(evt.keyCode);
		switch(evt.keyCode){
			case 38:
				game.snake.go("up");
				break;
			case 39:
				game.snake.go("right");
				break;
			case 40:
				game.snake.go("down");
				break;
			case 37:
				game.snake.go("left");
				break;
		}
		evt.preventDefault();
		evt.stopPropagation();
	}
	window.onblur = function(){
		console.log("window.onblur");
		game.pause();
	}
	window.onfocus = function(){
		game.start();
	}
	var btns = document.getElementById("buttons");
	btns.onclick = function(evt){
		game.snake.go(evt.target.id);
	}
	game.onScoreChanged = function(score){
		scoreBox.innerHTML = score;
	}
	game.onHighScoreChanged = function(score){
		highScoreBox.innerHTML = score;
	}
	game.start()


}









function snake(){

	vx = 0;
	vy = 0;
	var score = 0;
	var scoreEl = document.getElementById("score");
	var highScore = 0;
	var highScoreEl = document.getElementById("highScore");
	const fieldSize = 30;
	//const speed = 1000 / 30;
	const gc = document.getElementById("gc").getContext("2d");
	gc.canvas.height = gc.canvas.width;
	const pixSize = gc.canvas.width / fieldSize;

	var head = {x: 0, y: 0};
	var tail = [];//[{x:0, y:0}];//[{x:0, y:0}, {x:0, y:0}, {x:0, y:0}, {x:0, y:0}, {x:0, y:0}, {x:0, y:0}, {x:0, y:0}, {x:0, y:0}, {x:0, y:0}, {x:0, y:0}, {x:0, y:0}, {x:0, y:0}];
	var food = {
		x: 0, 
		y: 0,
		type: 0,

		draw: function(){
			switch(this.type){
				case -1:
					gc.fillStyle="#FF0000";
					break;
				case 0:
					gc.fillStyle="#FF00FF";
					break;
				case 1:
					gc.fillStyle="#FFFF00";
					break;
			}
			gc.fillRect(this.x * pixSize, this.y * pixSize, pixSize - Math.ceil(pixSize * .01) , pixSize - Math.ceil(pixSize * .01));
		},
		reset: function(){
			this.x =  Math.floor(fieldSize * Math.random());
			this.y = Math.floor(fieldSize * Math.random());
			this.type = Math.floor(3 * Math.random()) - 1;
		}
	};

	food.reset();
	


	function move(){
		gc.fillStyle="#000000";
		gc.fillRect(0,0, gc.canvas.width, gc.canvas.height);
		
		gc.strokeStyle = gc.fillStyle = "#00FF00";
		gc.fillRect(head.x * pixSize, head.y * pixSize,  pixSize - Math.ceil(pixSize * .01) , pixSize - Math.ceil(pixSize * .01));
		
		gc.strokeStyle = gc.fillStyle = "#0000ff";
		for(var i = 0; i < tail.length; i++){
			if(tail[i].x == head.x && tail[i].y == head.y){
				tail = [{
					x: head.x,
					y: head.y
				}]
			}
			else{
				gc.fillRect(tail[i].x * pixSize, tail[i].y * pixSize,  pixSize - Math.ceil(pixSize * .01) , pixSize - Math.ceil(pixSize * .01));
			}
		}
		
		food.draw();

		if(head.x == food.x && head.y == food.y){
			score = tail.length;
			if(highScore < score){
				highScore = score;
			}
			scoreEl.innerHTML = score;
			highScoreEl.innerHTML = highScore;
			tail.unshift(tail[tail.length - 1]);
			speed = 20 * food.type;
			food.reset();
		}

		tail.shift();
		tail.push({x: head.x, y: head.y});
		head.x = (head.x + vx) % fieldSize;
		head.y = (head.y + vy) % fieldSize;
		if(head.x < 0){
			head.x += fieldSize;
		}
		if(head.y < 0){
			head.y += fieldSize;
		}
	}

	//setInterval(function(){requestAnimationFrame(move)}, 100);
	var animSpeed = 100;
	var speed = 0;
	var animHandler;
	var startTime = null;
	var time = performance.now();

	function animate(){
		counter =  performance.now() - time;
		if(counter > animSpeed + speed){
			time = performance.now();
			move();
			animHandler = requestAnimationFrame(animate);
		}
		else{
			cancelAnimationFrame(animHandler);
		}
		animHandler = requestAnimationFrame(animate);
	}
	
	requestAnimationFrame(animate);

	window.onkeydown = function(evt){
		console.log(evt.keyCode);
		switch(evt.keyCode){
			case 38:
				vx = 0; vy = -1;
				break;
			case 39:
				vx = 1; vy = 0;
				break;
			case 40:
				vx = 0; vy = 1;
				break;
			case 37:
				vx = -1; vy = 0;
				break;
		}
	}

	// gc.strokeStyle = gc.fillStyle = "#ffffff";
	// for(var i = 0; i < gc.canvas.width; i++){
	// 	for(var j = 0; j < gc.canvas.height; j++){
	// 		gc.strokeRect(fieldSize * i, fieldSize * j, fieldSize, fieldSize);
	// 	}
	// }
}

//window.onload = snake;
window.onload = initGame;
