$(function() {

// CREATE SELECT OPTIONS


// var amenities = {};
$(".lable-checkbox")
.each(function(index, item){
  // amenities[$(item).attr("for")] = $(item).text();
  $("#select-state").append($("<option>", { value: $(item).attr("for"), text: $(item).text()}));
});


// DROPDOWN


$(".dropdown-item").hide();

$(".has-dropdown").click(function(){
  $(this)
  .parent()
  .find($(".dropdown-btn"))
  .toggleClass("dropdown-btn--active");
  $(this)
  .parent()
  .find($(".dropdown-item"))
  .toggle("slow");
});

$(".has-dropdown-title").click(function(){
  $(this)
  .parent()
  .find($(".dropdown-btn"))
  .toggleClass("dropdown-btn--active");
  $(this)
  .parent()
  .find($(".dropdown-title"))
  .toggle("slow");
});

//CATALOG TABS

$(".catalog__tab--map").click(function(){
  $(".catalog__tab").removeClass("catalog__tab--active");
  $(this).addClass("catalog__tab--active");
  $("#apartmens").removeClass("catalog__toggle--active");
  $("#map").addClass("catalog__toggle--active");
})

$(".catalog__tab--list").click(function(){
  $(".catalog__tab").removeClass("catalog__tab--active");
  $(this).addClass("catalog__tab--active");
  $("#map").removeClass("catalog__toggle--active");
  $("#apartmens").addClass("catalog__toggle--active");
})

// CATALOG TAGS

function showTag($value, $text){
  var $tag = $("<div></div>")
  .text($text.text().slice(0,-1))
  .addClass('item')
  .attr("data-value",$value);

  $tag.data("value", $value);
  var $remove = $("<a></a>")
  .text("×")
  .addClass("remove tagfield__remove")
  .attr("href", "javascript:void(0)");

  $('.tagfield').append($tag.append($remove));
};

function removeTag($value){
  $(".tagfield").find($("[data-value="+$value+"]")).remove();
};

$(document).on('click', '.tagfield__remove', function(){ selectize.removeItem($(this).parent().data('value')); 
});


var select = $('#select-state').selectize({
  plugins: ["remove_button"],
  maxItems: 500,
  placeholder: "enter the names of amenities that you need in apartment",
  onItemAdd: function (value, $item) {
      // $("#" + value).prop( "checked", true );
      $("#" + value).trigger("click");
      showTag(value, $item);
    },
  onItemRemove: function (value) {
      // $("#" + value).prop( "checked", false );
      $("#" + value).trigger("click");
      removeTag(value);
  }
});
var selectize = select[0].selectize;


$(".lable-checkbox").click(function(){
    var $value = $(this).attr("for");
  if($(this).prev().is(':checked')){
    selectize.removeItem($value);
     $(this).prev().prop( "checked", true);

  }else{
    selectize.addItem($value);
    $(this).prev().prop( "checked", false);
  }

});


//SCROLLBAR

$(".catalog__list").perfectScrollbar(); 
$(".amenities").perfectScrollbar();
$(".selectize-dropdown-content").perfectScrollbar();

//DATA


 var apartments = [
  {
    "name": "Stylish apartment in el born",
    "img": "img/Stylish_apartment_in_el_born.jpg",
    "coordinates": {"latitude": 41.393592,"longitude": 2.1625704},
    "value": 85,
    "amenities": [
      "Guarded parking",
      "Balcony",
      "Dishwasher",
      "Freezer"
    ]
  },
  {
    "name": "A cozy flat near Las Ramblas",
    "img": "img/A_cozy_flat_near_Las_Ramblas.jpg",
    "coordinates": {"latitude": 41.394195,"longitude": 2.164844},
    "value": 70,
    "amenities": [
      "Free wireless internet",
      "Fireplace"
    ]
  },
  {
    "name": "Apartment in the classic Barcelona center",
    "img": "img/apartment_in_the_classic_barcelona_center.jpg",
    "coordinates": {"latitude": 41.393732,"longitude": 2.165551},
    "value": 60,
    "amenities": [
      "Air conditioner",
      "Elevator",
      "Terrace",
      "Blender",
      "Fridge"
    ]
  },
   {
    "name": "Classic Eixample place for rent",
    "img": "img/Classic_Eixample_place_for_rent.jpg",
    "coordinates": {"latitude": 41.392794,"longitude": 2.164888},
    "value": 75,
    "amenities": [
      "Free Transportation",
      "Guarded parking",
      "Game room"
    ]
  },
   {
    "name": "Atlantida Beach",
    "img": "img/Atlantida_Beach.jpg",
    "coordinates": {"latitude": 41.392876,"longitude": 2.163260},
    "value": 90,
    "amenities": [
      "Cooking hob"
    ]
  },
   {
    "name": "Elegant place in Eixample",
    "img": "img/Elegant_place_in_Eixample.jpg",
    "coordinates": {"latitude":41.394479,"longitude":2.163797},
    "value": 150,
    "amenities": [
      "Air conditioner",
      "Computer",
      "Free wireless internet",
      "Game room",
      "Terrace",
      "Fridge"
    ]
  },
 ];


// MAP
var pinIcon = L.icon({
    iconUrl: 'img/pin.png',

    iconSize:     [40, 48],
    iconAnchor:   [20, 0], 
    popupAnchor:  [-3, 0] 
});

var markers = L.markerClusterGroup(
  { 
    iconCreateFunction: function (cluster) {
        var markers = cluster.getAllChildMarkers();
        var html = '<div class="cluster-icon">' + markers.length + '</div>';
        return L.divIcon({ html: html, className: 'mycluster', iconSize: L.point(32, 32) });
    },
    spiderfyOnMaxZoom: false, showCoverageOnHover: true, zoomToBoundsOnClick: false 
}
);

//FILTER

var afterFilter = function(result) {
   $('#total_apartmens').text(result.length);
   setMarkers(result);
}

afterFilter(apartments);

 var FJS = FilterJS(apartments, '#apartmens', {
  template: '#apartment-template',
  filter_on_init: true,
  callbacks: {
    afterFilter: afterFilter
   }
});
FJS.addCriteria({field: 'amenities', ele: '.amenities input:checkbox',event: 'change', all: 'all'});



//MAP

mymap.setView([41.393592, 2.162570], 17);

var pinIcon = L.icon({
    iconUrl: 'img/pin.png',
    iconSize:     [40, 48],
    iconAnchor:   [20, 0], 
    popupAnchor:  [-3, 0] 
});


function setMarkers(apartments){

  markers.clearLayers();

 $.each(apartments, function(){
   markers.addLayer(L.marker([this.coordinates.latitude, this.coordinates.longitude], {icon: pinIcon})
    .bindPopup("" + this.name)
    .bindTooltip("€" + this.value, 
    {
        permanent: true,
        direction: 'center'
    })
    .openPopup());
  });
mymap.addLayer(markers);

};



});
