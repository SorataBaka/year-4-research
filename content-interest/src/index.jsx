import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<React.StrictMode>
		<ToastContainer
			position="top-right"
			autoClose={5000}
			limit={1}
			hideProgressBar
			newestOnTop={false}
			closeOnClick
			rtl={false}
			pauseOnFocusLoss={false}
			draggable={false}
			pauseOnHover={false}
			theme="light"
		/>
		<App />
	</React.StrictMode>
);
