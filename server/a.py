from flask import Flask, render_template
from flask_socketio import SocketIO, send
from flask_assets import Bundle, Environment
from flask_socketio import join_room
import parser
import threading

instance = 0

app = Flask(__name__)

main_host_js = Bundle("./js/main-common.js", "./js/main-host.js", output="./main-host-complete.js")
main_member_js = Bundle("./js/main-common.js", "./js/main-member.js", output="./main-member-complete.js")

assets = Environment(app)

assets.register("main_host_js", main_host_js)
assets.register("main_member_js", main_member_js)


@app.route('/')
def return_index():
    return render_template('index.html')


@app.route('/start-join-party.html')
def return_index_direct():
    return render_template('index.html')


@app.route('/main-host.html')
def return_main_host():
    return render_template('main-host.html')

@app.route('/main-member.html')
def return_main_member():
    return render_template('main-member.html')


@app.route('/main-host-complete.js')
def return_util():
    return render_template('util.js')


@app.route('/index.js')
def return_index_js():
    return render_template('index.js')


@app.route('/main.css')
def return_main_css():
    return render_template('main.css')


@app.route('/index.css')
def return_index_css():
    return render_template('index.css')

@app.route('/party-shutdown.html')
def return_party_shutdown():
    return render_template('party-shutdown.html')


app.debug = True
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)


@socketio.on('message')
def handle_message(msg):
    print("message: " + msg)
    reply = parser.parse(msg)
    send(reply)

@socketio.on('member_connect')
def connect_member(data):
    join_room(data["partyid"])


def main_loop():
    parser.mainLoop()

if __name__ == '__main__':
    mainLoopThread = threading.Thread(target=main_loop)
    mainLoopThread.start()
    socketio.run(app)

