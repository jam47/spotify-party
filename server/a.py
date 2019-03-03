from flask import Flask, render_template
from flask_socketio import SocketIO, send, emit
import parser

app = Flask(__name__)


@app.route('/')
def return_index():
    return render_template('../web/main.html')

@app.route('/util.js')
def return_util():
    return render_template('../web/util.js')

app.debug = True
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)


@socketio.on('message')
def handle_message(msg):
    print("message: " + msg)
    reply = parser.parse(msg)
    print("reply: " + reply)
    send(reply)

if __name__ == '__main__':
    socketio.run(app)
    parser.mainLoop()
