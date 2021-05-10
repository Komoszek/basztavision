import React from "react";

const ContextMenu = React.createContext({top: 0,
  left: 0,
  setTop: () => {},
  setLeft: () => {}
  }
);


export default ContextMenu;
