import spotipy
import json
from spotipy.oauth2 import SpotifyClientCredentials

with open("credentials.json") as credentials_file:
    credentials = json.load(credentials_file)


client_credentials_manager = SpotifyClientCredentials(client_id=credentials["client_id"],
                                                      client_secret=credentials["client_secret"])
sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)


def search_track(track_name):
    assert type(track_name) is str, "track_name is not a string"
    result = sp.search(q='track:' + track_name, limit=5, type='track')
    print(result)


search_track("Final Countdown")
