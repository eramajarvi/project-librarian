import "../styles/index.css";

function BookmarksFolders() {
	return (
		<div className="bookmarks-dropdown-wrapper">
			{/* <label htmlFor="bookmarksFolders"></label> */}
			<select id="bookmarksFolders" name="bookmarksFoldersSelector" className="bookmarks-dropdown">
				<option value="one">Option One</option>
				<option value="two">Option Two</option>
				<option value="three">Option Three</option>
			</select>
		</div>
	);
}

export default BookmarksFolders;
