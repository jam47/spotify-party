from flask import Flask, render_template
from flask_socketio import SocketIO, send, emit
import parser
import threading

app = Flask(__name__)


@app.route('/')
def return_index():
    return render_template('index.html')


@app.route('/main.html')
def return_main():
    return render_template('main.html')


@app.route('/util.js')
def return_util():
    return render_template('util.js')


@app.route('/main.css')
def return_main_css():
    return render_template('main.css')

#TODO:figure out why css isn't rendering
@app.route('/index.css')
def return_index_css():
    return render_template('index.css')


app.debug = True
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)


@socketio.on('message')
def handle_message(msg):
    print("message: " + msg)
    reply = parser.parse(msg)
    # print("reply: " + reply)
    send(reply)

if __name__ == '__main__':
    mainLoopThread = threading.Thread(target = parser.mainLoop)
    mainLoopThread.start()
    socketio.run(app)
