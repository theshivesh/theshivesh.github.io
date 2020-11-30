$(document).ready(function(){

	// Theme toggle
	$('.theme-toggle').click(function() {
		$('body').toggleClass("light");
		$(this).toggleClass("off");
		
		var toggl = $(this);
		toggl.addClass('scaling');
		setTimeout(function() {
		toggl.removeClass('scaling');
		}, 520);
	});

	// Wrods changer
	$(function () {
		count = 0;
		wordsArray = ["NAMASTE", "MERHABA", "SALAAM", "OLÀ", "BONJOUR", "HOLA", "CIAO"];
		setInterval(function () {
			count++;
			$("#word").fadeOut(400, function () {
				$(this).text(wordsArray[count % wordsArray.length]).fadeIn(400);
			});
		}, 2000);
	});
});
  