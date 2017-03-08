var leftDIV = document.createElement( 'div' );
var rightDIV = document.createElement( 'div' );

var leftHTMLrequest = new XMLHttpRequest();
leftHTMLrequest.overrideMimeType("text/html");
leftHTMLrequest.open("get","gui/left.html", true);
leftHTMLrequest.onreadystatechange = function() {
	if ( (this.readyState === 4) && (this.status === 200) ) {
		leftDIV.innerHTML = this.response;
	}
}
leftHTMLrequest.send(null);

var rightHTMLrequest = new XMLHttpRequest();
rightHTMLrequest.overrideMimeType("text/html");
rightHTMLrequest.open("get","gui/right.html", true);
rightHTMLrequest.onreadystatechange = function() {
	if ( (this.readyState === 4) && (this.status === 200) ) {
		rightDIV.innerHTML = this.response;
	}
}
rightHTMLrequest.send(null);



leftDIV.style.position = 'absolute';
leftDIV.style.left = '10px';
leftDIV.style.width = '20%';
leftDIV.style.textAlign = 'left';

rightDIV.style.position = 'absolute';
rightDIV.style.right = '10px';
rightDIV.style.width = '20%';
rightDIV.style.textAlign = 'right';


var canvas = document.getElementById('container')
canvas.appendChild( leftDIV );
canvas.appendChild( rightDIV );
