import json
import spotipy
import spotipy.util as util

with open("credentials.json") as credentials_file:
    credentials = json.load(credentials_file)

scope = 'playlist-modify-public'
username = None
playlist_id = None


def queue_song(uri):
    return


def create_playlist():
    if not check_playlist_exists("Spotify Party"):
        playlist = sp.user_playlist_create(username, "Spotify Party", True)
        global playlist_id
        playlist_id = playlist.get("id")


def check_playlist_exists(playlist_name):
    global playlist_id
    if not playlist_id:
        playlists = sp.current_user_playlists()
        for playlist in playlists.get("items"):
            if playlist.get("name") == playlist_name:
                playlist_id = playlist.get("id")
                return True
    return False


def authenticate_user(username_to_authenticate):
    global username
    username = username_to_authenticate
    token = util.prompt_for_user_token(username, scope, credentials["client_id"], credentials["client_secret"],
                                       credentials["redirect_url"])
    sp = spotipy.Spotify(auth=token)
    return sp


sp = authenticate_user("alan21747")

check_playlist_exists("Spotify Party")
print(playlist_id)


