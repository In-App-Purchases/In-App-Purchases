$(document).ready(function() {

    let count = +($("#counter").text()); // initial count value
    let delta = 1; // initial change in count per click
    
    $("#coinIcon").click(function(){
        count = count + delta;
        $("#counter").text(count);
    });

    $("#saveButton").click(function(){
        localStorage.setItem('Count', count);
        localStorage.setItem('Delta', delta);
    });

    $("#loadButton").click(function(){
        count = +(localStorage.getItem('Count'));
        delta = +(localStorage.getItem('Delta'));
        $("#counter").text(count);
    });

    

});