
$(document).ready(function(){
  $('.deleteDrink').on('click', deleteDrink);
});

function deleteDrink(){
  deleteId = $(this).data('id');
  var confirmation = confirm('Vymazať recept?');

  if(confirmation){
    $.ajax({
      type:'DELETE',
      url:'/delete/'+deleteId
    }).done(function(response){   
      
    });
  } else {
    return false;
  }
}

module.exports = router;
