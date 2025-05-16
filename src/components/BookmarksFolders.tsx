import "../styles/index.css";

function BookmarksFolders() {
	return (
		<div className="bookmarks-dropdown-wrapper">
			{/* <label htmlFor="bookmarksFolders"></label> */}
			<select id="bookmarksFolders" name="bookmarksFoldersSelector" className="bookmarks-dropdown">
				<button className="arrow-wrapper">
					<selectedcontent></selectedcontent>
					<div className="arrow-container">
						<div className="arrow"></div>
					</div>
				</button>

				<option value="one">
					<p>🦁</p>
					<div>general</div>
				</option>

				<option value="two">
					<p>✨</p>
					<div>Showgaze playlists playlistsplaylists</div>
				</option>

				<option value="three">
					<p>😘</p>
					<div>Tools</div>
				</option>

				<option value="four">
					<p>🚨</p>
					<div>components</div>
				</option>
			</select>
		</div>
	);
}

export default BookmarksFolders;
