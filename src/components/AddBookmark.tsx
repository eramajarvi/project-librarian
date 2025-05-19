import "../styles/index.css";
import React, { useState, useEffect, type MouseEvent, type KeyboardEvent } from "react";

export interface NewBookmarkData {
	url: string;
	name: string;
}

interface AddBookmarkProps {
	isOpen: boolean;
	folderId: string;
	onAccept: (newBookmarkData: NewBookmarkData, folderId: string) => void;
	onCancel: () => void;
	title?: string;
}

const AddBookmark: React.FC<AddBookmarkProps> = ({
	isOpen,
	folderId,
	onAccept,
	onCancel,
	title = "Añadir nuevo marcador",
}) => {
	const [bookmarkUrl, setBookmarkUrl] = useState<string>("");
	const [bookmarkName, setBookmarkName] = useState<string>("");
	const [urlError, setUrlError] = useState<string | null>(null);
	const [nameError, setNameError] = useState<string | null>(null);

	useEffect(() => {
		if (isOpen) {
			setBookmarkUrl("");
			setBookmarkName("");
			setUrlError(null);
			setNameError(null);
		}
	}, [isOpen]);

	if (!isOpen) {
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
			setUrlError("Por favor, introduce una URL válida (ej: https://midu.dev)");
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
			onAccept({ url: trimmedUrl, name: trimmedName }, folderId);
		}
	};

	useEffect(() => {
		const handleEscKey = (event: globalThis.KeyboardEvent) => {
			if (event.key === "Escape") onCancel();
		};
		if (isOpen) document.addEventListener("keydown", handleEscKey);
		return () => document.removeEventListener("keydown", handleEscKey);
	}, [isOpen, onCancel]);

	const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) onCancel();
	};

	const isSubmitDisabled = !bookmarkUrl.trim() || !bookmarkName.trim();

	return (
		<div
			className="editar-carpeta-overlay"
			onClick={handleOverlayClick}
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title-add-bookmark">
			<div className="editar-carpeta-content">
				{" "}
				<h2 id="modal-title-add-bookmark" className="modal-title">
					{title}
				</h2>
				<div className="modal-body">
					<div>
						<label htmlFor="bookmarkUrlInput">URL del Marcador:</label>
						<input
							type="url"
							id="bookmarkUrlInput"
							value={bookmarkUrl}
							className={`textfield ${urlError ? "input-error" : ""}`}
							placeholder="https://ejemplo.com"
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
						<label htmlFor="bookmarkNameInput">Nombre del Marcador:</label>
						<input
							type="text"
							id="bookmarkNameInput"
							value={bookmarkName}
							className={`textfield ${nameError ? "input-error" : ""}`}
							placeholder="Nombre descriptivo"
							maxLength={50}
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
					<button className="base-button secondary-button" onClick={onCancel}>
						Cancelar
					</button>
					<button className="base-button accept-button" onClick={handleAccept} disabled={isSubmitDisabled}>
						Guardar Marcador
					</button>
				</div>
			</div>
		</div>
	);
};

export default AddBookmark;
