import React, { useState, useEffect, type KeyboardEvent } from "react";
import { type Bookmark } from "../lib/bookmarkService";
import "../styles/index.css";

export interface UpdatedBookmarkData {
	title: string;
	url: string;
}

interface EditBookmarkProps {
	isOpen: boolean;
	bookmark: Bookmark;
	onAccept: (bookmarkId: string, updatedData: UpdatedBookmarkData) => void;
	onCancel: () => void;
	title?: string;
}

const EditBookmark: React.FC<EditBookmarkProps> = ({
	isOpen,
	bookmark,
	onAccept,
	onCancel,
	title = "Editar Marcador",
}) => {
	const [bookmarkUrl, setBookmarkUrl] = useState<string>("");
	const [bookmarkName, setBookmarkName] = useState<string>("");
	const [urlError, setUrlError] = useState<string | null>(null);
	const [nameError, setNameError] = useState<string | null>(null);

	useEffect(() => {
		if (isOpen && bookmark) {
			setBookmarkUrl(bookmark.url);
			setBookmarkName(bookmark.title);
			setUrlError(null);
			setNameError(null);
		}
	}, [isOpen, bookmark]);

	if (!isOpen || !bookmark) {
		return null;
	}

	const isValidUrl = (urlString: string): boolean => {
		try {
			new URL(urlString);
			return true;
		} catch (_) {
			return false;
		}
	};

	const handleAccept = () => {
		let isValid = true;
		const trimmedUrl = bookmarkUrl.trim();
		const trimmedName = bookmarkName.trim();

		if (!trimmedUrl) {
			setUrlError("La URL no puede estar vacía.");
			isValid = false;
		} else if (!isValidUrl(trimmedUrl)) {
			setUrlError("Por favor, introduce una URL válida.");
			isValid = false;
		} else {
			setUrlError(null);
		}

		if (!trimmedName) {
			setNameError("El nombre no puede estar vacío.");
			isValid = false;
		} else {
			setNameError(null);
		}

		if (isValid) {
			onAccept(bookmark.bookmark_id, { url: trimmedUrl, title: trimmedName });
		}
	};

	useEffect(() => {
		const handleEscKey = (event: globalThis.KeyboardEvent) => {
			if (event.key === "Escape") onCancel();
		};
		if (isOpen) document.addEventListener("keydown", handleEscKey);
		return () => document.removeEventListener("keydown", handleEscKey);
	}, [isOpen, onCancel]);

	const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) onCancel();
	};

	const isSubmitDisabled = !bookmarkUrl.trim() || !bookmarkName.trim();

	return (
		<div
			className="editar-carpeta-overlay"
			onClick={handleOverlayClick}
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title-edit-bookmark">
			<div className="editar-carpeta-content">
				<h2 id="modal-title-edit-bookmark" className="modal-title">
					{title}: {bookmark.title}
				</h2>
				<div className="modal-body">
					<div>
						<label htmlFor="editBookmarkUrlInput" className="label-block">
							URL del Marcador:
						</label>
						<input
							type="url"
							id="editBookmarkUrlInput"
							value={bookmarkUrl}
							className={`textfield bookmark-url-input ${urlError ? "input-error" : ""}`}
							autoFocus
							onChange={(e) => {
								setBookmarkUrl(e.target.value);
								if (urlError) setUrlError(null);
							}}
							onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
								if (e.key === "Enter" && !isSubmitDisabled) handleAccept();
							}}
						/>
						{urlError && <p className="error-message">{urlError}</p>}
					</div>
					<div style={{ marginTop: "1rem" }}>
						<label htmlFor="editBookmarkNameInput" className="label-block">
							Nombre del Marcador:
						</label>
						<input
							type="text"
							id="editBookmarkNameInput"
							value={bookmarkName}
							className={`textfield bookmark-url-input ${nameError ? "input-error" : ""}`}
							maxLength={100}
							onChange={(e) => {
								setBookmarkName(e.target.value);
								if (nameError) setNameError(null);
							}}
							onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
								if (e.key === "Enter" && !isSubmitDisabled) handleAccept();
							}}
						/>
						{nameError && <p className="error-message">{nameError}</p>}
					</div>
				</div>
				<div className="modal-footer">
					<button className="base-button edit-button" onClick={onCancel}>
						Cancelar
					</button>
					<button className="base-button accept-button" onClick={handleAccept} disabled={isSubmitDisabled}>
						Guardar Cambios
					</button>
				</div>
			</div>
		</div>
	);
};

export default EditBookmark;
