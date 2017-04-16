
$(document).ready(function(){
  $('.deleteDrink').on('click', deleteDrink);
});

function deleteDrink(){
  deleteId = $(this).data('id');
  var confirmation = confirm('Vymazať projekt?');

  if(confirmation){
    $.ajax({
      type:'DELETE',
      url:'/delete/'+deleteId
    }).done(function(response){   
      
    });
    //window.location = '/';
  } else {
    return false;
  }
}

module.exports = router;
