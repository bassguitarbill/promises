function log(data) {
	console.log(data);
	return(data);
}

var votingData;
$(document).ready(function() {
	
	votingData = document.getElementById('votingData').innerHTML;

	$('#button1').click(function(){
		
		get(new MockWSCall(true, 1500, votingData))
		.then(log)
		.then(parse)
		.then(log)
		.then(processVotes)
		.then(function(v){console.log(v); return v})
		.then(tallyVotes)
		.then(log)
		.then(display)
		.catch(displayError);
	});
	
});

function displayError (err) {
	$('#result').text(err);
}

function display (winner) {
	$('#result').text("The winner is " + winner);
}

function parse(data) {
	$('#parse').css('background-color','yellow');
	var rsp = JSON.parse(data);
	$('#parse').css('background-color','green');
	return rsp;
}

function tallyVotes(voteArray) {

	$('#tally').css('background-color','yellow');
	var count = voteArray.reduce(function(votes, v){
		if(votes[v.id])
			votes[v.id]++
		else
			votes[v.id] = 1;
		return votes;
	}, {});
	var largestID = Object.keys(count).sort(function(a,b){return count[a] < count[b]})[0];
	$('#tally').css('background-color','green');
	var candidate = voteArray.filter(function(v){return v.id == largestID})[0].name;
	return candidate;
}

function processVotes(votes) {
	return(Promise.all(votes.data.votes.map(function(vote){
		return processVote(vote, votes.data.candidates)
	})));
}

function processVote(vote, candidates) {
	console.log(vote);
	return new Promise(function(res, rej) {
		$('#' + vote.voter).css('background-color','yellow');
		setTimeout(function(){
			var c = candidates.filter(function(el){return el.id == vote.selection});
			if(c[0]){
				res(c[0]);
				$('#' + vote.voter).css('background-color','green');
			}else{
				rej(Error("Invalid candidate " + vote.selection));
				$('#' + vote.voter).css('background-color','red');
			}
		}, Math.floor(Math.random() * 1000) + 500);
	});
}

function MockWSCall(success, duration, data) {

	this.onload = function(){};
	this.onerror = function(){};
	
	var wsCall = this;
	
	this.send = function(){
		setTimeout(function(){
			if(success){
				wsCall.status = 200;
				wsCall.response = data;
				wsCall.onload();
			} else {
				wsCall.status = 404;
				wsCall.onerror();
			}
		}, duration);
	};
	
}

function get(wsCall) {
	
	return new Promise(function(resolve, reject){
	
		$('#ws').css('background-color','yellow');
		var req = wsCall;
		req.onload = function(){
			$('#ws').css('background-color','green');
			resolve(req.response);
		};
		
		req.onerror = function(){
			$('#ws').css('background-color','red');
			reject(Error("WS Error"));
		}
		
		req.send();
	
	});

}