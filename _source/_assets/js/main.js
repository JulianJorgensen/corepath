$(document).ready(function(){

  // disable contact when clicking on a nav item
  $('.nav-item').on('click', function(e){
    $('.nav-contact').removeClass('active');
    $('section#contact').removeClass('active');
  });

  // enable pull-down contact
  $('.nav-contact').on('click', function(e){
    e.preventDefault();
    $(this).toggleClass('active');
    $('section#contact').toggleClass('active');
  });
});
