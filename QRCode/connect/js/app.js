angular.module('app', ['components'])

.controller('Afficheur', function($scope, $locale, $http) {
  $scope.data = {};

  var x = 337;
  var y = 2;
  //-3






  var noSleep = new NoSleep();

    var toggleEl = document.querySelector("#toggle");

    toggleEl.addEventListener('click', function() {
        noSleep.enable(); // keep the screen on!
    }, false);






  function getQuerystring(key, default_)
  {
    if (default_==null) default_=""; 
    key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regex = new RegExp("[\\?&]"+key+"=([^&#]*)");
    var qs = regex.exec(window.location.href);
    if(qs == null)
      return default_;
    else
      return qs[1];
  }

  // Connexion à PeerJS
  //var peer = new Peer({key: 'ablgbc3g83zestt9'});




    // This object will take in an array of XirSys STUN / TURN servers
  // and override the original config object
  var customConfig;
    
  // Call XirSys ICE servers
  $.ajax({
    url: "https://service.xirsys.com/ice",
    data: {
      ident: "etiennev",
      secret: "56a557a0-c848-11e5-b575-cca90585c86b",
      domain: "www.etiennevilledieu.fr",
      application: "pong",
      room: "default",
      secure: 1
    },
    success: function (data, status) {
      // data.d is where the iceServers object lives
      customConfig = data.d;
      console.log(customConfig);
    },
    async: false
  });
    
  // PeerJS object
  var peer = new Peer({
    key: 'ablgbc3g83zestt9',
    debug: 3,
    config: customConfig
  });




  var conn = peer.connect(getQuerystring('id')); // Connexion au navigateur

  conn.on('open', function() {
    // Receive messages
    conn.on('data', function(data) {
      //console.log('Received', data);

      if(data == 'go')
      {
        $('.ready').css('display', 'none');
        $('.go').css('display', 'block');
      }
    });

    gyro.frequency = 50;

    gyro.startTracking(function(o) {
        // o.x, o.y, o.z for accelerometer
        // o.alpha, o.beta, o.gamma for gyro

        conn.send({y: y+o.gamma,
                  x: x+o.beta});

        y = o.gamma;
        x = o.beta;
    });

  });


  $scope.data.ready = function() {
    conn.send('ready');
  };

});
