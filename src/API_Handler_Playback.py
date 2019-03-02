import json
import spotipy
import spotipy.util as util

with open("credentials.json") as credentials_file:
    credentials = json.load(credentials_file)

scope = 'user-library-read'
username = 'mered2010'
print(credentials["redirect_url"])
token = util.prompt_for_user_token(username, scope, credentials["client_id"], credentials["client_secret"],
                                   credentials["redirect_url"])
sp = spotipy.Spotify(auth=token)
