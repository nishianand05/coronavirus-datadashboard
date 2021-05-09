// ----------------------------------------- Loading page ----------------------------------------- 

function loadpage(){
    $(".content").css("display", "none");
    $(".loadingIcon").css("display", "block");
    $(".loadingIcon").fadeOut(5000, function() {
        $(".content").fadeIn(2000);        
    });
}

$(window).on('load', function(){
    $(document).ready(function() {
        loadpage();
    });   
});


// ----------------------------------------- Navbar ----------------------------------------- 

$("#navBtn").click(function(){
    // console.log('clicked');
      $("nav").toggleClass("hide");
      if($("#navBtn i").hasClass("fa-times")){
        $("#navBtn i").removeClass("fa-times");
        $("#navBtn i").addClass("fa-ellipsis-v navBtnColor");
      } else {
        $("#navBtn i").addClass("fa-times");
        $("#navBtn i").removeClass("fa-ellipsis-v navBtnColor");
      }
});
  

$("#crossbtn").click(function(){
    $(".alert").removeClass("show");
    $(".alert").addClass("hide");
    window.location.reload();
})

// ----------------------------------------- Date ----------------------------------------- 


// Find yesterday date and set as default
var date = new Date();
// var yesterday = date - 1000 * 60 * 60 * 24 * 1;
var today = date
// yesterday = new Date(yesterday).toJSON().slice(0,10);
today = new Date(today).toJSON().slice(0,10);
// $("#dateInput").val(yesterday);
$("#dateInput").val(today);



// ----------------------------------------- Alert message function ----------------------------------------- 

function alertMessage(){
    $(".alert").removeClass("hide");
    $(".alert").addClass("show");
  }
  
  
  // ------------------------------------------- Add total data function --------------------------------------
  
  function AddTotalData(totData) {
  
    $("#tCasesValue").text(`${totData['cases'].toLocaleString()}`);
    $("#newtCasesValue").text(`${(parseInt(totData['newCases'])<0?"-":"+") + totData['newCases'].toLocaleString()}`);
  
    $("#tDeathsValue").text(`${totData['deaths'].toLocaleString()}`);
    $("#newtDeathsValue").text(`${(parseInt(totData['newDeaths'])<0?"-":"+") + totData['newDeaths'].toLocaleString()}`);
  
    $("#tRecoveredValue").text(`${totData['recovered'].toLocaleString()}`);
    $("#newtRecoveredValue").text(`${(parseInt(totData['newRecovered'])<0?"-":"+") + totData['newRecovered'].toLocaleString()}`);
    $('#lastUpdated p').text(`Last updated on ${totData['lastUpdated']}`);
  
  
  }