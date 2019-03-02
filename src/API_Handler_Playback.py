import json
import spotipy
import spotipy.util as util


class PlaybackHandler:
    with open("credentials.json") as credentials_file:
        credentials = json.load(credentials_file)

    def __init__(self, username, playlist_name):
        self.scope = 'playlist-modify-private playlist-read-private user-read-playback-state'
        self.username = username
        self.playlist_id = None
        self.playlist_name = playlist_name
        self.sp = self.authenticate_user()

    def add_song(self, uri):
        if not self.check_playlist_exists():
            self.create_playlist()
        self.sp.user_playlist_add_tracks(self.username, self.playlist_id, [uri])

    def remove_song(self, uri):
        assert self.check_playlist_exists(), "Playlist must exist before song can be removed"
        self.sp.user_playlist_remove_all_occurrences_of_tracks(self.username, self.playlist_id, [uri])

    def create_playlist(self):
        if not self.check_playlist_exists():
            playlist = self.sp.user_playlist_create(self.username, self.playlist_name, False)
            self.playlist_id = playlist.get("id")

    def currently_playing_uri(self):
        return self.sp.currently_playing().get("item").get("uri")

    def check_playlist_exists(self):
        if self.playlist_id:
            return True
        playlists = self.sp.current_user_playlists()
        for playlist in playlists.get("items"):
            if playlist.get("name") == self.playlist_name:
                self.playlist_id = playlist.get("id")
                return True
        return False

    def authenticate_user(self):
        token = util.prompt_for_user_token(self.username, self.scope, self.credentials["client_id"],
                                           self.credentials["client_secret"],
                                           self.credentials["redirect_url"])
        sp = spotipy.Spotify(auth=token)
        return sp


playbackHandler = PlaybackHandler("alan21747", "Spotipy Party")

