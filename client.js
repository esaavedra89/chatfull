//our username 
var name; 
var connectedUser;
  
//connecting to our signaling server 
//var conn = new WebSocket('ws://localhost:9090');
var conn = new WebSocket('ws://localhost:9000');
  
conn.onopen = function () { 
   console.log("Conectado al servidor signaling"); 
}; 
 
//when we got a message from a signaling server 
conn.onmessage = function (msg) { 
   console.log("Got message", msg.data);
	
   var data = JSON.parse(msg.data);
   switch(data.type) { 
      case "login": 
         handleLogin(data.success); 

         Listausuarios(data)
         break; 
      //when somebody wants to call us 
      case "offer": 
         handleOffer(data.offer, data.name); 
         break; 
      case "answer": 
         handleAnswer(data.answer); 
         break; 
      //when a remote peer sends an ice candidate to us 
      case "candidate":
         handleCandidate(data.candidate); 
         break; 
      case "leave": 
         handleLeave(); 
         break; 
         case "updateUsers": 
         //var myObj, x;
         //myObj = data.user;
         //var myJSON = JSON.stringify(userJ);
         // for (x in myObj) {
         //     if(x == "userName")
         //     {
         //         alert( myObj[x]  + " se ha conectado");
         //     }
         // }

         Listausuarios(data);
         
         break; 
      default: 
         break; 
   } 
};
  
conn.onerror = function (err) { 
   console.log("Got error", err); 
};
  
//alias for sending JSON encoded messages 
function send(message) { 
   //attach the other peer username to our messages 
   if (connectedUser) { 
      message.name = connectedUser; 
   } 
	
   conn.send(JSON.stringify(message)); 
};

//****** 
//UI selectors block
//****** 

var loginPage = document.querySelector('#loginPage'); 
var openChat = document.querySelector('#open-chat'); 
var openListUsuarios = document.querySelector('#open-ListUsuarios'); 

var usernameInput = document.querySelector('#usernameInput'); 
var loginBtn = document.querySelector('#loginBtn'); 

//var callPage = document.querySelector('#callPage'); 
var callToUsernameInput = document.querySelector('#callToUsernameInput'); 
var callBtn = document.querySelector('#callBtn'); 

var hangUpBtn = document.querySelector('#hangUpBtn'); 
var msgInput = document.querySelector('#msgInput'); 
var sendMsgBtn = document.querySelector('#sendMsgBtn'); 

// var chatArea = document.querySelector('#chatarea'); 
var areaMensajes = document.querySelector('#areaMensajes'); 

var yourConn; 
var dataChannel;
//callPage.style.display = "none"; 

// Login when the user clicks the button 
loginBtn.addEventListener("click", function (event) { 
   name = usernameInput.value;
	
   if (name.length > 0) { 
      send({ 
         type: "login", 
         name: name 
      }); 
   } 
	
});
 
function handleLogin(success) { 

   if (success === false) { 
      alert("Ooops... intente con un diferente nombre de usuario"); 
   } else { 
      loginPage.style.display = "none"; 
      //callPage.style.display = "block"; 
      openChat.style.display = "block";
      openListUsuarios.style.display = "block";
		
      //********************** 
      //Starting a peer connection 
      //********************** 

      //using Google public stun server 
      var configuration = { 
        "iceServers": [{ "url": "stun:stun2.1.google.com:19302" }] 
        }; 
        
        yourConn = new webkitRTCPeerConnection(configuration, {optional: [{RtpDataChannels: true}]});
        
        // Setup ice handling 
        yourConn.onicecandidate = function (event) { 
            if (event.candidate) { 
            send({
                type: "candidate", 
                candidate: event.candidate 
            }); 
            } 
        };
        
        //creating data channel 
        dataChannel = yourConn.createDataChannel("channel1", {reliable:true}); 
        
        dataChannel.onerror = function (error) { 
            console.log("Ooops...error:", error); 
        };
        
        //when we receive a message from the other peer, display it on the screen 
        dataChannel.onmessage = function (event) { 
            // chatArea.innerHTML += connectedUser + ": " + event.data + "<br />"; 
            areaMensajes.innerHTML += connectedUser + ": " + event.data + "<br />"; 
        };
        
        dataChannel.onclose = function () { 
            console.log("data channel está cerrado"); 
        };
   } 
};

//initiating a call
// callBtn.addEventListener("click", function () { 
//     var callToUsername = callToUsernameInput.value;
     
//     if (callToUsername.length > 0) {
     
//        connectedUser = callToUsername;
         
//        // create an offer 
//        yourConn.createOffer(function (offer) { 
         
//           send({ 
//              type: "offer", 
//              offer: offer 
//           }); 
             
//           yourConn.setLocalDescription(offer); 
             
