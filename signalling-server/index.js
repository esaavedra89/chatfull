
/********************************************** */
const express = require("express");
const WebSocket = require("ws");
const http = require("http");
//const uuidv4 = require("uuid/v4");
const uuidv4 = require("uuid").v4;
//const {v4: uuidv4 } = require("uuid");
const app = express();
const port = process.env.PORT || 9000;
//initialize a http server
const server = http.createServer(app);
//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });
//all connected to the server users
let users = {};

const sendTo = (connection, message) => {
    connection.send(JSON.stringify(message));
  };
  
  const sendToAll = (clients, type, { id, name: userName }) => {
    Object.values(clients).forEach(client => {
      if (client.name !== userName) {
        client.send(
          JSON.stringify({
            type,
            user: { id, userName }
          })
        );
      }
    });
  };

wss.on("connection", ws => {
    ws.on("message", msg => {
        let data;
        //accepting only JSON messages
        try {
          data = JSON.parse(msg);
        } catch (e) {
          console.log("Invalid JSON");
          data = {};
        }

        // const { type, name } = data;.
        //const { type, name, offer, answer } = data;
        const { type, name, offer, answer, candidate} = data;

        //Handle message by type
        switch (type) {
        //when a user tries to login
        case "login":
            //Check if username is available
            if (users[name]) {
            sendTo(ws, {
                type: "login",
                success: false,
                message: "Nombre de usuario no disponible"
            });
            } else {
            const id = uuidv4();
            const loggedIn = Object.values(
                users
            ).map(({ id, name: userName }) => ({ id, userName }));
            // Guardamos conexión del usuario.
            users[name] = ws;
            // Asignamos nombre.
            ws.name = name;
            // Asignamos Id.
            ws.id = id;
            // Enviamos al usuario respuesta.
            sendTo(ws, {
                type: "login",
                success: true,
                users: loggedIn
            });
            // Enviamos a todos los usuarios el aviso del nuevo conectado.
            sendToAll(users, "updateUsers", ws);
            }
            break;

            // Making a connection offer.
            case "offer":
                // Check if user to send offer to exists.
                const offerRecipient = users[name];
                if (!!offerRecipient) {
                    sendTo(offerRecipient, {
                    type: "offer",
                    offer,
                    name: ws.name
                    });
                } else {
                    sendTo(ws, {
                    type: "error",
                    message: `No existe el nombre de usuario: ${name}!`
                    });
                }
                break;

                case "answer":
                //Check if user to send answer to exists
                const answerRecipient = users[name];
                if (!!answerRecipient) {
                    sendTo(answerRecipient, {
                    type: "answer",
                    answer,
                    });
                } else {
                    sendTo(ws, {
                    type: "error",
                    message: `No existe el nombre de usuario: ${name}!`
                    });
                }
                break;

                case "candidate":
                //Check if user to send candidate to exists
                const candidateRecipient = users[name];
                if (!!candidateRecipient) {
                    sendTo(candidateRecipient, {
                    type: "candidate",
                    candidate
                    });
                } else {
                    sendTo(ws, {
                    type: "error",
                    message: `No existe el nombre de usuario: ${name}!`
                    });
                }
                break;

                case "leave":
                console.log("Disconnecting from", data.name);
                sendToAll(users, "leave", ws);
                break;
                
                default:
                    
                    sendTo(ws, {
                        type: "error",
                        message: "Command no encontrado: " + type
                        });
                        break;
                    }
                    });
      
    // Evento que ocurre al un usuario desconectarse.
    ws.on("close", function() {
        delete users[ws.name];
        sendToAll(users, "leave", ws);
    });


    //send immediate a feedback to the incoming connection
    ws.send(
        JSON.stringify({
        type: "connect",
        message: "Bienvenido, está conectado al servidor WebSocket"
        })
    );
});

//start our server
server.listen(port, () => {
  console.log(`Servidor Signalling corriendo en el puerto: ${port}`);
});