from flask import Flask, render_template
from flask_socketio import SocketIO, send, emit

app = Flask(__name__)


@app.route('/')
def return_index():
    return render_template('index.html')

@app.route('/util.js')
def return_util():
    return render_template('util.js')

app.debug = True
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)


@socketio.on('message')
def handle_message(msg):
    print(msg)
    send(msg)

if __name__ == '__main__':
    socketio.run(app)
