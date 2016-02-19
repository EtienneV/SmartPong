angular.module('app', ['components'])

.controller('Afficheur', function($scope, $locale, $http) {
  $scope.data = {};

  $scope.data.peerjsId = "";
  $scope.data.qr_src = "";

  var state = 'qr'; // qr, waiting, play

  var x = 500;
  var y = 500;

  var player = {
    left: {
      x: 0,
      pts: 0
    },
    right: {
      x: 0,
      pts: 0
    }
  };

  var ball = {
    position: {
      x: 0,
      y: 0
    },
    vitesse: {
      x: 10,
      y: 10
    },
    acceleration: 1.05
  };

  console.log(player.left.x);

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





    peer.on('open', function(id) { // Lorsque peerJS est opérationnel
        console.log('My peer ID is: ' + id);

        // On affiche le Peer ID et le QR code
        $scope.data.peerjsId = id; 
        $scope.data.qr_src = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=http://www.etiennevilledieu.fr/peerjs/connect/index.html?id="+id;
        $scope.$apply();

        peer.on('connection', function(conn) { // Lorsqu'on a une connexion
          console.log('connection event', conn);

          conn.on('open', function() { // Lorsque la nouvelle connexion est ouverte
            
            // On cache le QR code et on affiche le message d'attente
            $('.qr_container').css('display', 'none');
            $('.intro').css('display', 'block');
            $scope.$apply();

            state = 'waiting';

            conn.on('data', function(data) { // Lorsqu'on reçoit des données
              
              if((state == 'waiting') && (data == 'ready')) // Si le joueur a appuyé sur ready
              {
                $('.intro').css('display', 'none');
                $('.game_container').css('display', 'block');

                state = 'play';

                conn.send('go');
              }

              else if(state == 'play') // Si on est en cours de partie
              {
                //console.log(player.left.x);
                player.left.x = Math.floor(player.left.x-data.y*0.75);

                if(player.left.x < 0) player.left.x = 0;
                if(player.left.x > 500) player.left.x = 500;

                $('.left_player').css('top', player.left.x+'px'); // On change la position du joueur

                /*console.log(data);
                console.log(player.left.x);*/
              }

              else if(state == 'play_mark')
              {
                x = Math.floor(parseInt($('.mark').css('top'))-data.x);
                y = Math.floor(parseInt($('.mark').css('left'))+data.y);

                $('.mark').css('top', x+'px');
                $('.mark').css('left', y+'px');
              }

              $scope.$apply();
            });

            
            // On peut lancer le timer
            setInterval(function () {
              if(state == 'play') // Si on est en cours de partie
              {
                ball.position.x += ball.vitesse.x;
                ball.position.y += ball.vitesse.y; 

                if(ball.position.x < 0) 
                {
                  ball.position.x = 0;
                  //ball.vitesse.x = 10;//*ball.acceleration;
                  ball.vitesse.x = Math.abs(ball.vitesse.x)*ball.acceleration;
                  ball.vitesse.y = ball.vitesse.y*ball.acceleration;

                  // Test si joueur 1 a recupéré la balle
                  if(!((ball.position.y >= player.left.x) && (ball.position.y <= (player.left.x + 80))))
                  {
                    //alert('Joueur 1 a perdu !');
                    player.right.pts++;
                  }
                  else player.left.pts++;
                }
                if(ball.position.x > 970)
                {
                  ball.position.x = 970;
                  ball.vitesse.x = -ball.vitesse.x;//*ball.acceleration;
                }

                if(ball.position.y < 0)
                {
                  ball.position.y = 0;
                  ball.vitesse.y = Math.abs(ball.vitesse.y);
                }
                if(ball.position.y > 570)
                {
                  ball.position.y = 570;
                  ball.vitesse.y = -Math.abs(ball.vitesse.y);
                }

                $('.ball').css('left', ball.position.x+'px');
                $('.ball').css('top', ball.position.y+'px');

                $('.right_player').css('top', ball.position.y+'px'); // On change la position du joueur 2

                $scope.$apply();

                //console.log('timer_play');
              }
            }, 50);

            


          });
        });
    });

  $scope.data.score = function (num) {
    if (num == 1) {
      return player.left.pts;
    }
    else if (num == 2) {
      return player.right.pts;
    }
  };

});
