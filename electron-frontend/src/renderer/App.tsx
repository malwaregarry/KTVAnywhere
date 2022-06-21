import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Grid,
  Container,
  CssBaseline,
  Snackbar,
} from '@mui/material';
import { LeftSidebar, RightSidebar } from '../components/Sidebar';
import QueueList from '../components/SongsQueue';
import {
  emptySongProps,
  SongProps,
  SongDialogProvider,
  SongDialog,
  useSongsStatus,
  SongsStatusProvider,
} from '../components/Song';
import SongList from '../components/SongList';
import {
  SongUploadButton,
  SongStagingDialog,
  SongStagingDialogProvider,
} from '../components/SongUpload';
import {
  AlertMessageProvider,
  useAlertMessage,
} from '../components/Alert.context';
import { AudioStatusProvider } from '../components/AudioPlayer/AudioStatus.context';
import AudioPlayer from '../components/AudioPlayer';
import LyricsPlayer, { LyricsProvider } from '../components/LyricsPlayer';
import './App.css';
import {
  ConfirmationDialog,
  ConfirmationProvider,
} from '../components/ConfirmationDialog';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ABFF95',
    },
  },
  typography: {
    button: {
      textTransform: 'none',
    },
  },
});

const MainPage = () => {
  const [openSong, setOpenSong] = useState<SongProps>(emptySongProps);
  const [uploadedSongs, setUploadedSongs] = useState<SongProps[]>([]);
  const { songsStatus, setSongsStatus } = useSongsStatus();
  const [songInSpleeter, setSongInSpleeter] = useState<string | null>(null);
  const {
    alertMessage,
    setAlertMessage,
    showAlertMessage,
    setShowAlertMessage,
  } = useAlertMessage();

  useEffect(() => {
    const spleeterProcessSongUnsubscribe =
      window.electron.preprocess.spleeterProcessResult(
        ({ vocalsPath, accompanimentPath, songId, error }) => {
          if (!error) {
            const songProcessedSuccessfully =
              window.electron.store.songs.getSong(songId);
            const changedSong = {
              ...songProcessedSuccessfully,
              vocalsPath,
              accompanimentPath,
            };
            window.electron.store.songs.setSong(changedSong);
            setAlertMessage({
              message: `Vocals separated successfully for ${songProcessedSuccessfully.songName}`,
              severity: 'success',
            });
            setShowAlertMessage(true);
          } else {
            console.error(error);
            setAlertMessage({
              message: error.message,
              severity: 'error',
            });
            setShowAlertMessage(true);
          }
          setSongsStatus((state) => state.slice(1));
        }
      );

    return () => {
      spleeterProcessSongUnsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (songsStatus.length === 0 && songInSpleeter) {
      setSongInSpleeter(null);
    } else if (
      songsStatus.length !== 0 &&
      (!songInSpleeter || songInSpleeter !== songsStatus[0])
    ) {
      const nextSongId = songsStatus[0];
      const toProcess = window.electron.store.songs.getSong(nextSongId);
      setSongInSpleeter(nextSongId);
      window.electron.preprocess.spleeterProcessSong(toProcess);
    }
  }, [songInSpleeter, songsStatus]);

  return (
    <Container>
      <CssBaseline enableColorScheme />
      <Snackbar
        open={showAlertMessage}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={(_event, reason) => {
          if (reason === 'clickaway') return;
          setShowAlertMessage(false);
        }}
      >
        <Alert
          variant="filled"
          severity={alertMessage.severity}
          action={
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              onClick={() => setShowAlertMessage(false)}
            >
              Close
            </Button>
          }
        >
          {alertMessage.message}
        </Alert>
      </Snackbar>
      <Container
        maxWidth={false}
        sx={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: '130px',
        }}
      >
        <ConfirmationProvider>
          <SongStagingDialogProvider>
            <SongDialogProvider>
              <LeftSidebar>
                <SongUploadButton setUploadedSongs={setUploadedSongs} />
                <SongList setOpenSong={setOpenSong} />
                <SongDialog song={openSong} setSong={setOpenSong} />
                <ConfirmationDialog />
                <SongStagingDialog
                  uploadedSongs={uploadedSongs}
                  setUploadedSongs={setUploadedSongs}
                />
              </LeftSidebar>
            </SongDialogProvider>
          </SongStagingDialogProvider>
        </ConfirmationProvider>
        <Grid container direction="column" alignItems="center">
          <Grid
            item
            sx={{
              position: 'absolute',
              bottom: '0',
              left: '330px',
              right: '330px',
              px: '2%',
              pb: '1%',
            }}
          >
            <LyricsPlayer />
          </Grid>
        </Grid>
        <RightSidebar>
          <QueueList />
        </RightSidebar>
      </Container>
      <Container
        maxWidth={false}
        sx={{
          bgcolor: '#1f2232',
          height: '130px',
          position: 'fixed',
          left: 0,
          bottom: 0,
        }}
      >
        <AudioPlayer />
      </Container>
    </Container>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <ThemeProvider theme={darkTheme}>
              <AlertMessageProvider>
                <SongsStatusProvider>
                  <AudioStatusProvider>
                    <LyricsProvider>
                      <MainPage />
                    </LyricsProvider>
                  </AudioStatusProvider>
                </SongsStatusProvider>
              </AlertMessageProvider>
            </ThemeProvider>
          }
        />
      </Routes>
    </Router>
  );
}
