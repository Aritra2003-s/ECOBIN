import './Loader.css';

export default function Loader({ fullscreen = false, text = 'Loading...' }) {
  return (
    <div className={`loader ${fullscreen ? 'loader--fullscreen' : ''}`}>
      <div className="loader__spinner" />
      <span className="loader__text">{text}</span>
    </div>
  );
}
