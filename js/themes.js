/*! Slide Themes  | Spell, the dog */

// $("#galery-buttons #next").click(function() {
// 	$("#galery-prod ul").animate({
// 	left:'-=' + $("#galery-prod li").width()
// });

// 		});


// 		//that is the PREVIEWS buttom
// 		$("#galery-buttons #prev").click(function(){
// 	$("#galery-prod ul").animate({
// 	left:'+=' + $("#galery-prod li").width()
// });
// 		});



// // the NEXT buttom
// $("#theme-buttons #next").click(function() {
// 	$("#theme ul").animate({
// 	left:'-=' + $("#theme li").width()
// });

// 		});


// 		// the PREVIEWS buttom
// $("#theme-buttons #prev").click(function(){
// 	$("#theme ul").animate({
// 	left:'+=' + $("#theme li").width()
// });
// 		});



// Slick

   $('.center').slick({
  centerMode: true,
  centerPadding: '60px',
  slidesToShow: 3,
  responsive: [
    {
      breakpoint: 768,
      settings: {
        arrows: false,
        centerMode: true,
        centerPadding: '40px',
        slidesToShow: 3
      }
    },
    {
      breakpoint: 480,
      settings: {
        arrows: false,
        centerMode: true,
        centerPadding: '40px',
        slidesToShow: 1
      }
    }
  ]
});  
