from flask import Flask, render_template, request
from flask_socketio import SocketIO, send
from flask_assets import Bundle, Environment
from flask_socketio import join_room
import parser
import threading
import json
import time
from flask_talisman import Talisman



instance = 0

app = Flask(__name__)

main_host_js = Bundle("./js/main-common.js", "./js/main-host.js", output="./main-host-complete.js")
main_member_js = Bundle("./js/main-common.js", "./js/main-member.js", output="./main-member-complete.js")

assets = Environment(app)

assets.register("main_host_js", main_host_js)
assets.register("main_member_js", main_member_js)

hosts= {}


@app.route('/')
def return_index():
    return render_template('index.html')


@app.route('/start-join-party.html')
def return_index_direct():
    return render_template('index.html')


@app.route('/main-host.html')
def return_main_host():
    id = request.args.get('id')
    if id is not None:
        sid = request.args.get('sid')
        #joining when not the host of the party
        if sid is None or hosts[sid]["party_id"] != id:
            return render_template('index.html')
    return render_template('main-host.html')



@app.route('/main-member.html')
def return_main_member():
    return render_template('main-member.html')





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
app.config['SECRET_KEY'] = open("flask-secret-key").readline()
socketio = SocketIO(app)


@socketio.on('message')
def handle_message(msg):
    print("message: " + msg)
    reply = parser.parse(msg)
    send(reply)

@socketio.on('member_connect')
def connect_member(data):
    join_room(data["partyid"])

@socketio.on('create_room')
def create_room(data):
    response = parser.createRoom(data["party_name"])
    #associate host sid with party
    hosts[request.sid] = {
        "party_id" :response["data"]["code"],
        "connection_verified" : True
    }
    response["data"]["sid"] = request.sid
    send(json.dumps(response))

# @socketio.on('disconnect')
# def handle_disconnect():
#     if request.sid in hosts:
#         parser.partyids[hosts[request.sid]].setInactive()

@socketio.on('host_connected')
def update_connected_host(party_id):
    if request.sid not in hosts:
        for host_sid in hosts:
            if hosts[host_sid]["party_id"] == party_id:
                hosts.pop(host_sid)
                hosts[request.sid] = {
                "party_id" : party_id,
                "connection_verified" : True
                }
    else:
        host = hosts[request.sid]
        if host is not None:
            host["connection_verified"] = True


def main_loop():
    parser.mainLoop()

def verify_connections():
    while True:
        hostsRemoved = []
        for host in hosts:
            if not hosts[host]["connection_verified"]:
                partyId = hosts[host]["party_id"]
                try:
                    parser.partyids[partyId].setInactive()
                except KeyError:
                    print("party id already popped" + partyId)
                    hostsRemoved.append(host)
            else:
                hosts[host]["connection_verified"] = False
        for host in hostsRemoved:
            hosts.pop(host)        
        time.sleep(1800)

if __name__ == '__main__':
    mainLoopThread = threading.Thread(target=main_loop)
    mainLoopThread.start()
    verify_connections_thread = threading.Thread(target=verify_connections)
    verify_connections_thread.start()
    socketio.run(app)


