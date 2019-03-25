import pprint

from API_Handler_Search import SearchHandler
from API_Handler_Playback import PlaybackHandler

search_handler = SearchHandler()
playlist_handler = PlaybackHandler("alan21747", "Spotify Party")
playlist_handler.sp = playlist_handler.authenticate_user()


def test_search():
    search_term = input("Enter a search term:")
    result = search_handler.search_track(search_term)
    trimmed_result = search_handler.trim_result(result)
    pprint.pprint(trimmed_result)


def create_playlist():
    playlist_handler.create_playlist()


def add_song():
    song_uri = input("Enter a uri:")
    playlist_handler.add_song_end(song_uri)
