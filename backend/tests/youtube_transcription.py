#only if the caption is avaliable 

from youtube_transcript_api import YouTubeTranscriptApi

video_id = "jAkB_qeATag"

#https://youtu.be/jAkB_qeATag?si=XZTgL2aatKuheVxY
api = YouTubeTranscriptApi()
transcript = api.fetch(video_id)

for item in transcript:
    print(item.start, item.duration, item.text)