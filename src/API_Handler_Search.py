import spotipy
import json
from spotipy.oauth2 import SpotifyClientCredentials


class SearchHandler:

    def __init__(self):
        with open("credentials.json") as credentials_file:
            self.credentials = json.load(credentials_file)
        self.client_credentials_manager = SpotifyClientCredentials(client_id=credentials["client_id"],
                                                                   client_secret=credentials["client_secret"])
        self.sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)

    def search_track(self, track_name):
        assert type(track_name) is str, "track_name is not a string"
        result = self.sp.search(q='track:' + track_name, limit=10, type='track')
        return result

    def trim_result(self, result):
        assert type(result) is dict, "result must be a dictionary"
        trimmed_results = {'tracks': []}
        items = result.get("tracks")["items"]
        for track in items:
            trimmed_track = {"name": track.get("name"),
                             "artists": [artist.get("name") for artist in track.get("artists")],
                             "album": track.get("album").get("name"),
                             "uri": track.get("uri")}
            trimmed_results['tracks'].append(trimmed_track)
        return trimmed_results
