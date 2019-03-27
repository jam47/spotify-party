import pprint

import json
from spotipy import oauth2


# search_handler = SearchHandler()
# playlist_handler = PlaybackHandler("alan21747", "Spotify Party")
# playlist_handler.sp = playlist_handler.authenticate_user()
with open("credentials.json") as credentials_file:
    credentials = json.load(credentials_file)
scope = 'playlist-modify-private playlist-read-private user-read-playback-state'
username = "alan21747"
code  = "AQBziSdxqdTX-QnJ1khRKxDmudMnX1NR0I3OPa2myCjuxALtBbTy8-XxxOl3LwlFTKTFqQIanbFqVzLKKgP-aKVZWRB1NWfL4pi6Dh5QTvlcNQXprG4X2KVezHlDjC3W27xkITOrBuncfBeSyrYFbHy0UPBi1rNgIQBXewiJNG8Br3vXi6bwpT4kI2uorQB9UuQVOG9icIHSIbFcNRo-UTeLaEp0Y_X8NhTs5JmLY8YGxkwW0vsKfZP_EAVGWm0Lxzr4YyrO90KIdKF5potSgYaegT9p_dsf1BAnjHUgaulo"
print(credentials["client_id"])
print(credentials["client_secret"])
print(credentials["redirect_url"])
sp_oauth = oauth2.SpotifyOAuth(credentials["client_id"], credentials["client_secret"],
                                    credentials["redirect_url"],
                                    scope=scope, cache_path=".cache" + username)
print(sp_oauth.client_id)
print(sp_oauth.client_secret)
print(sp_oauth.redirect_uri)
token_info = sp_oauth.get_access_token(code)
sp = spotipy.Spotify(auth=token_info["access_token"])
sp.user_playlist_create("alan21747", "test playlist", False)
if token_info:
    print(token_info["access_token"])
else:
    print("None")
