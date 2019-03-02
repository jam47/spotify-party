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
    result = sp.search(q='track:' + track_name, limit=10, type='track')
    return result


def trim_result(result):
    assert type(result) is dict, "result must be a dictionary"
    trimmed_results = {'tracks': []}
    items = result.get("tracks")["items"]
    for track in items:
        trimmed_track = {"name": track.get("name"),
                         "artists": [artist.get("name") for artist in track.get("artists")],
                         "album": track.get("album").get("name"),
                         "uri" : track.get("uri")}
        trimmed_results['tracks'].append(trimmed_track)
    return trimmed_results

