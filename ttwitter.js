var util = require('util');
var twitter = require('twitter');
var twit = new twitter({
    consumer_key: 'Q1yBIWyhwajwlOEqZV8Mw',
    consumer_secret: 'pEihqo1RgizDU7BtOBika6VxAcGK42uTr3cm36npE',
    access_token_key: '135457106-vO3VFVu3v6gOh4T0mPBS2gYZoF6vobjTBrS0ctry',
    access_token_secret: '4Ei0ylK7Z0TKIA5alS8LMll9drEDpzmPNhvIUbVSKlg'
});

twit.get('search/tweets.json',{q:'nodejs'},function(error,data,status){
        console.log(util.inspect(data))
	
	
	for(idx in data.statuses){
		tweet  = data.statuses[idx];
		console.log(tweet.text);
	}
	
});



