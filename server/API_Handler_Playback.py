import json
import spotipy
import spotipy.util as util
from spotipy import oauth2
import os



class PlaybackHandler:

    with open("credentials.json") as credentials_file:
        credentials = json.load(credentials_file)

    def __init__(self, playlist_name, room_id):
        self.scope = 'playlist-modify-private playlist-modify-public playlist-read-private user-read-playback-state user-modify-playback-state'
        self.username = None
        self.playlist_id = None
        self.playlist_name = playlist_name
        self.sp = None
        self.cache_path = "./cache/" + room_id
        self.sp_oauth = oauth2.SpotifyOAuth(self.credentials["client_id"], self.credentials["client_secret"],
                                            self.credentials["redirect_url"],
                                            scope=self.scope, cache_path=self.cache_path)


    def playlist_length(self):
        self.refresh_token_if_necessary()
        result = self.sp.user_playlist(self.username, self.playlist_id, fields="tracks")
        return result["tracks"]["total"]

    def add_songs_end(self, uris):
        self.refresh_token_if_necessary()
        if not self.check_playlist_exists():
            self.create_playlist()
        self.sp.user_playlist_add_tracks(self.username, self.playlist_id, uris, position = self.playlist_length())

    def add_song_end(self, uri):
        self.refresh_token_if_necessary()
        print("adding song")
        self.add_songs_end([uri])

    def add_song_offset(self, uri, offset):
        self.refresh_token_if_necessary()
        self.sp.user_playlist_add_tracks(self.username, self.playlist_id, [uri], position=offset)

    def remove_song(self, uri):
        self.refresh_token_if_necessary()
        assert self.check_playlist_exists(), "Playlist must exist before song can be removed"
        self.sp.user_playlist_remove_all_occurrences_of_tracks(self.username, self.playlist_id, [uri])

    def create_playlist(self):
        self.refresh_token_if_necessary()
        if self.check_playlist_exists():
            self.delete_playlist(self.get_playlist_id(self.playlist_name))
        playlist = self.sp.user_playlist_create(self.username, self.playlist_name, False)
        self.playlist_id = "spotify:user:" + self.username + ":playlist:" + playlist.get("id")

    def delete_playlist(self, playlistid = None):
        if playlistid == None:
            playlistid = self.playlist_id.split(":")[4]
        self.refresh_token_if_necessary()
        assert self.check_playlist_exists(), "Playlist must exist before deletion"
        self.sp.user_playlist_unfollow(self.sp.current_user()["id"], playlistid)

    def currently_playing_uri(self):
        self.refresh_token_if_necessary()
        currently_playing = self.sp.currently_playing()
        if  currently_playing != None:
            if currently_playing.get("item") != None:
                return currently_playing.get("item").get("uri")
            else:
                return None
        else:
            return None

    def get_uri_playlist_offset(self, offset):
        self.refresh_token_if_necessary()
        result = self.sp.user_playlist(self.username, self.playlist_id, fields="tracks")
        return result["tracks"]["items"][offset]["track"]["uri"]

    def refreshPlaylist(self):
        self.refresh_token_if_necessary()
        self.sp.current_user_playlists()

    def check_playlist_exists(self):
        self.refresh_token_if_necessary()
        if self.playlist_id:
            return True
        playlists = self.sp.current_user_playlists()
        for playlist in playlists.get("items"):
            if playlist.get("name") == self.playlist_name:
                self.playlist_id = playlist.get("id")
                return True
        return False

    def get_playlist_id(self, playlist_name):
        self.refresh_token_if_necessary()
        playlists = self.sp.current_user_playlists()
        for playlist in playlists.get("items"):
            if playlist.get("name") == playlist_name:
                return playlist.get("id")
        return None

    def get_active_device(self):
        devices = self.sp.devices()
        for device in devices["devices"]:
            if device["is_active"] :
                return device["id"]
        return None

    def start_playback(self, offset = None, device_id = None):
        self.refresh_token_if_necessary()
        playlist_uri = self.playlist_id
        if offset:
                self.sp.start_playback(context_uri=playlist_uri, device_id=device_id)

        else:
            self.sp.start_playback(context_uri=playlist_uri, offset=offset, device_id=device_id)

    def authenticate_user(self):
        print(self.credentials["redirect_url"])
        token = util.prompt_for_user_token(self.username, self.scope, client_id=self.credentials["client_id"],
                                           client_secret=self.credentials["client_secret"],
                                           redirect_uri=self.credentials["redirect_url"])
        sp = spotipy.Spotify(auth=token)
        print("\n\nFINISHED AUTHENTICATION\n\n")
        return sp

    def get_cached_token(self):
        return self.sp_oauth.get_cached_token()

    def is_cached_token_expired(self):
        return self.sp_oauth.is_token_expired(self.sp_oauth.get_cached_token())

    def get_refreshed_cached_token(self):
        if self.is_cached_token_expired():
            return self.sp_oauth.refresh_access_token(self.get_cached_token()["refresh_token"])
        else:
            return self.get_cached_token()

    def refresh_token_if_necessary(self):
        if self.is_cached_token_expired():
            print("TOKEN EXPIRED")
            self.authenticate(self.get_refreshed_cached_token()["access_token"])

    def get_auth_url(self):
        return self.sp_oauth.get_authorize_url()

    def get_auth_token(self, response):
        code = response
        token_info = self.sp_oauth.get_access_token(code)
        if token_info:
            return token_info["access_token"]
        else:
            return None

    def authenticate(self, token):
        self.sp = spotipy.Spotify(auth=token)

    def get_username_from_spotipy(self):
        return self.sp.current_user()["id"]


    def get_device_names(self):
        device_names =[]
        for device in self.sp.devices()["devices"]:
            device_info_json = {
                "name" : device["name"],
                "id" : device["id"]
            }
            device_names.append(device_info_json);
        return device_names

    def pause_playback(self):
        self.refresh_token_if_necessary()
        self.sp.pause_playback(self.get_active_device())

    def check_if_paused(self):
        currentlyPlaying = self.sp.current_playback()
        if currentlyPlaying !=None :
            return not ["is_playing"]
        else:
            return None

    def remove_cache(self):
        if os.path.exists(self.cache_path):
            os.remove(self.cache_path)
        else:
            print("Cache is not present")