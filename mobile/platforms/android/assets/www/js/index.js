/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready',init_bindings, false);
    }
};


function init_bindings(){
    console.log("device is ready - binding real events");
    $(".devices").on("tap", "#list_devices", list_devices);
    $(".devices").on("tap", ".connect", connect_bluetooth);
    $(".devices").on("tap", "#disconnect", disconnect_bluetooth);
    $(document).on("tap", "#emergency", emergency_stop);
    $("#disconnect").parent().hide();

    var startX, offsetX, startY, offsetY, el = $("#control_box");
    el[0].addEventListener('touchstart', function(e) {
      e.preventDefault();
      var posX = e.targetTouches[0].pageX;
      var posY = e.targetTouches[0].pageY;
      process_finger_pos(posX, posY);
    }, false);
    el[0].addEventListener("touchmove", function(e) {
      e.preventDefault();
      var posX = e.changedTouches[0].pageX;
      var posY = e.changedTouches[0].pageY;
      process_finger_pos(posX, posY);
    }, false);
    el[0].addEventListener("touchend", function(e) {
      e.preventDefault();
      move_robot(0,0)
    }, false);


}

function process_finger_pos(posX, posY){
  console.log("process position "+posX+","+posY);
  var relY = $("#control_box").offset().top + $("#control_box").height() - posY;
  var relX = posX - $("#control_box").offset().left - $("#control_box").width()/2;

  var length = Math.sqrt( Math.pow(relX, 2)+Math.pow(relY,2) );

  var speed = length / ($("#control_box").width()/2) * 255;
  var cosalpha = relX/length;

  move_robot(speed , cosalpha);
}

function connect_bluetooth(e){
    e.preventDefault();
    var mac_address = $(e.target).parent().attr("mac");
    console.log("Connecting to bluetooth device "+mac_address);
    bluetoothSerial.connect(
        mac_address, 
        function(){
            console.log("Success Callback for bluetoothSerial.connect");
            $("#disconnect").parent().show();
            $("#list_devices").parent().hide();
            $(".devices ul").hide();
            $("#control_box").show();
            bluetoothSerial.subscribe(
              '\n', 
              read_bt_string, 
              function(){
              console.log("Error Callback for bbluetoothSerial.subscribe");
              console.log(error);
          });
        }, 
        function(){
            console.log("Error Callback for bluetoothSerial.connect");
            console.log(error);
        });
}
function list_devices(e){
    e.preventDefault();
    bluetoothSerial.list(
        function(objects) {
            console.log("Success Callback for bluetoothSerial.list");
            $(".devices ul").empty();
            $.each(objects, function(idx, el){
                $(".devices ul").append(
                    "<li mac='"+el.address+"'>"+el.name+"<button class='connect'>CONNECT</button></li>"
                );
            });

        },
        function(error){
            console.log("Error Callback for bluetoothSerial.list");
            console.log(error);
        });

}

function disconnect_bluetooth(e){
    bluetoothSerial.unsubscribe(function(){}, function(){});
    bluetoothSerial.disconnect(
        function(){
            console.log("Success Callback for bluetoothSerial.disconnect");
            $("#disconnect").parent().hide();
            $("#list_devices").parent().show();
            $(".devices ul").empty();
            $(".devices ul").show();
            $("#control_box").hide();
        },
        function(error){
            console.log("Error Callback for bluetoothSerial.disconnect");
            console.log(error);
        }); 
}

function move_robot(speed, balance){
    //Speed is 0-255
    //we change to 0-9999 temporarily

    //Translating to motor speeds
    var left_motor = Math.round(  (speed * (1-balance)/2)/255*9999   );
    var right_motor = Math.round(  (speed * (1+balance)/2)/255*9999  );
    if(right_motor > 9999) right_motor = 9999;
    if(right_motor < 0) right_motor = 0;

    if(left_motor > 9999) left_motor = 9999;
    if(left_motor < 0) left_motor = 0;

    $("#speed").text(speed);
    $("#balance").text(balance);
    $("#left").text(left_motor);
    $("#right").text(right_motor);
    // 00000000
    // 20002000
    var command = four_digits(left_motor)+four_digits(right_motor)+"\n";
    bluetoothSerial.write(command , function(){
      console.log("BTDATA_SEND: "+command);
    }, function(error){
      console.log("Error bluetoothSerial.write "+error);
    });
}

function read_bt_string(data){
  console.log("BTDATA_GET: "+data);
}

function emergency_stop(e){
  e.preventDefault();
  console.log("EMERGENCY STOP");
  bluetoothSerial.write("00000000\n", function(){
    console.log("BTDATA_SEND: "+"00000000\n");
  },function(){})
}
function four_digits(val){
  if(val <10) return "000"+val;
  if(val< 100) return "00"+val;
  if(val< 1000) return "0"+val;
  return val;
}
