window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	function(callback) {
	    window.setTimeout(callback, 0);//1000 / 60);
	};
})(); 

var N = 50;
var J = 2;
var K = 0;
var dt = 0.3;

var twopi = 2.0*Math.PI;
var torad = Math.PI/180;
var todeg = 180/Math.PI;

var width = $(canvas).width();
var height = $(canvas).height();
var size = Math.min(width, height);

//var minx = $(canvas).offset()['left'];
//var miny = $(canvas).offset()['top'];
var minx = 0;
var miny = 0;
var maxx = minx + width;
var maxy = miny + width;

var shw=35;
var shh=35;
//var offsetx = width*0.05 + minx;
//var offsety = height*0.05 + miny;
var offsetx = minx;
var offsety = miny;
var scale = size*0.45;

var butterflys;
var vel;

function random_init(){
    butterflys = new Array(N);
    vel = new Array(N);
    for (var i = 0; i < N; i++) {
	butterflys[i] = new Array(3); //x, y, angle
	vel[i] = new Array(3); //vx, vy, vangle
    }
    for (var i = 0; i < N; i++) {
        butterflys[i][0] = 2*Math.random(); // x
        butterflys[i][1] = 2*Math.random(); // y
        butterflys[i][2] = twopi * Math.random(); // color
    }
}

function draw_butterflys(){
    for (var i = 0; i < N; i++) {
	if( offsetx + butterflys[i][0]*scale > minx &&
	    offsetx + butterflys[i][0]*scale < maxx &&
	    offsety + butterflys[i][1]*scale > miny &&
	    offsety + butterflys[i][1]*scale < maxy){
	    var x = offsetx + butterflys[i][0]*scale;
	    var y = offsety + butterflys[i][1]*scale;
	    var color = butterflys[i][2]*todeg;
	    // draw
	    $('#canvas').html($('#canvas').html() + butterflyString('butterfly'+i, x, y, color));
	}
    }
}

function butterflyString(id, top, left, color) {
    var butterflyString = '<div id=' + id + ' style="position: absolute; top:' + top + 'px; left: ' + left + 'px"><div class="butterfly_container"><var class="rotate3d"><figure class="butterfly"><svg class="wing left" viewBox="0 0 150 200" fill="hsl(' + color + ', 100%, 50%)"><use class="left" xlink:href="#butterfly_g"></use></svg><svg class="wing right" viewBox="0 0 150 200" fill="hsl(' + color + ', 100%, 50%)"><use class="left" xlink:href="#butterfly_g"></use></svg></figure></var></div></div>'
    return(butterflyString)
}

var butterflyrad = 3; 
var close = (1.0*butterflyrad)/scale;
function update_velocity(){
    for (var i = 0; i < N; i++) { vel[i][0] = 0; vel[i][1] = 0; vel[i][2] = 0; }
    for (var i = 0; i < N; i++) {
        for (var j = i+1; j < N; j++) {
	    if( j!= i ){
	        var dist0 = (butterflys[j][0] - butterflys[i][0]);
	        var dist1 = (butterflys[j][1] - butterflys[i][1]);
	        var dist2 = (butterflys[j][2] - butterflys[i][2]);
	        var distmag2 = dist0*dist0 + dist1*dist1;
	        var distmag = Math.sqrt(distmag2);
	        var radinc = ((1 + (1 + J*Math.cos(dist2)) )*distmag - 1)/distmag2;

	        vel[i][0] += dist0 * radinc; vel[j][0] -= dist0 * radinc;
	        vel[i][1] += dist1 * radinc; vel[j][1] -= dist1 * radinc;
	        var ang = Math.sin(dist2) / distmag;
	        vel[i][2] += ang; vel[j][2] -= ang;
	    }
	}
    }
}

var oN = 1.0/N; 
function update_swarm(){
    update_velocity();
    var toN = dt*oN;
    var KtoN = dt*K*oN;
    for (var i = 0; i < N; i++) {
        butterflys[i][0] += toN * vel[i][0];
        butterflys[i][1] += toN * vel[i][1];
        butterflys[i][2] += KtoN * vel[i][2];
    }
}

var runAnimation = {value: true};
function animate_butterflys() {
    if(runAnimation.value) {
	update_swarm();
	//draw_butterflys();
	for (var i = 0; i < N; i++) {
	    if( offsetx + butterflys[i][0]*scale > minx &&
		offsetx + butterflys[i][0]*scale < maxx &&
		offsety + butterflys[i][1]*scale > miny &&
		offsety + butterflys[i][1]*scale < maxy){
		var x = offsetx + butterflys[i][0]*scale;
		var y = offsety + butterflys[i][1]*scale;
		var color = butterflys[i][2]*todeg;
		// draw
		//console.log('butterfly'+i+' at ' + x + ':' + y + ' - color:' + color);  
		animateDiv('butterfly'+i, x, y, color);
	    }
	}
    }
    setTimeout(function() {
	requestAnimFrame(function() {
	    animate_butterflys()
	});
    }, 0);
    
}
function animateDiv(id, x, y, color) {
    var $target = $(document.getElementById(id));

    // change color
    var wings = $target.find('.wing');
    wings[0].setAttribute('fill', "hsl(" + color + ", 100%, 50%)");
    wings[1].setAttribute('fill', "hsl(" + color + ", 100%, 50%)");

    // change position
    var newq = [x, y]
    var oldq = $target.offset();
    var speed = calcSpeed([oldq.top, oldq.left], newq);

    $(document.getElementById(id)).animate({
        top: x,
        left: y
    }, speed, function() {
	//console.log("moved " + id);
    });
};
function calcSpeed(prev, next) {
    var x = Math.abs(prev[1] - next[1]);
    var y = Math.abs(prev[0] - next[0]);

    var greatest = x > y ? x : y;

    var speedModifier = dt;

    var speed = Math.ceil(greatest / speedModifier);

    return speed;
}

function init_swarm(){
    // set parameters
    N = Number($(paramNSpan).text())
    J = Number($(paramJSpan).text())
    K = Number($(paramKSpan).text())	 
    dt = Number($(paramdtSpan).text())
    
    // clear old
    $('#canvas').html('');
    
    // new
    random_init();
    draw_butterflys();
    animate_butterflys();
}