//        }, function (error) { 
//           alert("Error creando una oferta: " + message); 
//        });  
//     } 
//  });
   
 //when somebody sends us an offer 
 function handleOffer(offer, name) { 
    connectedUser = name; 
    yourConn.setRemoteDescription(new RTCSessionDescription(offer));
     
    //create an answer to an offer 
    yourConn.createAnswer(function (answer) { 
       yourConn.setLocalDescription(answer); 
         
       send({ 
          type: "answer", 
          answer: answer 
       }); 
         
    }, function (error) { 
       alert("Error creando una respuesta"); 
    });
 };
   
 //when we got an answer from a remote user 
 function handleAnswer(answer) { 
    yourConn.setRemoteDescription(new RTCSessionDescription(answer)); 
 };
   
 //when we got an ice candidate from a remote user 
 function handleCandidate(candidate) { 
    yourConn.addIceCandidate(new RTCIceCandidate(candidate)); 
 };

 //hang up 
hangUpBtn.addEventListener("click", function () { 
    send({ 
       type: "leave" 
    }); 
     
    handleLeave(); 
 }); 
  
 function handleLeave() { 
    connectedUser = null; 
    yourConn.close(); 
    yourConn.onicecandidate = null; 
 };

 //when user clicks the "send message" button 
sendMsgBtn.addEventListener("click", function (event) { 
    var val = msgInput.value; 
   //  chatArea.innerHTML += name + ": " + val + "<br />"; 
    areaMensajes.innerHTML += name + ": " + val + "<br />"; 
     
    //sending a message to a connected peer 
    dataChannel.send(val); 
    msgInput.value = ""; 
 });


 //var cols = ['Name', 'Birthplace', 'Age'];

 // Creamos el elemento tabla.
var t = document.createElement('table');

// Agregamos la clase.
// t.classList.add('scooby-gang', 'listing');

// // Agregamos el thead.
// t.appendChild(document.createElement('thead'));


// t.querySelector('thead').appendChild(document.createElement('tr'));

// for (var i = 0; i < cols.lenght; i++) {
//     // creamos una celda.
//     var heading = document.createElement('td');
//     // Seteamos contenido de la celda con el valor del arreglo.
//     heading.textContent = cols[i];
//     // Agregamos esa celda a la fila.
//     t.querySelector('thead tr').appendChild(heading);
// }


// Agregamos la tabla al div.
document.getElementById('wrapper').appendChild(t);

 function Listausuarios(data)
 {
   var myObj;
   
   if(data.users == null)
   {
      // Individual.
      var usuarioConectado = data.user;
   }else
   {
      myObj = data.users;
         // Create rows
         // for (var i = 0; i < data.length; i++) {
            for (var y = 0; y < myObj.length; y++) {
               var s = myObj[y];
               var r = document.createElement('tr');

               r.dataset.personId = s.id;
               r.id = s.userName.toLowerCase() + "-row";

               var statusCell = document.createElement('td');
               statusCell.textContent = 'Activo';
               statusCell.classList.add('estado');
               statusCell.dataset.personId = y;

               var userName = document.createElement('td');
               userName.textContent = s.userName;
               userName.classList.add('userName');
               userName.dataset.personId = s.id;

               r.appendChild(statusCell);
               r.appendChild(userName);

               t.appendChild(r);
         }
     }

   AddEventoListaUsuarios();  
 }

// Metodo que se crea a partir de hacer click a un usuario.
 function AddEventoListaUsuarios()
 {
   var cells = document.querySelectorAll("td.userName");

   for(var s = 0; s < cells.length; s++)
   {
      cells[s].addEventListener('click', action1);
   }
 }

 // Crea conexión con el usuario seleccionado.
 function action1(e) {
   CallToUsername(e.target.textContent);
   }

// Crea conexión con el usuario seleccionado.
function CallToUsername(name)
{
   //var callToUsername = callToUsernameInput.value;
   var callToUsername = name;
     
    if (callToUsername.length > 0) {
     
       connectedUser = callToUsername;
         
       // create an offer 
       yourConn.createOffer(function (offer) { 
         
          send({ 
             type: "offer", 
             offer: offer 
          }); 
             
          yourConn.setLocalDescription(offer); 

          // Abrimos chat.
          openForm();

          
          var nombreChat = document.getElementById("nombrechat");
          // Cambiamos nombre del chat.
          nombreChat.innerHTML = callToUsername;
             
       }, function (error) { 
          alert("Error creando una oferta: " + message); 
       });  
    } 
}

function openForm() {
   document.getElementById("myForm").style.display = "block";
   }

   function openFormUsers() {
   document.getElementById("myFormUsers").style.display = "block";
   }

   function closeForm() {
   document.getElementById("myForm").style.display = "none";
   }

   function closeFormUsers() {
   document.getElementById("myFormUsers").style.display = "none";
   }

   /****************************************************Llamadas******************************************************** */

   