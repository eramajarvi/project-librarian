import "../styles/index.css";
import React, { useEffect, type MouseEvent, type KeyboardEvent } from "react";
import { type Folder } from "../lib/dexie";

interface EditFolderProps {
	isOpen: boolean;
	title: string;
	folder: Folder;
	onAccept: (updatedFolder: Folder) => void;
	onCancel: () => void;
	onDeleteFolder: (folderId: string) => void;
	children?: React.ReactNode;
}

const emojiRegex = /^(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F)$/u;

const EditFolder: React.FC<EditFolderProps> = ({ isOpen, title, folder, onAccept, onCancel, onDeleteFolder }) => {
	const [folderName, setFolderName] = React.useState<string>(folder.folder_name);
	const [emojiValue, setEmojiValue] = React.useState<string>("");

	const handleEmojiChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const emojiInput = event.target.value;

		if (emojiRegex.test(emojiInput)) {
			setEmojiValue(emojiInput);
		} else {
			setEmojiValue("");
		}
	};

	useEffect(() => {
		setFolderName(folder.folder_name);
		setEmojiValue(folder.folder_emoji);
	}, [folder]);

	if (!isOpen) {
		return null;
	}

	const handleAccept = () => {
		const updatedFolder: Folder = {
			...folder,
			folder_name: folderName,
			folder_emoji: emojiValue,
		};
		onAccept(updatedFolder);
	};

	const handleDelete = () => {
		if (window.confirm(`¿Tienes la seguridad de que quieres eliminar la carpeta "${folder.folder_name}"?`)) {
			onDeleteFolder(folder.folder_id);
		}
	};

	useEffect(() => {
		const handleEscKey = (event: globalThis.KeyboardEvent) => {
			if (event.key === "Escape") {
				onCancel();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscKey);
		}

		return () => {
			document.removeEventListener("keydown", handleEscKey);
		};
	}, [isOpen, onCancel]);

	const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) {
			onCancel();
		}
	};

	return (
		<>
			<div
				className="editar-carpeta-overlay"
				onClick={handleOverlayClick}
				role="dialog"
				aria-modal="true"
				aria-labelledby="modal-title"
				aria-describedby="modal-body-content">
				<div className="editar-carpeta-content">
					<h2 id="modal-title" className="modal-title">
						{title}
					</h2>

					<div className="modal-body">
						<p>Cambia el emoji de la carpeta y su nombre. O elimínala</p>
						<input
							type="text"
							className="folder-emoji-input textfield"
							placeholder="📂"
							maxLength={2}
							value={emojiValue}
							onChange={handleEmojiChange}
							onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
								if (e.key === "Enter") {
									// onAccept();
								}
							}}
						/>
						<input
							type="text"
							id="FolderNameInput"
							value={folderName}
							maxLength={25}
							className="folder-name-input textfield"
							placeholder="nombre de la carpeta"
							autoFocus
							onChange={(e) => setFolderName(e.target.value)}
							onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
								if (e.key === "Enter") {
									// onAccept();
								}
							}}
						/>
						{/* {children} */}
					</div>

					<div className="modal-footer">
						<button className="base-button edit-button" onClick={onCancel}>
							Cancelar
						</button>
						<button className="base-button delete-button" onClick={handleDelete}>
							Eliminar carpeta
						</button>
						<button className="base-button accept-button" onClick={handleAccept}>
							Guardar cambios
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default EditFolder;
