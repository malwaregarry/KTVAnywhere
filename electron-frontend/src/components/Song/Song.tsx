import { useState } from 'react';
import { EditText } from 'react-edit-text';
import './Song.module.css';
import 'react-edit-text/dist/index.css';

export interface SongProps {
  songId: string;
  songName: string;
  artist: string;
  songPath: string;
  lyricsPath: string;
}

export const emptySongProps = {
  songId: '',
  songName: '',
  artist: '',
  songPath: '',
  lyricsPath: '',
};

export const songPickerOptions: Electron.OpenDialogOptions = {
  filters: [
    {
      name: 'Audio',
      extensions: ['mp3', 'wav', 'm4a', 'wma'],
    },
  ],
  properties: ['openFile'],
};

export const lyricsPickerOptions: Electron.OpenDialogOptions = {
  filters: [
    {
      name: 'Lyrics',
      extensions: ['txt', 'lrc'],
    },
  ],
  properties: ['openFile'],
};

const Song = ({ song }: { song: SongProps }) => {
  const [currSong, setCurrSong] = useState(song);

  const changeSong = (changedSong: SongProps) => {
    setCurrSong(changedSong);
  };

  const chooseFile = async (
    config: Electron.OpenDialogOptions,
    setPathFn: (arg0: string) => SongProps
  ) => {
    window.electron.dialog
      .openFile(config)
      .then((result) => setPathFn(result))
      .then((result) => {
        setCurrSong(result);
        return window.electron.store.songs.setSong(result);
      })
      .catch((err) => console.log(err));
  };

  const saveSong = (changedSong: SongProps) => {
    window.electron.store.songs.setSong(changedSong);
    setCurrSong(changedSong);
  };
  return (
    <>
      <div className="fields">
        <strong>Name: </strong>
        <EditText
          placeholder="song name"
          value={currSong.songName}
          onChange={(value: string) =>
            changeSong({ ...currSong, songName: value })
          }
          onSave={(event: {
            name: string;
            value: string;
            previousValue: string;
          }) => {
            saveSong({
              ...currSong,
              songName: event.value || event.previousValue,
            });
          }}
        />
      </div>
      <div className="fields">
        <strong>Artist: </strong>
        <EditText
          placeholder="song artist"
          value={currSong.artist}
          onChange={(value: string) =>
            changeSong({ ...currSong, artist: value })
          }
          onSave={(event: {
            name: string;
            value: string;
            previousValue: string;
          }) => {
            saveSong({
              ...currSong,
              artist: event.value || event.previousValue,
            });
          }}
        />
      </div>
      <div className="fields">
        <strong>Path: </strong>
        <p>{currSong.songPath}</p>
        <button
          type="button"
          data-testid="song-picker-button"
          onClick={() =>
            chooseFile(songPickerOptions, (path) => ({
              ...currSong,
              songPath: path,
            }))
          }
        >
          change file
        </button>
      </div>
      <div className="fields">
        <strong>Lyrics: </strong>
        <p>{currSong.lyricsPath}</p>
        <button
          type="button"
          data-testid="lyrics-picker-button"
          onClick={() =>
            chooseFile(lyricsPickerOptions, (path) => ({
              ...currSong,
              lyricsPath: path,
            }))
          }
        >
          change file
        </button>
      </div>
    </>
  );
};

export default Song;
