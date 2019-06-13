import React from "react";
import Loader from "./logo.svg";
import "./App.css";
import Beers from "./Beers";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Beers />
      </header>
    </div>
  );
}

export default App;
