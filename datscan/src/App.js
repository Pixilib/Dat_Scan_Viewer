import './App.css';
import ViewerRoot from './components/ViewerRoot';
import ViewerVolumeRoot from './components/ViewerVolumeRoot';


function App() {
  return (
    <div className="App">
      <header className="App-head">
        <div className='content'></div>
        {/* <ViewerRoot></ViewerRoot> */}
        <ViewerVolumeRoot></ViewerVolumeRoot>
      </header>
    </div>
  );
}

export default App;
