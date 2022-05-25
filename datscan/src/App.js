import ViewerRoot from './components/ViewerRoot';
import ViewerVolumeRoot from './components/ViewerVolumeRoot';
import ViewerCrosshair from './components/ViewerCrosshair';

function App() {

  return (
    <div className="App">
      <header className="App-head">
        <div className='content'></div>
        {/* <ViewerRoot></ViewerRoot> */}
        <ViewerCrosshair></ViewerCrosshair>
      </header>
    </div>
  );
}

export default App;
